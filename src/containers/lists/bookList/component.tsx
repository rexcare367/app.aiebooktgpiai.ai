import React from "react";
import "./booklist.css";
import BookCardItem from "../../../components/bookCardItem";
import BookListItem from "../../../components/bookListItem";
import BookCoverItem from "../../../components/bookCoverItem";
import Loading from "../../../components/loading/component";
import EmptyPage from "../../../containers/emptyPage/component";
import ShelfUtil from "../../../utils/readUtils/shelfUtil";
import BookModel from "../../../models/Book";
import { BookListProps, BookListState } from "./interface";
import StorageUtil from "../../../utils/serviceUtils/storageUtil";
import { fetchMD5 } from "../../../utils/fileUtils/md5Util";
import { withRouter } from "react-router-dom";
import ViewMode from "../../../components/viewMode";
import BookUtil from "../../../utils/fileUtils/bookUtil";
import RecordRecent from "../../../utils/readUtils/recordRecent";
import SelectBook from "../../../components/selectBook";
import toast from "react-hot-toast";
import axios from "axios";
import api from "../../../utils/axios";
import Pagination from "rc-pagination";
import "rc-pagination/assets/index.css";
import { getCurrentUser } from "@aws-amplify/auth";
import Manager from "../../../pages/manager";

declare var window: any;
let clickFilePath = "";

class BookList extends React.Component<BookListProps, BookListState> {
  constructor(props: BookListProps) {
    super(props);
    this.state = {
      isOpenDelete: false,
      favoriteBooks: [],
      isHideShelfBook: StorageUtil.getReaderConfig("isHideShelfBook") === "yes",
      isRefreshing: false,
      isOpenFile: false,
      width: document.body.clientWidth,
      books: [],
      currentPage: 1,
      pageSize: 24,
      totalItems: 0,
      order: "ASC",
      orderBy: "title",
    };
  }

  UNSAFE_componentWillMount() {
    this.props.handleFetchBooks();
  }

  async componentDidMount() {
    setTimeout(() => {
      this.lazyLoad();
      window.addEventListener("scroll", this.lazyLoad);
      window.addEventListener("resize", this.lazyLoad);
    }, 0);
    await this.loadFavoriteBooks();
    this.loadBookList();
    this.loadHighlights();
  }

  componentDidUpdate(prevProps: BookListProps) {
    if (this.props.keyword !== prevProps.keyword) {
      this.loadBookList();
    }
  }

  loadHighlights = async () => {
    const { username } = await getCurrentUser();
    await api.get(`/api/highlights/getByUserIC/${username}`).then((res) => {
      const noteArr = res.data.data;
      window.localforage.setItem("notes", noteArr);
    });
  };

  loadFavoriteBooks = async () => {
    const { username } = await getCurrentUser();
    await api.get(`/api/ebooks/favorites/${username}`).then((res) => {
      const favoriteBooks = res.data.data;
      this.setState({ favoriteBooks });
    });
  };

  loadBookList = async () => {
    const { username } = await getCurrentUser();
    const { keyword, mode } = this.props;
    this.setState({ books: [] });
    const { currentPage, pageSize, order, orderBy } = this.state;
    this.props.handleLoadingBook(true);

    try {
      // 1. First load just the book metadata
      const response = await api.get(
        `/api/ebooks/list?page=${currentPage}&limit=${pageSize}&keyword=${keyword}&order=${order}&orderBy=${orderBy}&mode=${mode}&user_id=${username}`
      );

      const books = response.data.data.map((book: any, index: number) => ({
        ...book,
        key: book.id, //continue to work here
        format: book.title.split(".").pop(),
        name: book.title,
        source_url: book.url,
        thumb_url: book.thumb_url,
        size: book.size,
        upload_time: book.upload_time,
      }));
      this.setState({ totalItems: response.data.total });
      this.setState({ books: books });

      // Update books in store with the new page data
      window.localforage.setItem("books", books).then(() => {
        this.props.handleFetchBooks();
      });

      // Prefetch next page metadata
      if (currentPage * pageSize < response.data.total) {
        this.prefetchNextPage();
      }
    } catch (error) {
      console.error("Error loading books:", error);
      toast.error("Failed to load books");
    } finally {
      this.props.handleLoadingBook(false);
    }
  };

  getFileFormat = (filename: string) => {
    const parts = filename.split(".");
    const format = parts.length > 1 ? parts[parts.length - 1] : "";
    let type = "application/pdf";
    if (format === "epub") type = "application/epub+zip";
    return { format, type };
  };

  prefetchNextPage = async () => {
    const { keyword } = this.props;
    const { currentPage, pageSize, order, orderBy } = this.state;

    try {
      const nextPage = currentPage + 1;
      await api.get(
        `/api/ebooks/list?page=${nextPage}&limit=${pageSize}&keyword=${keyword}&order=${order}&orderBy=${orderBy}`
      );
    } catch (error) {
      console.error("Error prefetching next page:", error);
    }
  };

