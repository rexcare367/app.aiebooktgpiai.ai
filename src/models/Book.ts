class Book {
  key: string;
  name: string;
  author: string;
  description: string;
  md5: string;
  cover: string;
  format: string;
  publisher: string;
  size: number;
  page: number;
  path: string;
  charset: string;
  file_key: string;
  thumbnail: string;
  thumb_url: string;
  source_url: string;
  constructor(
    key: string,
    name: string,
    author: string,
    description: string,
    md5: string,
    cover: string,
    format: string,
    publisher: string,
    size: number,
    page: number,
    path: string,
    charset: string,
    file_key: string,
    thumbnail: string,
    thumb_url: string,
    source_url: string
  ) {
    this.key = key;
    this.name = name;
    this.author = author;
    this.description = description;
    this.md5 = md5;
    this.cover = cover;
    this.format = format;
    this.publisher = publisher;
    this.size = size;
    this.page = page;
    this.path = path;
    this.charset = charset;
    this.file_key = file_key;
    this.thumbnail = thumbnail;
    this.thumb_url = thumb_url;
    this.source_url = source_url;
  }
}

export default Book;
