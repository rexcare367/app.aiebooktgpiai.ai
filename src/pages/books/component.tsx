import React, { useState, useEffect, useRef } from "react";

import BookCardItem from "../../components/bookCardItem";
import BookListItem from "../../components/bookListItem";
import BookCoverItem from "../../components/bookCoverItem";
import LoadingSkeleton from "../../features/books/BookSkeleton";
import DownloadingLoader from "../../components/loading/DownloadingLoader";
import EmptyPage from "../../pages/emptyPage/component";
import ShelfUtil from "../../utils/readUtils/shelfUtil";
import BookModel from "../../models/Book";
import { useDownloadingState } from "../../hooks/useDownloadingState";

import { BookListProps } from "./interface";
import StorageUtil from "../../utils/serviceUtils/storageUtil";
import { fetchMD5 } from "../../utils/fileUtils/md5Util";
import { useHistory, useLocation } from "react-router-dom";
import BookUtil from "../../utils/fileUtils/bookUtil";
import RecordRecent from "../../utils/readUtils/recordRecent";

import toast from "react-hot-toast";
import axios from "axios";
import api from "../../utils/axios";

import Manager from "../../pages/manager";
import authService, { UserData } from "../../utils/authService";

declare var window: any;
let clickFilePath = "";

const shelfList = ["Comics", "Storybooks", "History", "Moral Education", "Biographies", "Popular Science"];
const languageList = ["Malay", "English", "Mandarin"];

