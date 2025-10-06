import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios, { AxiosError } from "axios";
import api from "../../../utils/axios";

import { toast } from "react-hot-toast";
import { BookOpen, Calendar, Book, Clock, RefreshCw, Loader2 } from "lucide-react";
import BookUtil from "../../../utils/fileUtils/bookUtil";
import StorageUtil from "../../../utils/serviceUtils/storageUtil";
import { useHistory } from "react-router-dom";
// import moment from "moment";
import { fetchMD5 } from "../../../utils/fileUtils/md5Util";
import RecordRecent from "../../../utils/readUtils/recordRecent";
import BookModel from "../../../models/Book";
import authService from "../../../utils/authService";

declare global {
  interface Window {
    localforage: {
      setItem<T>(key: string, value: T): Promise<T>;
      getItem<T>(key: string): Promise<T | null>;
    };
  }
}

// Define interfaces for our data types
interface iBook {
  id: string;
  thumbnail: string;
  thumb_url: string;
  url: string;
  source_url: string;
  language: string;
  genres: string[];
  file_key: string;
  title: string;
  status: string;
  created_at?: string;
}

interface ReadingStatistics {
  total_read_books_count: number;
  malay_read_books_count?: number;
  english_read_books_count?: number;
  mandarin_read_books_count?: number;
  total_reading_duration: number;
  read_books_list: iBook[];
  last_book_read_timestamp: string | null;
  language_breakdown: Record<string, number>;
}

interface ReadingProgressData {
  books: iBook[];
  total: number;
}

