<div align="center" >
  <img src="https://dl.koodoreader.com/screenshots/logo.png" width="96px" height="96px"/>
</div>

<h1 align="center">
  AI eBook Library Tanjung Piai
</h1>

<h3 align="center">
  A cross-platform ebook reader
</h3>

## Preview

<div align="center">
  <br/>
  <kbd><img src="https://dl.koodoreader.com/screenshots/1.png" width="800px"></kbd>
  <br/>
  <br/>
  <kbd><img src="https://dl.koodoreader.com/screenshots/5.png" width="800px"></kbd>
  <br/>
</div>

## Feature

- Format support:
  - EPUB (**.epub**)
  - PDF (**.pdf**)
  - Comic book archive (**.cbr**, **.cbz**, **.cbt**, **.cb7**)
  - Rich text (**.md**, **.docx**)
  - Hyper Text (**.html**, **.xml**, **.xhtml**, **.mhtml**, **.htm**)
- Platform support: **Windows**, **macOS**, **Linux** and **Web**
- Save your data to **OneDrive**, **Google Drive**, **Dropbox**, **FTP**, **SFTP**, **WebDAV**, **S3**, **S3 Compatible**
- Customize the source folder and synchronize among multiple devices using OneDrive, iCloud, Dropbox, etc.
- Single-column, two-column, or continuous scrolling layouts
- Text-to-speech, translation, dictionary, touch screen support, batch import
- Add bookmarks, notes, highlights to your books
- Adjust font size, font family, line-spacing, paragraph spacing, background color, text color, margins, and brightness
- Night mode and theme color
- Text highlight, underline, boldness, italics and shadow

## Installation

- Desktop Version:
  - Stable Version (Recommended): [Download](https://koodoreader.com/en)
  - Developer version: [Download](https://github.com/koodo-reader/koodo-reader/releases/latest) ( With new feature and bug fix, but may induce some unknown bugs)
- Web Version：[Preview](https://web.koodoreader.com)

- Install with Docker:

```bash
docker compose up -d
```

## Screenshot

<div align="center">
  <br/>
  <b>List mode</b>
  <br/>
  <br/>
  <kbd><img src="https://dl.koodoreader.com/screenshots/2.png" width="800px"></kbd>
  <br/>
  <br/>
  <b>Cover mode</b>
  <br/>
  <br/>
  <kbd><img src="https://dl.koodoreader.com/screenshots/3.png" width="800px"></kbd>
  <br/>
  <br/>
  <b>Reader menu</b>
  <br/>
  <br/>
  <kbd><img src="https://dl.koodoreader.com/screenshots/6.png" width="800px"></kbd>
  <br/>
  <br/>
  <b>Dark mode</b>
  <br/>
  <br/>
  <kbd><img src="https://dl.koodoreader.com/screenshots/4.png" width="800px"></kbd>
  <br/>
</div>

</div>

## Develop

Make sure that you have installed yarn and git

1. Download the repo

   ```
   git clone https://github.com/Ifzat/ai_ebook_reader.git
   ```

2. Enter desktop mode

   ```
   yarn
   yarn dev
   ```

3. Enter web mode

   ```
   yarn
   yarn start
   ```

## Translation

### Edit current language

| Language(A-Z)   | Code  | View                                                |
| --------------- | ----- | --------------------------------------------------- |
| English         | en    | [View](./src/assets/locales/en/translation.json)    |
| Malay          | ml    | [View](./src/assets/locales/ar/translation.json)    |
| Mandarin        | mn    | [View](./src/assets/locales/hy/translation.json)    |
| Tamil         | tm    | [View](./src/assets/locales/bn/translation.json)    |