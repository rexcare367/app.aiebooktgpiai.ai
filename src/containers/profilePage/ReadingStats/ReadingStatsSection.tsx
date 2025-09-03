import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios, { AxiosError } from "axios";
import api from "../../../utils/axios";

import { toast } from "react-hot-toast";
import { BookOpen, Calendar, Book, Clock } from "lucide-react";
import "./ReadingStatsSection.css";
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

  if (isLoading) {
    return (
      <div className="reading-stats-container">
        <div className="empty-state">
          <BookOpen className="empty-icon" />
          <h2 className="empty-title">Loading...</h2>
        </div>
      </div>
    );
  }

  if (!readingProgress.books.length) {
    return (
      <div className="reading-stats-container">
        <div className="empty-state">
          <BookOpen className="empty-icon" />
          <h2 className="empty-title">You haven't read any books yet!</h2>
          <p className="empty-subtitle">Your reading adventures will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reading-stats-container">
      {stats && (
        <div className="analytics-panel">
          <div className="stats-grid">
            <div className="stat-card mint">
              <div className="icon-box">
                <BookOpen />
              </div>
              <div className="stat-title">Total Books Read</div>
              <div className="stat-value">{stats.total_read_books_count}</div>
              <div className="stat-icon-large">
                <BookOpen />
              </div>
            </div>
            <div className="stat-card lilac">
              <div className="icon-box">
                <Clock />
              </div>
              <div className="stat-title">Total Reading Time</div>
              <div className="stat-value">{formatDuration(stats.total_reading_duration)}</div>
              <div className="stat-icon-large">
                <Clock />
              </div>
            </div>
            <div className="stat-card blue">
              <div className="icon-box">
                <Calendar />
              </div>
              <div className="stat-title">Last Book Read</div>
              <div className="stat-value">
                {stats.last_book_read_timestamp ? formatDate(stats.last_book_read_timestamp) : "-"}
              </div>
              <div className="stat-icon-large">
                <Calendar />
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="reading-controls">
        <input
          placeholder="Search by title"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="form-input"
        />
        <select
          value={orderBy}
          onChange={(e) => setOrderBy(e.target.value as any)}
          className="form-input"
        >
          <option value="title">Order by Title</option>
        </select>
        <select
          value={orderDir}
          onChange={(e) => setOrderDir(e.target.value as any)}
          className="form-input"
        >
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>
      </div>
      {isLoadingBook && (
        <div className="loading-overlay">
          <div className="loading-spinner">Loading book...</div>
        </div>
      )}
      <div className="books-list">
        {paginatedBooks.map((book, index) => (
          <div
            key={index}
            className="book-card"
            onClick={() => handleContinueReadingByBook(book)}
          >
            <div className="card-content">
              <div className="book-info">
                <h2 className="book-title">{formatBookTitle(book.title)}</h2>
                <div className="book-meta">
                  {book.language && (
                    <div className="meta-item">
                      <Book />
                      <span>{book.language}</span>
                    </div>
                  )}
                  {book.created_at && (
                    <div className="meta-item">
                      <Calendar />
                      <span>{formatDate(book.created_at)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="pagination-container">
        <div className="pagination-info">
          <span>Total:</span>
          <strong>{totalCount}</strong>
          <span>Page size:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="form-input"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
        <div className="pagination-controls">
          <button
            className="page-button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <span>Page</span>
          <input
            className="form-input"
            value={currentPage}
            onChange={(e) => {
              const v = Math.max(1, Math.min(Math.ceil(totalCount / pageSize) || 1, Number(e.target.value) || 1));
              setCurrentPage(v);
            }}
          />
          <span>of {Math.max(1, Math.ceil(totalCount / pageSize) || 1)}</span>
          <button
            className="page-button"
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