  renderBookList = () => {
    let books = this.state.books;
    if (books?.length === 0 && !this.props.isSearch) {
      console.log("EMPTY");
    }
    setTimeout(() => {
      this.lazyLoad();
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
        {books &&
          books.map((item: any, index: number) => {
            const isFavorite = this.state.favoriteBooks.includes(item.key);
            return this.props.viewMode === "list" ? (
              <BookListItem
                {...{
                  key: index,
                  book: item,
                  loadContentBook: this.loadContentBook,
                  loadBookList: this.loadBookList,
                  isSelected: this.props.selectedBooks.indexOf(item.key) > -1,
                  isFavorite: isFavorite,
                }}
              />
            ) : this.props.viewMode === "card" ? (
              <BookCardItem
                {...{
                  key: index,
                  book: item,
                  loadContentBook: this.loadContentBook,
                  loadBookList: this.loadBookList,
                  loadFavoriteBooks: this.loadFavoriteBooks,
                  isSelected: this.props.selectedBooks.indexOf(item.key) > -1,
                  isFavorite: isFavorite,
                }}
              />
            ) : (
              <BookCoverItem
                {...{
                  key: index,
                  book: item,
                  loadContentBook: this.loadContentBook,
                  loadBookList: this.loadBookList,
                  isSelected: this.props.selectedBooks.indexOf(item.key) > -1,
                  isFavorite: isFavorite,
                }}
              />
            );
          })}
      </React.Fragment>
    );
  };
  lazyLoad = () => {
    const lazyImages: any = document.querySelectorAll(".lazy-image");
    lazyImages.forEach((lazyImage) => {
      if (this.isElementInViewport(lazyImage) && lazyImage.dataset.src) {
        lazyImage.src = lazyImage.dataset.src;
        lazyImage.classList.remove("lazy-image");
      }
    });
  };
  isElementInViewport = (element) => {
    const rect = element.getBoundingClientRect();

    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  };

  // load book from backend then save to localforage
  loadContentBook = async (book: BookModel) => {
    console.log("===== book", book);
    this.props.handleLoadingBook(true);
    await new Promise((resolve) => {
      book.source_url = book.source_url.replace(/_/g, "+");

      axios.get<ArrayBuffer>(book.source_url, { responseType: "arraybuffer" }).then(async (res) => {
        const arrayBuffer = res.data;
        const { type, format } = this.getFileFormat(book.file_key);
        const blob = new Blob([new Uint8Array(arrayBuffer)], { type });
        const file = new File([blob], `${book.name}.${format}`, { type });
        console.log("===========", false);
        await this.getMd5WithBrowser(file, book.file_key, book.thumbnail, book.thumb_url, book.source_url, book.key);
        console.log("===========", true);
        resolve(book.key);
        this.props.handleLoadingBook(false);
      });
    });
    return book.key;
  };
  handleJump = (book: BookModel) => {
    localStorage.setItem("tempBook", JSON.stringify(book));
    BookUtil.RedirectBook(book, this.props.t, this.props.history);
    // this.props.history.push("/manager/home");
  };
  handleAddBook = (book: BookModel, buffer: ArrayBuffer) => {
    return new Promise<void>((resolve, reject) => {
      if (this.state.isOpenFile) {
        StorageUtil.getReaderConfig("isImportPath") !== "yes" &&
          StorageUtil.getReaderConfig("isPreventAdd") !== "yes" &&
          BookUtil.addBook(book.key, buffer);
        if (StorageUtil.getReaderConfig("isPreventAdd") === "yes") {
          this.handleJump(book);

          this.setState({ isOpenFile: false });

          return resolve();
        }
      } else {
        StorageUtil.getReaderConfig("isImportPath") !== "yes" && BookUtil.addBook(book.key, buffer);
      }

      let bookArr = [...(this.props.books || []), ...this.props.deletedBooks];
      if (bookArr == null) {
        bookArr = [];
      }

      let index = bookArr.findIndex((b) => b.file_key === book.file_key);
      if (index !== -1) {
        bookArr[index] = book;
      } else {
        bookArr.push(book);
      }

      this.props.handleReadingBook(book);
      RecordRecent.setRecent(book.key);
      window.localforage
        .setItem("books", bookArr)
        .then(() => {
          this.props.handleFetchBooks();
          if (this.props.mode === "shelf") {
            let shelfTitles = Object.keys(ShelfUtil.getShelf());
            ShelfUtil.setShelf(shelfTitles[this.props.shelfIndex], book.key);
          }
          setTimeout(() => {
            this.state.isOpenFile && this.handleJump(book);
            if (StorageUtil.getReaderConfig("isOpenInMain") === "yes" && this.state.isOpenFile) {
              this.setState({ isOpenFile: false });
              return;
            }
            this.setState({ isOpenFile: false });
          }, 100);
          return resolve();
        })
        .catch(() => {
          toast.error(this.props.t("Import failed"));
          return resolve();
        });
    });
  };

  getMd5WithBrowser = async (
    file: any,
    file_key: string = "",
    thumbnail: string = "",
    thumb_url: string = "",
    source_url: string = "",
    key: string = ""
  ) => {
    console.log("file", file);
    return new Promise<void>(async (resolve, reject) => {
      const md5 = await fetchMD5(file);
      if (!md5) {
        toast.error(this.props.t("Import failed"));
        return resolve();
      } else {
        try {
          await this.handleBook(file, md5, file_key, thumbnail, thumb_url, source_url, key);
        } catch (error) {
          console.log(error);
        }

        return resolve();
      }
    });
  };

  handleBook = (
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
      if (this.props.books.length > 0) {
        this.props.books.forEach((item) => {
          if (item.md5 === md5 && item.size === file.size) {
            isRepeat = true;
            if (!key) return resolve();
          }
        });
      }
      if (this.props.deletedBooks.length > 0) {
        this.props.deletedBooks.forEach((item) => {
          if (item.md5 === md5 && item.size === file.size) {
            isRepeat = true;
            toast.error(this.props.t("Duplicate book in trash bin"));
            if (!key) return resolve();
          }
        });
      }
      if (!isRepeat || !!key) {
        console.log("=========== before load");
        let reader = new FileReader();
        reader.readAsArrayBuffer(file);

        reader.onload = async (e) => {
          if (!e.target) {
            toast.error(this.props.t("Import failed"));
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
              console.log("===== result", result);
              if (result === "get_metadata_error") {
                toast.error(this.props.t("Import failed"));
                return resolve();
              }
              if (!!key) {
                (result as BookModel).key = key;
              }
            } catch (error) {
              console.log(error);
              throw error;
            }

            clickFilePath = "";
            await this.handleAddBook(result as BookModel, file_content as ArrayBuffer);

            return resolve();
          };
          reader.readAsArrayBuffer(file);
        };
      }
    });
  };

  handlePageChange = async (page: number) => {
    await this.setState({ currentPage: page });
    await this.loadBookList();
  };

  handleSortChange = (value: string) => {
    const [orderBy, order] = value.split("-");
    if (this.state.orderBy !== orderBy || this.state.order !== order) {
      this.setState({ orderBy, order }, () => this.loadBookList());
    }
  };

  render() {
    let bookListContent;
    if (!this.props.books || !this.props.books[0]) {
      bookListContent = <EmptyPage mode="empty" isCollapsed={false} />;
    } else {
      bookListContent = (
        <>
          <div className="book-list-container-parent">
            <div className="book-list-container">
              {this.props.isLoadingBook && (
                <div className="loading-container">
                  <Loading />
                </div>
              )}
              <div className="pagination-sort-container">
                <span className="pagination-info">
                  Showing {(this.state.currentPage - 1) * this.state.pageSize + 1} to{" "}
                  {this.state.currentPage * this.state.pageSize > this.state.totalItems
                    ? this.state.totalItems
                    : this.state.currentPage * this.state.pageSize}{" "}
                  of {this.state.totalItems} books
                </span>
                <div className="pagination-controls">
                  <Pagination
                    className="pagination-body"
                    current={this.state.currentPage}
                    total={this.state.totalItems}
                    pageSize={this.state.pageSize}
                    onChange={this.handlePageChange}
                    showSizeChanger={false}
                    showQuickJumper={false}
                    itemRender={(current, type, element) => {
                      if (type === "page") {
                        return <a>{current}</a>;
                      }
                      return element;
                    }}
                  />
                  <select
                    value={`${this.state.orderBy}-${this.state.order}`}
                    onChange={(e) => this.handleSortChange(e.target.value)}
                    className="sort-select"
                  >
                    <option value="title-asc">Title (A-Z)</option>
                    <option value="title-desc">Title (Z-A)</option>
                  </select>
                </div>
              </div>

              <ul
                className="book-list-item-box grid 2xl:grid-cols-6 xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-2 justify-items-center"
                onScroll={() => {
                  this.lazyLoad();
                }}
              >
                {!this.state.isRefreshing && this.renderBookList()}
              </ul>
            </div>
          </div>
          <div className="book-list-header">
            <SelectBook />
            <div style={this.props.isSelectBook ? { display: "none" } : {}}>
              <ViewMode />
            </div>
          </div>
        </>
      );
    }

    StorageUtil.setReaderConfig("totalBooks", this.props.books?.length?.toString());

    return <Manager>{bookListContent}</Manager>;
  }
}

export default withRouter(BookList as any);