const ReadingStatsSection = () => {
  const history = useHistory();
  const [readingProgress, setReadingProgress] = useState<ReadingProgressData>({
    books: [],
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const [pageSize, setPageSize] = useState(5);
  const [search, setSearch] = useState("");
  const [orderBy, setOrderBy] = useState<"title">("title");
  const [orderDir, setOrderDir] = useState<"asc" | "desc">("asc");
  const [stats, setStats] = useState<ReadingStatistics | null>(null);

  // Add new loading state
  const [isLoadingBook, setIsLoadingBook] = useState(false);

  function formatBookTitle(filename: string): string {
    return filename.replace(".pdf", "").replace(/_/g, " ").split("SIRI_").pop()?.split("SMART_TAG_").pop() || filename;
  }

  function formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds} seconds`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes > 1 ? "s" : ""}`;
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  }

  // Consolidation no longer needed with new statistics endpoint

  const handleGetReadingProgress = useCallback(async () => {
    try {
      const userId = authService.getUserData()?.id || "";

      setIsLoading(true);

      const response = await api.get(`/api/users/${userId}/statistics`);

      if (response.data?.data?.reading_statistics) {
        const readingStats: ReadingStatistics = response.data.data.reading_statistics;
        // Ensure books have source_url
        const books: iBook[] = (readingStats.read_books_list || []).map((book: any) => ({
          ...book,
          source_url: book.url,
        }));

        setStats({
          ...readingStats,
          read_books_list: books,
        });

        setReadingProgress({
          books,
          total: readingStats.total_read_books_count || books.length,
        });
      }
    } catch (error) {
      const err = error as AxiosError;
      console.error("Error fetching user statistics:", err);
      toast.error(err.message || "An error occurred while fetching statistics");
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty dependency array since it doesn't use any props or state

  // Filter/sort/paginate
  const filteredSortedBooks = useMemo(() => {
    let list = [...readingProgress.books];
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter((b) => b.title.toLowerCase().includes(s));
    }
    list.sort((a, b) => {
      const av = a.title.toLowerCase();
      const bv = b.title.toLowerCase();
      if (av < bv) return orderDir === "asc" ? -1 : 1;
      if (av > bv) return orderDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [readingProgress.books, search, orderDir]);

  const totalCount = filteredSortedBooks.length;
  const paginatedBooks = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredSortedBooks.slice(startIndex, endIndex);
  }, [filteredSortedBooks, currentPage, pageSize]);

  const handleContinueReadingByBook = async (book: iBook) => {
    if (!book || !book.url) {
      toast.error("Book information not found");
      return;
    }

    setIsLoadingBook(true);
    try {
      const sourceUrl = (book.source_url || book.url).replace(/_/g, "+");

      const response = await axios.get<ArrayBuffer>(sourceUrl, { responseType: "arraybuffer" });
      const arrayBuffer = response.data;
      const { type, format } = getFileFormat(book.title);
      const blob = new Blob([new Uint8Array(arrayBuffer)], { type });
      const file = new File([blob], `${book.title}`, { type });

      const md5 = await fetchMD5(file);
      if (!md5) {
        throw new Error("Failed to calculate MD5");
      }

      const key = book.id;
      const result = await BookUtil.generateBook(
        book.title,
        format,
        md5,
        file.size,
        "",
        arrayBuffer,
        book.file_key,
        book?.thumbnail,
        book.thumb_url,
        sourceUrl,
        key
      );

      if (result === "get_metadata_error") {
        throw new Error("Failed to get book metadata");
      }

      if (StorageUtil.getReaderConfig("isImportPath") !== "yes") {
        await BookUtil.addBook(key, arrayBuffer);
      }

      const bookModel = result as BookModel;
      bookModel.key = key;
      RecordRecent.setRecent(bookModel.key);

      const existingBooks = (await window.localforage.getItem<BookModel[]>("books")) || [];
      const bookIndex = existingBooks.findIndex((b) => b.file_key === book.file_key);
      if (bookIndex !== -1) {
        existingBooks[bookIndex] = bookModel;
      } else {
        existingBooks.push(bookModel);
      }
      await window.localforage.setItem("books", existingBooks);

      BookUtil.RedirectBook(bookModel, (key) => key, history);
    } catch (error) {
      console.error("Error loading book:", error);
      toast.error("Failed to load book. Please try again.");
    } finally {
      setIsLoadingBook(false);
    }
  };

  const getFileFormat = (filename: string) => {
    const parts = filename.split(".");
    const format = parts.length > 1 ? parts[parts.length - 1] : "";
    let type = "application/pdf";
    if (format === "epub") type = "application/epub+zip";
    return { format, type };
  };

  // Removed unused handlePageChange

  useEffect(() => {
    handleGetReadingProgress();
  }, [handleGetReadingProgress]);

  return (
    <div className="rounded-2xl p-6 lg:p-8 transition-all duration-300 hover:shadow-xl bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/30 dark:hover:shadow-gray-900/50 border-2 border-transparent/20 border-solid">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-app">
        <h2 className="text-xl lg:text-2xl font-bold text-app">
          Reading Statistics
        </h2>
        <button
          className="p-2 rounded-lg transition-all duration-300 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed bg-theme-light text-theme"
          onClick={handleGetReadingProgress}
          disabled={isLoading}
          title="Refresh data"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
          {/* Total Books Card */}
          <div className="relative overflow-hidden rounded-xl p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group bg-transparent border-solid border border-transparent/20">
            <div className="inline-flex p-3 rounded-lg mb-3 transition-all duration-300 group-hover:scale-110 bg-blue-500/15 dark:bg-blue-400/15">
              <BookOpen className="w-6 h-6 text-blue-500 dark:text-blue-400" />
            </div>
            <p className="text-sm font-medium mb-1 text-app-2">
              Total Books Read
            </p>
            <p className="text-2xl lg:text-3xl font-bold text-app">
              {stats.total_read_books_count}
            </p>
            <div className="absolute -bottom-2 -right-2 opacity-5 text-app">
              <BookOpen className="w-20 h-20" />
            </div>
          </div>

          {/* Total Reading Time Card */}
          <div className="relative overflow-hidden rounded-xl p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group  bg-transparent border-solid border border-transparent/20">
            <div className="inline-flex p-3 rounded-lg mb-3 transition-all duration-300 group-hover:scale-110 bg-purple-500/15 dark:bg-purple-400/15">
              <Clock className="w-6 h-6 text-purple-500 dark:text-purple-400" />
            </div>
            <p className="text-sm font-medium mb-1 text-app-2">
              Total Reading Time
            </p>
            <p className="text-2xl lg:text-3xl font-bold text-app">
              {formatDuration(stats.total_reading_duration)}
            </p>
            <div className="absolute -bottom-2 -right-2 opacity-5 text-app">
              <Clock className="w-20 h-20" />
            </div>
          </div>

          {/* Last Book Read Card */}
          <div className="relative overflow-hidden rounded-xl p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group sm:col-span-2 xl:col-span-1  bg-transparent border-solid border border-transparent/20">
            <div className="inline-flex p-3 rounded-lg mb-3 transition-all duration-300 group-hover:scale-110 bg-emerald-500/15 dark:bg-emerald-400/15">
              <Calendar className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
            </div>
            <p className="text-sm font-medium mb-1 text-app-2">
              Last Book Read
            </p>
            <p className="text-lg lg:text-xl font-bold truncate text-app">
              {stats.last_book_read_timestamp ? formatDate(stats.last_book_read_timestamp) : "-"}
            </p>
            <div className="absolute -bottom-2 -right-2 opacity-5 text-app">
              <Calendar className="w-20 h-20" />
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        <input
          placeholder="Search by title"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full rounded-xl px-4 py-3 text-sm leading-tight bg-transparent border-solid border border-transparent/20 text-app caret-theme transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-theme focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <select
          value={orderBy}
          onChange={(e) => setOrderBy(e.target.value as any)}
          className="w-full rounded-xl px-4 py-3 text-sm leading-tight bg-transparent border-solid border border-transparent/20 text-app caret-theme transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-theme focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="title">Order by Title</option>
        </select>
        <select
          value={orderDir}
          onChange={(e) => setOrderDir(e.target.value as any)}
          className="w-full rounded-xl px-4 py-3 text-sm leading-tight bg-transparent border-solid border border-transparent/20 text-app caret-theme transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-theme focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>
      </div>

      {/* Loading Overlay */}
      {isLoadingBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 bg-app">
            <Loader2 className="w-12 h-12 animate-spin text-theme" />
            <p className="text-lg font-medium text-app">
              Loading book...
            </p>
          </div>
        </div>
      )}

      {/* Books List */}
      <div className="space-y-3">
        {paginatedBooks.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 rounded-xl bg-transparent border-solid border border-transparent/20">
            <BookOpen className="w-16 h-16 mb-4 opacity-30 text-app-2" />
            <h3 className="text-lg font-semibold mb-2 text-app">
              No books found
            </h3>
            <p className="text-sm text-app-2">
              {search ? 'Try adjusting your search criteria' : 'Start reading to see your books here'}
            </p>
          </div>
        ) : null}
        {paginatedBooks.map((book, index) => (
          <div
            key={index}
            className="flex items-center gap-4 p-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer group bg-app-2 dark:bg-transparent border-solid border border-transparent/20"
            onClick={() => handleContinueReadingByBook(book)}
          >
            {/* Book Icon */}
            <div className="p-3 rounded-lg flex-shrink-0 transition-transform duration-300 group-hover:scale-110 bg-theme-light">
              <Book className="w-6 h-6 text-theme" />
            </div>

            {/* Book Details */}
            <div className="flex-1 min-w-0">
              <h3 className="text-base lg:text-lg font-semibold mb-2 truncate text-app">
                {formatBookTitle(book.title)}
              </h3>
              <div className="flex flex-wrap items-center gap-3 text-xs lg:text-sm text-app-2">
                {book.language && (
                  <div className="flex items-center gap-1">
                    <Book className="w-4 h-4" />
                    <span>{book.language}</span>
                  </div>
                )}
                {book.created_at && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(book.created_at)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Arrow Icon */}
            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-theme">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-6 pt-6 border-t border-app flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Pagination Info */}
        <div className="flex items-center gap-3 text-sm text-app-2">
          <span>Total:</span>
          <strong className="font-bold text-app">{totalCount}</strong>
          <span className="hidden sm:inline">•</span>
          <span>Page size:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="rounded-lg px-3 py-1.5 text-sm bg-transparent border-solid border border-transparent/20 text-app caret-theme transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-theme focus:ring-offset-0"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center gap-2 text-sm">
          <button
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
              currentPage === 1 ? 'bg-app-2 text-app-2' : 'bg-theme-light text-theme'
            }`}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          
          <div className="flex items-center gap-2 text-app-2">
            <span className="hidden sm:inline">Page</span>
            <input
              className="w-16 text-center rounded-lg px-2 py-2 text-sm bg-transparent border-solid border border-transparent/20 text-app caret-theme transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-theme focus:ring-offset-0"
              value={currentPage}
              onChange={(e) => {
                const v = Math.max(1, Math.min(Math.ceil(totalCount / pageSize) || 1, Number(e.target.value) || 1));
                setCurrentPage(v);
              }}
            />
            <span>of {Math.max(1, Math.ceil(totalCount / pageSize) || 1)}</span>
          </div>
          
          <button
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
              currentPage >= (Math.ceil(totalCount / pageSize) || 1) ? 'bg-app-2 text-app-2' : 'bg-theme-light text-theme'
            }`}
            onClick={() => setCurrentPage((p) => Math.min(Math.ceil(totalCount / pageSize) || 1, p + 1))}
            disabled={currentPage >= (Math.ceil(totalCount / pageSize) || 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReadingStatsSection;

