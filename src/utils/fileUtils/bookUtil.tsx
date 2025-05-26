import StorageUtil from "../serviceUtils/storageUtil";
import { isElectron } from "react-device-detect";

import BookModel from "../../models/Book";
import toast from "react-hot-toast";
import { getPDFMetadata } from "./pdfUtil";
import { copyArrayBuffer } from "../commonUtil";
import iconv from "iconv-lite";
import { Buffer } from "buffer";
const html2canvas = require("html2canvas");
declare var window: any;

class BookUtil {
  static addBook(key: string, buffer: ArrayBuffer) {
    return window.localforage.setItem(key, buffer);
  }
  static deleteBook(key: string) {
    return window.localforage.removeItem(key);
  }
  static isBookExist(key: string, bookPath: string = "") {
    return new Promise<boolean>((resolve, reject) => {
      window.localforage.getItem(key).then((result) => {
        if (result) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }
  static fetchBook(key: string, isArrayBuffer: boolean = false, bookPath: string = "") {
    return window.localforage.getItem(key);
  }
  static FetchAllBooks(Books: BookModel[]) {
    return (
      Books &&
      Books.map((item) => {
        return this.fetchBook(item.key, true, item.path);
      })
    );
  }
  static async RedirectBook(book: BookModel, t: (string) => string, history: any) {
    if (!(await this.isBookExist(book.key, book.path))) {
      toast.error(t("Book not exist"));
      return;
    }
    let ref = book.format.toLowerCase();

    window.open(`${window.location.href.split("#")[0]}#/${ref}/${book.key}?title=${book.name}&file=${book.key}`);
  }
  static getBookUrl(book: BookModel) {
    let ref = book.format.toLowerCase();
    return `/${ref}/${book.key}`;
  }
  static getPDFUrl(book: BookModel) {
    return `./lib/pdf/web/viewer.html?file=${book.key}`;
  }
  static reloadBooks() {
    window.location.reload();
  }
  static getRendtion = (
    result: ArrayBuffer,
    format: string,
    readerMode: string,
    charset: string,
    animation: string
  ) => {
    let rendition;
    if (format === "CACHE") {
      rendition = new window.Kookit.CacheRender(result, readerMode, animation);
    } else if (format === "MOBI" || format === "AZW3" || format === "AZW") {
      rendition = new window.Kookit.MobiRender(result, readerMode, animation);
    } else if (format === "EPUB") {
      rendition = new window.Kookit.EpubRender(result, readerMode, animation);
    } else if (format === "TXT") {
      let text = iconv.decode(Buffer.from(result), charset || "utf8");
      rendition = new window.Kookit.TxtRender(text, readerMode, animation);
    } else if (format === "MD") {
      rendition = new window.Kookit.MdRender(result, readerMode, animation);
    } else if (format === "FB2") {
      rendition = new window.Kookit.Fb2Render(result, readerMode, animation);
    } else if (format === "DOCX") {
      rendition = new window.Kookit.DocxRender(result, readerMode, animation);
    } else if (format === "HTML" || format === "XHTML" || format === "MHTML" || format === "HTM" || format === "XML") {
      rendition = new window.Kookit.HtmlRender(result, readerMode, format, animation);
    } else if (format === "CBR" || format === "CBT" || format === "CBZ" || format === "CB7") {
      rendition = new window.Kookit.ComicRender(copyArrayBuffer(result), readerMode, format, animation);
    }
    return rendition;
  };
  static async extractEpubFirstPage(rendition: any): Promise<string> {
    return new Promise(async (resolve) => {
      try {
        // Get the first section/page
        const section = await rendition.getSection(0);

        // Create a temporary div to render the content
        const tempDiv = document.createElement("div");
        tempDiv.style.position = "absolute";
        tempDiv.style.left = "-9999px";
        document.body.appendChild(tempDiv);

        // Set dimensions similar to PDF rendering
        const width = 1024;
        const height = 1450;
        tempDiv.style.width = `${width}px`;
        tempDiv.style.height = `${height}px`;

        // Render the content
        await rendition.renderSection(section, tempDiv);

        // Use html2canvas to capture the rendered content
        const canvas = await html2canvas(tempDiv, {
          width,
          height,
          scale: 1.5,
          useCORS: true,
          allowTaint: true,
        });

        // Convert to base64
        const cover = canvas.toDataURL("image/jpeg", 0.8);

        // Cleanup
        document.body.removeChild(tempDiv);

        resolve(cover);
      } catch (error) {
        console.error("Error extracting EPUB first page:", error);
        resolve("");
      }
    });
  }
  static generateBook(
    bookName: string,
    extension: string,
    md5: string,
    size: number,
    path: string,
    file_content: ArrayBuffer,
    file_key: string,
    thumbnail: string,
    thumb_url: string,
    source_url: string,
    key: string
  ) {
    return new Promise<BookModel | string>(async (resolve, reject) => {
      try {
        let cover: any = "";
        let name: string, author: string, publisher: string, description: string, charset: string, page: number;
        [name, author, description, publisher, charset, page] = [bookName, "Unknown author", "", "", "", 0];
        let metadata: any;
        let rendition = BookUtil.getRendtion(
          file_content,
          extension.toUpperCase(),
          "",
          "",
          StorageUtil.getReaderConfig("isSliding") === "yes" ? "sliding" : ""
        );

        switch (extension) {
          case "pdf":
            metadata = await getPDFMetadata(copyArrayBuffer(file_content));
            [name, author, publisher, cover, page] = [
              metadata.name || bookName,
              metadata.author || "Unknown author",
              metadata.publisher || "",
              metadata.cover || "",
              metadata.pageCount || 0,
            ];
            if (cover.indexOf("image") === -1) {
              cover = "";
            }
            break;
          case "epub":
            metadata = await rendition.getMetadata();
            if (metadata === "timeout_error") {
              resolve("get_metadata_error");
              break;
            }

            [name, author, description, publisher] = [
              metadata.name || bookName,
              metadata.author || "Unknown author",
              metadata.description || "",
              metadata.publisher || "",
            ];

            // Try to get cover from metadata first
            cover = metadata.cover || "";

            // If no cover in metadata, extract first page
            if (!cover || cover.indexOf("image") === -1) {
              cover = await BookUtil.extractEpubFirstPage(rendition);
            }

            break;
          case "mobi":
          case "azw":
          case "azw3":
            metadata = await rendition.getMetadata();
            [name, author, description, publisher, cover] = [
              metadata.name || bookName,
              metadata.author || "Unknown author",
              metadata.description || "",
              metadata.publisher || "",
              metadata.cover || "",
            ];
            break;
          case "fb2":
            metadata = await rendition.getMetadata();
            [name, author, description, publisher, cover] = [
              metadata.name || bookName,
              metadata.author || "Unknown author",
              metadata.description || "",
              metadata.publisher || "",
              metadata.cover || "",
            ];
            break;
          case "cbr":
          case "cbt":
          case "cbz":
          case "cb7":
            metadata = await rendition.getMetadata();
            cover = metadata.cover;
            break;
          case "txt":
            metadata = await rendition.getMetadata(file_content);
            charset = metadata.charset;
            break;
          default:
            break;
        }
        let format = extension.toUpperCase();
        // key = new Date().getTime() + "";
        // key = file_key;
        if (StorageUtil.getReaderConfig("isPrecacheBook") === "yes" && extension !== "pdf") {
          let cache = await rendition.preCache(file_content);
          if (cache !== "err") {
            BookUtil.addBook("cache-" + key, cache);
          }
        }
        resolve(
          new BookModel(
            key,
            name,
            author,
            description,
            md5,
            cover,
            format,
            publisher,
            size,
            page,
            path,
            charset,
            file_key,
            thumbnail,
            thumb_url,
            source_url
          )
        );
      } catch (error) {
        console.log(error);
        resolve("get_metadata_error");
      }
    });
  }
}

export default BookUtil;
