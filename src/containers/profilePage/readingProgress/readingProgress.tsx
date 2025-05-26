import React, { useEffect, useState, useCallback } from "react";
import axios, { AxiosError } from "axios";
import api from "../../../utils/axios";

import { toast } from "react-hot-toast";
import { BookOpen, Calendar, Clock, Book } from "lucide-react";
import "./readingProgress.css";
import { getCurrentUser } from "aws-amplify/auth";
import Pagination from "rc-pagination";
import "rc-pagination/assets/index.css";
import BookUtil from "../../../utils/fileUtils/bookUtil";
import StorageUtil from "../../../utils/serviceUtils/storageUtil";
import { useHistory } from "react-router-dom";
// import moment from "moment";
import { fetchMD5 } from "../../../utils/fileUtils/md5Util";
import RecordRecent from "../../../utils/readUtils/recordRecent";
import BookModel from "../../../models/Book";

declare global {
  interface Window {
    localforage: {
      setItem<T>(key: string, value: T): Promise<T>;
      getItem<T>(key: string): Promise<T | null>;
    };
  }
}

// Define interfaces for our data types
interface BookHistory {
  score: number;
  book_id: string;
  book_title: string;
  duration: number;
  percentage: string;
  started_at: string;
  created_at: string;
}

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
}

interface ReadingProgressData {
  history: BookHistory[];
  books: iBook[];
  total: number;
}