const BookList: React.FC<BookListProps> = (props) => {
  const userData: UserData | null = authService.getUserData();
  const user_id = userData?.id;
  const userIc = userData?.ic_number;

  const history = useHistory();
  const location = useLocation();
  const [favoriteBooks, setFavoriteBooks] = useState<string[]>([]);
  const [isOpenFile, setIsOpenFile] = useState(false);
  const [books, setBooks] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isShelfDropdownOpen, setIsShelfDropdownOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const shelfDropdownRef = useRef<HTMLDivElement>(null);
  const languageDropdownRef = useRef<HTMLDivElement>(null);
  
  // Downloading state management
  const { downloadingState, startDownloading, updateProgress, finishDownloading, cancelDownloading } = useDownloadingState();

  const queryParams = new URLSearchParams(location.search);
  const selectedShelves = queryParams.get("genres")?.split(",") || shelfList;
  const selectedLanguages = queryParams.get("lang")?.split(",") || languageList;
  const currentPage = parseInt(queryParams.get("page") || "1");
  const pageSize = parseInt(queryParams.get("pageSize") || "24");
  const genres = queryParams.get("genres") || shelfList.join(",");
  const lang = queryParams.get("lang") || languageList.join(",");
  const order = queryParams.get("order") || "ASC";
  const orderBy = queryParams.get("orderBy") || "title";
  const keyword = queryParams.get("keyword") || "";

  const loadBookList = async () => {
    const { mode } = props;
    setBooks([]);
    props.handleLoadingBook(true);

    try {
      const response = await api.get(
        `/api/ebooks/list?page=${currentPage}&limit=${pageSize}&keyword=${keyword}&order=${order}&orderBy=${orderBy}&mode=${mode}&user_id=${userIc}&lang=${lang}&genres=${genres}`
      );

      const books = response.data.data.map((book: any) => ({
        ...book,
        key: book.id,
        format: book.title.split(".").pop(),
        name: book.title,
        source_url: book.url,
        thumb_url: book.thumb_url,
        size: book.size,
        upload_time: book.upload_time,
      }));

      setTotalItems(response.data.total);
      setBooks(books);

      window.localforage.setItem("books", books).then(() => {
        props.handleFetchBooks();
      });
    } catch (error) {
      console.error("[BookList] Error loading books:", error);
      toast.error("Failed to load books");
    } finally {
      props.handleLoadingBook(false);
    }
  };

  const loadHighlights = async () => {
    try {
      const response = await api.get(`/api/highlights/getByUserIC/${userIc}`);
      const noteArr = response.data.data;
      window.localforage.setItem("notes", noteArr);
    } catch (error) {
      console.error("[BookList] Error loading highlights:", error);
    }
  };

  const loadFavoriteBooks = async () => {
    try {
      const response = await api.get(`/api/users/favorites/${user_id}`);
      const favoriteBooks = response.data.data;
      setFavoriteBooks(favoriteBooks);
    } catch (error) {
      console.error("[BookList] Error loading favorite books:", error);
    }
  };

  const getFileFormat = (filename: string) => {
    const parts = filename.split(".");
    const format = parts.length > 1 ? parts[parts.length - 1] : "";
    let type = "application/pdf";
    if (format === "epub") type = "application/epub+zip";
    return { format, type };
  };

  const lazyLoad = () => {
    const lazyImages: any = document.querySelectorAll(".lazy-image");
    lazyImages.forEach((lazyImage: any) => {
      if (isElementInViewport(lazyImage) && lazyImage.dataset.src) {
        lazyImage.src = lazyImage.dataset.src;
        lazyImage.classList.remove("lazy-image");
      }
    });
  };

  const isElementInViewport = (element: any) => {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  };

  const loadContentBook = async (book: BookModel) => {
    // Start downloading state
    startDownloading(book.name || 'Unknown Book', book.key);
    updateProgress(10);
    
    
    try {
      await new Promise<void>((resolve, reject) => {
        book.source_url = book.source_url.replace(/_/g, "+");
        updateProgress(20);

        axios.get<ArrayBuffer>(book.source_url, { 
          responseType: "arraybuffer",
          onDownloadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              updateProgress(Math.min(90, 20 + (progress * 0.7))); // Scale to 20-90%
            }
          }
        }).then(async (res) => {
          updateProgress(90);
          const arrayBuffer = res.data;
          const { type, format } = getFileFormat(book.file_key);
          const blob = new Blob([new Uint8Array(arrayBuffer)], { type });
          const file = new File([blob], `${book.name}.${format}`, { type });

          await getMd5WithBrowser(file, book.file_key, book.thumbnail, book.thumb_url, book.source_url, book.key);
          updateProgress(100);

          resolve();
          finishDownloading();
        }).catch((error) => {
          console.error('Error downloading book:', error);
          cancelDownloading();
          reject(error);
        });
      });
    } catch (error) {
      console.error('Error in loadContentBook:', error);
      cancelDownloading();
      throw error;
    }
    
    return book.key;
  };

  const handleJump = (book: BookModel) => {
    localStorage.setItem("tempBook", JSON.stringify(book));
    BookUtil.RedirectBook(book, props.t, history);
  };

  const handleToggleFavorite = async (book: any) => {
    try {
      const isCurrentlyFavorite = favoriteBooks.includes(book.key);
      
      if (isCurrentlyFavorite) {
        // Remove from favorites
        await api.post(`/api/users/remove-favorite`, {
          user_id: user_id,
          book_id: book.key
        });
        setFavoriteBooks(prev => prev.filter(key => key !== book.key));
        toast.success("Removed from favorites");
      } else {
        // Add to favorites
        await api.post(`/api/users/add-favorite`, {
          user_id: user_id,
          book_id: book.key
        });
        setFavoriteBooks(prev => [...prev, book.key]);
        toast.success("Added to favorites");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Failed to update favorites");
    }
  };

  const handleAddBook = async (book: BookModel, buffer: ArrayBuffer) => {
    return new Promise<void>((resolve, reject) => {
      if (isOpenFile) {
        StorageUtil.getReaderConfig("isImportPath") !== "yes" &&
          StorageUtil.getReaderConfig("isPreventAdd") !== "yes" &&
          BookUtil.addBook(book.key, buffer);
        if (StorageUtil.getReaderConfig("isPreventAdd") === "yes") {
          handleJump(book);
          setIsOpenFile(false);
          return resolve();
        }
      } else {
        StorageUtil.getReaderConfig("isImportPath") !== "yes" && BookUtil.addBook(book.key, buffer);
      }

      let bookArr = [...(props.books || []), ...props.deletedBooks];
      if (bookArr == null) {
        bookArr = [];
      }

      let index = bookArr.findIndex((b) => b.file_key === book.file_key);
      if (index !== -1) {
        bookArr[index] = book;
      } else {
        bookArr.push(book);
      }

      props.handleReadingBook(book);
      RecordRecent.setRecent(book.key);
      window.localforage
        .setItem("books", bookArr)
        .then(() => {
          props.handleFetchBooks();
          if (props.mode === "shelf") {
            let shelfTitles = Object.keys(ShelfUtil.getShelf());
            ShelfUtil.setShelf(shelfTitles[props.shelfIndex], book.key);
          }
          setTimeout(() => {
            isOpenFile && handleJump(book);
            if (StorageUtil.getReaderConfig("isOpenInMain") === "yes" && isOpenFile) {
              setIsOpenFile(false);
              return;
            }
            setIsOpenFile(false);
          }, 100);
          return resolve();
        })
        .catch(() => {
          toast.error(props.t("Import failed"));
          return resolve();
        });
    });
  };

  const getMd5WithBrowser = async (
    file: any,
    file_key: string = "",
    thumbnail: string = "",
    thumb_url: string = "",
    source_url: string = "",
    key: string = ""
  ) => {
    return new Promise<void>(async (resolve, reject) => {
      const md5 = await fetchMD5(file);
      if (!md5) {
        toast.error(props.t("Import failed"));
        return resolve();
      } else {
        try {
          await handleBook(file, md5, file_key, thumbnail, thumb_url, source_url, key);
        } catch (error) {
          // Handle error silently
        }
        return resolve();
      }
    });
  };

  const handleBook = (
    file: any,
    md5: string,
    file_key: string,
    thumbnail: string,
    thumb_url: string,
    source_url: string,
    key: string = ""
  ) => {
    let extension = (file.name as string).split(".").reverse()[0].toLocaleLowerCase();
    let bookName = file.name.substr(0, file.name.length - extension.length - 1);
    let result: BookModel | string;
    return new Promise<void>((resolve, reject) => {
      let isRepeat = false;
      if (props.books.length > 0) {
        props.books.forEach((item) => {
          if (item.md5 === md5 && item.size === file.size) {
            isRepeat = true;
            if (!key) return resolve();
          }
        });
      }
      if (props.deletedBooks.length > 0) {
        props.deletedBooks.forEach((item) => {
          if (item.md5 === md5 && item.size === file.size) {
            isRepeat = true;
            toast.error(props.t("Duplicate book in trash bin"));
            if (!key) return resolve();
          }
        });
      }
      if (!isRepeat || !!key) {
        let reader = new FileReader();
        reader.readAsArrayBuffer(file);

        reader.onload = async (e) => {
          if (!e.target) {
            toast.error(props.t("Import failed"));
            return resolve();
          }
          let reader = new FileReader();
          reader.onload = async (event) => {
            const file_content = (event.target as any).result;
            try {
              result = await BookUtil.generateBook(
                bookName,
                extension,
                md5,
                file.size,
                file.path || clickFilePath,
                file_content,
                file_key,
                thumbnail,
                thumb_url,
                source_url,
                key
              );
              if (result === "get_metadata_error") {
                toast.error(props.t("Import failed"));
                return resolve();
              }
              if (!!key) {
                (result as BookModel).key = key;
              }
            } catch (error) {
              throw error;
            }

            clickFilePath = "";
            await handleAddBook(result as BookModel, file_content as ArrayBuffer);

            return resolve();
          };
          reader.readAsArrayBuffer(file);
        };
      }
    });
  };

  const updateUrl = (
    selectedShelves: string[],
    selectedLanguages: string[],
    currentPage: number,
    pageSize: number,
    order: string = "asc",
    orderBy: string = "title"
  ) => {

    const searchParams = new URLSearchParams(location.search);

    // Update only the specified parameters
    if (selectedShelves.length > 0) {
      searchParams.set("genres", selectedShelves.join(","));
    } else {
      searchParams.delete("genres");
    }

    if (selectedLanguages.length > 0) {
      searchParams.set("lang", selectedLanguages.join(","));
    } else {
      searchParams.delete("lang");
    }

    searchParams.set("page", currentPage.toString());
    searchParams.set("pageSize", pageSize.toString());

    if (order) {
      searchParams.set("order", order);
    }
    if (orderBy) {
      searchParams.set("orderBy", orderBy);
    }

    if (keyword) {
      searchParams.set("keyword", keyword);
    } else {
      searchParams.delete("keyword");
    }

    const queryString = searchParams.toString();
    history.replace({
      pathname: location.pathname,
      search: queryString ? `?${queryString}` : "",
      hash: location.hash,
    });

    // Call loadBookList after URL and state updates
  };

  const renderBookList = () => {
    const bookItems = books;
    setTimeout(() => {
      lazyLoad();
    }, 0);
    let listElements = document.querySelector(".book-list-item-box");
    let covers = listElements?.querySelectorAll("img");
    covers?.forEach((cover) => {
      if (!cover.classList.contains("lazy-image")) {
        cover.classList.add("lazy-image");
      }
    });
    return (
      <React.Fragment>
        {bookItems &&
          bookItems.map((item: any, index: number) => {
            const isFavorite = favoriteBooks.includes(item.key);
            return props.viewMode === "list" ? (
              <BookListItem
                {...{
                  key: index,
                  book: item,
                  loadContentBook,
                  loadBookList,
                  isSelected: props.selectedBooks.indexOf(item.key) > -1,
                  isFavorite,
                }}
              />
            ) : props.viewMode === "card" ? (
              <BookCardItem
                key={index}
                book={item}
                isFavorite={isFavorite}
                t={props.t}
                handleReadingBook={props.handleReadingBook}
                loadContentBook={loadContentBook}
                onToggleFavorite={handleToggleFavorite}
              />
            ) : (
              <BookCoverItem
                {...{
                  key: index,
                  book: item,
                  loadContentBook,
                  loadBookList,
                  isSelected: props.selectedBooks.indexOf(item.key) > -1,
                  isFavorite,
                }}
              />
            );
          })}
      </React.Fragment>
    );
  };

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shelfDropdownRef.current && !shelfDropdownRef.current.contains(event.target as Node)) {
        setIsShelfDropdownOpen(false);
      }
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setIsLanguageDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    loadHighlights();
  }, []);

  useEffect(() => {
    loadFavoriteBooks();
  }, []);

  useEffect(() => {
    loadBookList();
  }, [order, orderBy, currentPage, keyword, genres, lang]);

  let bookListContent;
  if (!props.books || !props.books[0]) {
    bookListContent = <EmptyPage mode="empty" isCollapsed={false} />;
  } else {
    bookListContent = (
      <>
        <div className="relative h-full rounded-xl p-4 ">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-6 flex justify-between">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium text-gray-900 dark:text-gray-100">{Math.min((currentPage - 1) * pageSize + 1, totalItems)}</span>{" "}
                  - <span className="font-medium text-gray-900 dark:text-gray-100">{Math.min(currentPage * pageSize, totalItems)}</span> of{" "}
                  <span className="font-medium text-gray-900 dark:text-gray-100">{totalItems}</span>
                </span>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      const newPage = currentPage - 1;
                      if (newPage >= 1) {
                        updateUrl(selectedShelves, selectedLanguages, newPage, pageSize, order, orderBy);
                      }
                    }}
                    disabled={currentPage === 1}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:bg-white dark:disabled:hover:border-gray-600 dark:disabled:hover:bg-gray-700 shadow-sm"
                    aria-label="Previous page"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-gray-900 dark:text-gray-100">{currentPage}</span>
                    <span className="text-gray-500 dark:text-gray-400">/</span>
                    <span className="text-gray-500 dark:text-gray-400">{Math.ceil(totalItems / pageSize)}</span>
                  </div>
                  <button
                    onClick={() => {
                      const newPage = currentPage + 1;
                      if (newPage <= Math.ceil(totalItems / pageSize)) {
                        updateUrl(selectedShelves, selectedLanguages, newPage, pageSize, order, orderBy);
                      }
                    }}
                    disabled={currentPage >= Math.ceil(totalItems / pageSize)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:bg-white dark:disabled:hover:border-gray-600 dark:disabled:hover:bg-gray-700 shadow-sm"
                    aria-label="Next page"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
                <select
                  value={`${orderBy}-${order}`}
                  onChange={(e) => {
                    const [newOrderBy, newOrder] = e.target.value.split("-");
                    updateUrl(selectedShelves, selectedLanguages, currentPage, pageSize, newOrder, newOrderBy);
                  }}
                  className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
                >
                  <option value="title-asc">Title (A-Z)</option>
                  <option value="title-desc">Title (Z-A)</option>
                </select>
            </div>
            <div className="flex flex-row gap-3">
              {/* Shelves Dropdown */}
              <div className="relative" ref={shelfDropdownRef}>
                <button
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-all duration-200 border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    isShelfDropdownOpen 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-lg' 
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:border-blue-400 dark:hover:text-blue-400 shadow-sm hover:shadow-md'
                  }`}
                  onClick={() => setIsShelfDropdownOpen((prev) => !prev)}
                  aria-expanded={isShelfDropdownOpen}
                  aria-haspopup="true"
                  role="button"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span>Shelves</span>
                  <span 
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      isShelfDropdownOpen 
                        ? 'bg-white/20 text-white' 
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    {selectedShelves.length}
                  </span>
                  <svg 
                    className={`w-4 h-4 transition-transform duration-200 ${isShelfDropdownOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isShelfDropdownOpen && (
                  <div 
                    className="absolute z-50 mt-2 w-64 rounded-xl shadow-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 backdrop-blur-sm animate-in fade-in-0 zoom-in-95 duration-200"
                  >
                    <div className="p-2">
                      <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Select Shelves
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {shelfList.map((shelf) => (
                          <label 
                            key={shelf} 
                            className="flex items-center px-3 py-2.5 cursor-pointer rounded-lg transition-colors duration-150 text-gray-700 dark:text-gray-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
                          >
                            <input
                              type="checkbox"
                              checked={selectedShelves.includes(shelf)}
                              onChange={() => {
                                const newSelectedShelves = selectedShelves.includes(shelf)
                                  ? selectedShelves.filter((s) => s !== shelf)
                                  : [...selectedShelves, shelf];
                                updateUrl(newSelectedShelves, selectedLanguages, currentPage, pageSize);
                              }}
                              className="w-4 h-4 rounded border-2 border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 transition-colors duration-150"
                            />
                            <span className="ml-3 text-sm font-medium">{shelf}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Languages Dropdown */}
              <div className="relative" ref={languageDropdownRef}>
                <button
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-all duration-200 border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    isLanguageDropdownOpen 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-lg' 
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:border-blue-400 dark:hover:text-blue-400 shadow-sm hover:shadow-md'
                  }`}
                  onClick={() => setIsLanguageDropdownOpen((prev) => !prev)}
                  aria-expanded={isLanguageDropdownOpen}
                  aria-haspopup="true"
                  role="button"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                  <span>Languages</span>
                  <span 
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      isLanguageDropdownOpen 
                        ? 'bg-white/20 text-white' 
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    {selectedLanguages.length}
                  </span>
                  <svg 
                    className={`w-4 h-4 transition-transform duration-200 ${isLanguageDropdownOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isLanguageDropdownOpen && (
                  <div 
                    className="absolute z-50 mt-2 w-64 rounded-xl shadow-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 backdrop-blur-sm animate-in fade-in-0 zoom-in-95 duration-200"
                  >
                    <div className="p-2">
                      <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Select Languages
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {languageList.map((language) => (
                          <label 
                            key={language} 
                            className="flex items-center px-3 py-2.5 cursor-pointer rounded-lg transition-colors duration-150 text-gray-700 dark:text-gray-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
                          >
                            <input
                              type="checkbox"
                              checked={selectedLanguages.includes(language)}
                              onChange={() => {
                                const newSelectedLanguages = selectedLanguages.includes(language)
                                  ? selectedLanguages.filter((l) => l !== language)
                                  : [...selectedLanguages, language];
                                updateUrl(selectedShelves, newSelectedLanguages, currentPage, pageSize);
                              }}
                              className="w-4 h-4 rounded border-2 border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 transition-colors duration-150"
                            />
                            <span className="ml-3 text-sm font-medium">{language}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {props.isLoadingBook && (
            <div className=" w-full">
              <LoadingSkeleton />
            </div>
          )}
          <ul
            className="bg-white dark:bg-gray-800 w-full h-[calc(100vh_-_180px)] overflow-auto grid 2xl:grid-cols-6 xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-2 justify-items-center rounded-xl"
            onScroll={() => {
              lazyLoad();
            }}
          >
            {renderBookList()}
          </ul>
        </div>
        {/* <div className="book-list-header">
          <SelectBook />
          <div style={props.isSelectBook ? { display: "none" } : {}}>
            <ViewMode />
          </div>
        </div> */}
      </>
    );
  }

  StorageUtil.setReaderConfig("totalBooks", props.books?.length?.toString());

  return (
    <Manager>
      {bookListContent}
      <DownloadingLoader
        isVisible={downloadingState.isDownloading}
        bookTitle={downloadingState.bookTitle}
        progress={downloadingState.progress}
        onCancel={cancelDownloading}
      />
    </Manager>
  );
};

export default BookList;
