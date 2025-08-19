import React from "react";
import "./booklist.css";
import BookCardItem from "../../../components/bookCardItem";
import BookListItem from "../../../components/bookListItem";
import BookCoverItem from "../../../components/bookCoverItem";
import Loading from "../../../components/loading/component";
import AddFavorite from "../../../utils/readUtils/addFavorite";
import ShelfUtil from "../../../utils/readUtils/shelfUtil";
import BookModel from "../../../models/Book";
import { BookListProps, BookListState } from "./interface";
import StorageUtil from "../../../utils/serviceUtils/storageUtil";
import { fetchMD5 } from "../../../utils/fileUtils/md5Util";
import { withRouter } from "react-router-dom";
import ViewMode from "../../../components/viewMode";
import { backup } from "../../../utils/syncUtils/backupUtil";
import BookUtil from "../../../utils/fileUtils/bookUtil";
import RecordRecent from "../../../utils/readUtils/recordRecent";
import { isElectron } from "react-device-detect";
import SelectBook from "../../../components/selectBook";
// import { Trans } from "react-i18next";
import toast from "react-hot-toast";
import axios from "axios";
import api from "../../../utils/axios";
import Pagination from "rc-pagination";
import "rc-pagination/assets/index.css";
import { ChevronDown } from "lucide-react";
import { getCurrentUser } from "../../../utils/authUtils";
import Manager from "../../../pages/manager";

declare var window: any;
let clickFilePath = "";