const ReadingProgressSection = () => {
  const history = useHistory();
  const [readingProgress, setReadingProgress] = useState<ReadingProgressData>({
    history: [],
    books: [],
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const [pageSize, setPageSize] = useState(10);
  const [consolidatedBooks, setConsolidatedBooks] = useState<
    Array<{
      latestHistory: BookHistory;
      readCount: number;
      totalDuration: number;
      firstRead: string;
      lastRead: string;
    }>
  >([]);

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

  const consolidateBookHistory = (history: BookHistory[]) => {
    const bookMap = new Map<
      string,
      {
        latestHistory: BookHistory;
        readCount: number;
        totalDuration: number;
        firstRead: string;
        lastRead: string;
      }
    >();

    history.forEach((item) => {
      const bookKey = item.book_id;
      const existing = bookMap.get(bookKey);

      if (existing) {
        if (new Date(item.started_at) > new Date(existing.latestHistory.started_at)) {
          existing.latestHistory = item;
        }
        existing.readCount += 1;
        existing.totalDuration += item.duration;
        existing.firstRead =
          new Date(item.started_at) < new Date(existing.firstRead) ? item.started_at : existing.firstRead;
        existing.lastRead =
          new Date(item.started_at) > new Date(existing.lastRead) ? item.started_at : existing.lastRead;
      } else {
        bookMap.set(bookKey, {
          latestHistory: item,
          readCount: 1,
          totalDuration: item.duration,
          firstRead: item.started_at,
          lastRead: item.started_at,
        });
      }
    });

    return Array.from(bookMap.values());
  };

  const handleGetReadingProgress = useCallback(async () => {
    try {
      const { username } = await getCurrentUser();
      setIsLoading(true);

      // Fetch all reading history first (using a large limit)
      const response = await api.get(`/api/ebooks/reading_progress/${username}?page=1&limit=1000`);

      console.log("API Response:", response.data); // Debug log

      if (response.data.data) {
        // Ensure books have source_url
        const processedData = {
          ...response.data.data,
          books: response.data.data.books.map((book) => ({
            ...book,
            source_url: book.url, // Use url as source_url if source_url is missing
          })),
        };

        setReadingProgress(processedData);
        // Consolidate the full history
        const consolidated = consolidateBookHistory(response.data.data.history);
        setConsolidatedBooks(consolidated);
      }
    } catch (error) {
      const err = error as AxiosError;
      console.error("Error fetching reading progress:", err); // Debug log
      toast.error(err.message || "An error occurred while fetching reading progress");
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty dependency array since it doesn't use any props or state

  // Get paginated books for current view
  const getPaginatedBooks = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return consolidatedBooks.slice(startIndex, endIndex);
  };

  const handleContinueReading = async (historyItem: BookHistory) => {
    // Find the matching book in the books array
    const book = readingProgress.books.find((b) => b.id === historyItem.book_id);
    if (!book) {
      toast.error("Book information not found");
      return;
    }

    if (!book.url) {
      toast.error("Book source URL not found");
      return;
    }

    setIsLoadingBook(true);
    try {
      // Replace underscores with plus signs in source URL
      const sourceUrl = book.source_url.replace(/_/g, "+");

      // Fetch book content
      const response = await axios.get<ArrayBuffer>(sourceUrl, { responseType: "arraybuffer" });
      const arrayBuffer = response.data;
      const { type, format } = getFileFormat(book.title);
      const blob = new Blob([new Uint8Array(arrayBuffer)], { type });
      const file = new File([blob], `${book.title}`, { type });

      // Calculate MD5 and process the book
      const md5 = await fetchMD5(file);
      if (!md5) {
        throw new Error("Failed to calculate MD5");
      }

      // Generate book model
      const key = book.id;
      const result = await BookUtil.generateBook(
        book.title,
        format, // Assuming PDF format, adjust if needed
        md5,
        file.size,
        "", // Empty string for path since we're using source_url
        arrayBuffer,
        book.file_key,
        book?.thumbnail,
        book.thumb_url,
        sourceUrl, // Use the processed URL
        key
      );

      if (result === "get_metadata_error") {
        throw new Error("Failed to get book metadata");
      }

      // Add book to storage
      if (StorageUtil.getReaderConfig("isImportPath") !== "yes") {
        await BookUtil.addBook(key, arrayBuffer);
      }

      // Update local storage and recent books
      const bookModel = result as BookModel;
      bookModel.key = key;
      RecordRecent.setRecent(bookModel.key);

      // Save to localforage
      const existingBooks = (await window.localforage.getItem<BookModel[]>("books")) || [];
      const bookIndex = existingBooks.findIndex((b) => b.file_key === book.file_key);
      if (bookIndex !== -1) {
        existingBooks[bookIndex] = bookModel;
      } else {
        existingBooks.push(bookModel);
      }
      await window.localforage.setItem("books", existingBooks);

      // Redirect to the book reader
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    handleGetReadingProgress();
  }, [handleGetReadingProgress]);

  if (isLoading) {
    return (
      <div className="empty-state">
        <BookOpen className="empty-icon" />
        <h2 className="empty-title">Loading...</h2>
      </div>
    );
  }

  if (!consolidatedBooks.length) {
    return (
      <div className="empty-state">
        <BookOpen className="empty-icon" />
        <h2 className="empty-title">You haven't read any books yet!</h2>
        <p className="empty-subtitle">Your reading adventures will appear here</p>
      </div>
    );
  }

  const paginatedBooks = getPaginatedBooks();

  return (
    <div className="reading-container">
      <h1 className="text-2xl font-bold">My Reading Adventures! 📚</h1>
      {isLoadingBook && (
        <div className="loading-overlay">
          <div className="loading-spinner">Loading book...</div>
        </div>
      )}
      <div className="flex flex-col gap-4 mt-6">
        {paginatedBooks.map((item, index) => (
          <div
            key={index}
            className="book-card"
            onClick={() => handleContinueReading(item.latestHistory)}
            style={{ cursor: "pointer" }}
          >
            <div className="card-content">
              <div className="flex flex-col gap-2">
                <h2 className="font-bold text-lg">{formatBookTitle(item.latestHistory.book_title)}</h2>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Book />
                    <span>
                      Read {item.readCount} time{item.readCount > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock />
                    <span>{formatDuration(item.totalDuration)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar />
                    <span>
                      {item.readCount > 1
                        ? `${formatDate(item.firstRead)} - ${formatDate(item.lastRead)}`
                        : formatDate(item.lastRead)}
                    </span>
                  </div>
                </div>
                <div className="progress-section">
                  <div className="flex items-center gap-2">
                    <span>{Math.round(parseFloat(item.latestHistory.percentage) * 100)}%</span>
                    <div
                      className="progress-fill w-full h-2"
                      style={{
                        width: `${parseFloat(item.latestHistory.percentage) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="pagination-container">
        <span>
          Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, consolidatedBooks.length)} of{" "}
          {consolidatedBooks.length} books
        </span>
        <Pagination
          current={currentPage}
          total={consolidatedBooks.length}
          pageSize={pageSize}
          onChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default ReadingProgressSection;