class BookList extends React.Component<BookListProps, BookListState> {
  constructor(props: BookListProps) {
    super(props);
    this.state = {
      isOpenDelete: false,
      favoriteBooks: Object.keys(AddFavorite.getAllFavorite()).length,
      isHideShelfBook: StorageUtil.getReaderConfig("isHideShelfBook") === "yes",
      isRefreshing: false,
      isOpenFile: false,
      width: document.body.clientWidth,
      currentPage: 1,
      pageSize: 24,
      totalItems: 0,
      order: "ASC",
      orderBy: "title",
      books: [],
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

    this.loadBookList();
  }

  componentDidUpdate(prevProps: BookListProps) {
    if ((this.props.shelf !== prevProps.shelf && this.props.shelf !== "") || this.props.keyword !== prevProps.keyword) {
      this.loadBookList();
    }
  }

  loadBookList = async () => {
    this.props.handleLoadingBook(true);
    window.localforage.setItem("books", []);
    window.localforage.clear();
    this.props.handleFetchBooks();

    const { keyword, shelf } = this.props;
    const { currentPage, pageSize, order, orderBy } = this.state;
    const { username } = await getCurrentUser();
    const [shelfKey, shelfValue] = shelf.split("-");

    try {
      const response = await api.get(
        `/api/ebooks/list?page=${currentPage}&limit=${pageSize}&keyword=${keyword}&order=${order}&orderBy=${orderBy}&${shelfKey}=${shelfValue}`
      );

      const books = response.data.data.map((book: any, index: number) => ({
        ...book,
        key: book.id,
        format: book.title.split(".").pop(),
        name: book.title,
        source_url: book.url,
        thumb_url: book.thumb_url,
        size: book.size,
        upload_time: book.upload_time,
      }));
      this.setState({ totalItems: response.data.total });
      this.setState({ books: books });

      await api.get(`/api/highlights/getByUserIC/${username}`).then((res) => {
        const noteArr = res.data.data;
        window.localforage.setItem("notes", noteArr);
      });
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

  handleKeyFilter = (items: any[], arr: string[]) => {
    let itemArr: any[] = [];
    arr.forEach((item) => {
      items.forEach((subItem: any) => {
        if (subItem.key === item) {
          itemArr.push(subItem);
        }
      });
    });
    return itemArr;
  };

  handleShelf(items: any, index: number) {
    if (index < 1) return items;
    let shelfTitle = Object.keys(ShelfUtil.getShelf());
    let currentShelfTitle = shelfTitle[index];
    if (!currentShelfTitle) return items;
    let currentShelfList = ShelfUtil.getShelf()[currentShelfTitle];
    let shelfItems = items.filter((item: { key: number }) => {
      return currentShelfList.indexOf(item.key) > -1;
    });
    return shelfItems;
  }

  //get the searched books according to the index
  handleIndexFilter = (items: any, arr: number[]) => {
    let itemArr: any[] = [];
    arr.forEach((item) => {
      items[item] && itemArr.push(items[item]);
    });
    return itemArr;
  };

  handleFilterShelfBook = (items: BookModel[]) => {
    return items.filter((item) => {
      return ShelfUtil.getBookPosition(item.key).length === 0;
    });
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
      books &&
      books.map((item: BookModel, index: number) => {
        return this.props.viewMode === "list" ? (
          <BookListItem
            {...{
              key: index,
              book: item,
              loadContentBook: this.loadContentBook,
              isSelected: this.props.selectedBooks.indexOf(item.key) > -1,
            }}
          />
        ) : this.props.viewMode === "card" ? (
          <BookCardItem
            {...{
              key: index,
              book: item,
              loadContentBook: this.loadContentBook,
              isSelected: this.props.selectedBooks.indexOf(item.key) > -1,
            }}
          />
        ) : (
          <BookCoverItem
            {...{
              key: index,
              book: item,
              loadContentBook: this.loadContentBook,
              isSelected: this.props.selectedBooks.indexOf(item.key) > -1,
            }}
          />
        );
      })
    );
  };

  handleDeletePopup = (isOpenDelete: boolean) => {
    this.setState({ isOpenDelete });
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
    this.props.handleLoadingBook(true);
    await new Promise((resolve) => {
      book.source_url = book.source_url.replace(/_/g, "+");

      axios.get<ArrayBuffer>(book.source_url, { responseType: "arraybuffer" }).then(async (res) => {
        const arrayBuffer = res.data;
        const { type } = this.getFileFormat(book.file_key);
        const blob = new Blob([new Uint8Array(arrayBuffer)], { type });
        const file = new File([blob], `${book.name}`, { type });
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
          // toast.success(this.props.t("Addition successful"));
          setTimeout(() => {
            this.state.isOpenFile && this.handleJump(book);
            if (StorageUtil.getReaderConfig("isOpenInMain") === "yes" && this.state.isOpenFile) {
              this.setState({ isOpenFile: false });
              return;
            }
            this.setState({ isOpenFile: false });
            // this.props.history.push("/manager/home");
          }, 100);
          return resolve();
        })
        .catch(() => {
          // toast.error(this.props.t("Import failed"));
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
        // toast.error(this.props.t("Import failed"));
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
    // console.log('bookName', bookName)
    let result: BookModel | string;
    return new Promise<void>((resolve, reject) => {
      let isRepeat = false;
      if (this.props.books.length > 0) {
        this.props.books.forEach((item) => {
          if (item.md5 === md5 && item.size === file.size) {
            isRepeat = true;
            // toast.error(this.props.t("Duplicate book"));
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
            // toast.error(this.props.t("Import failed"));
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
              if (!!key) {
                (result as BookModel).key = key;
              }
            } catch (error) {
              console.log(error);
              throw error;
            }

            clickFilePath = "";
            if (result === "get_metadata_error") {
              // toast.error(this.props.t("Import failed"));
              return resolve();
            }
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
    if (
      (this.state.favoriteBooks === 0 && this.props.mode === "favorite") ||
      !this.props.books ||
      !this.props.books[0]
    ) {
      console.log("EMTPY");
    }
    if (isElectron) {
      //accommodate the previous version
      window.localforage.getItem(this.props.books[0].key).then((result) => {
        if (result) {
          backup(this.props.books, this.props.notes, this.props.bookmarks, false);
        }
      });
    }

    StorageUtil.setReaderConfig("totalBooks", this.props.books?.length?.toString());
    const bookListContent = (
      <>
        <div className="book-list-header">
          <SelectBook />
          <div style={this.props.isSelectBook ? { display: "none" } : {}}>
            <ViewMode />
          </div>
        </div>
        <div
          className="book-list-container-parent"
          style={this.props.isCollapsed ? { width: "calc(100vw - 70px)", left: "70px" } : {}}
        >
          <div className="book-list-container">
            {this.props.isLoadingBook && (
              <div className="loading-container">
                <Loading />
              </div>
            )}
            <div className="pagination-container">
              <span>
                Showing {(this.state.currentPage - 1) * this.state.pageSize + 1} to{" "}
                {this.state.currentPage * this.state.pageSize > this.state.totalItems
                  ? this.state.totalItems
                  : this.state.currentPage * this.state.pageSize}{" "}
                of {this.state.totalItems} books
              </span>
              <Pagination
                current={this.state.currentPage}
                total={this.state.totalItems}
                pageSize={this.state.pageSize}
                onChange={this.handlePageChange}
                // onShowSizeChange={handlePageSizeChange}
              />
              <div className="relative inline-block w-64">
                <select
                  defaultValue="title-asc"
                  onChange={(e) => this.handleSortChange(e.target.value)}
                  className="w-full px-3 py-1 pr-6 bg-white border border-gray-300 rounded-lg shadow-sm appearance-none sort-select hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="title-asc">Title Ascending</option>
                  <option value="title-desc">Title Descending</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 pointer-events-none sort-icon sort-option">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            <ul
              className="book-list-item-box"
              onScroll={() => {
                this.lazyLoad();
              }}
            >
              {!this.state.isRefreshing && this.renderBookList()}
            </ul>
          </div>
        </div>
      </>
    );

    return <Manager>{bookListContent}</Manager>;
  }
}

export default withRouter(BookList as any);
