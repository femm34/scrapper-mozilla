export const SCRAPING_CONFIG = {
  TARGET_URL: 'https://hacks.mozilla.org/',
  BROWSER_OPTIONS: {
    headless: 'new',
    timeout: 30000
  },
  PAGE_OPTIONS: {
    waitUntil: 'networkidle2',
    timeout: 30000
  }
};

export const FILE_PATHS = {
  OUTPUT_DIR: './output',
  ARTICLES_JSON: './output/articles.json',
  ARTICLES_CSV: './output/articles.csv',
  ARTICLES_XLSX: './output/articles.xlsx',
  ARTICLES_TXT: './output/articles.txt',
  ARTICLES_PDF: './output/articles.pdf'
};

export const SELECTORS = {
  ARTICLE_LIST: 'li.list-item',
  TITLE_LINK: '.post__title a',
  SUMMARY: '.post__tease',
  PUBLISH_DATE: '.post__meta .published',
  AUTHOR_IMAGE: 'img[alt]'
};

export const DEFAULT_VALUES = {
  UNKNOWN_AUTHOR: 'Autor Desconocido',
  EMPTY_FIELD: 'N/A',
  ENCODING: 'utf-8'
};

export const EXPORT_FORMATS = {
  JSON: 'json',
  CSV: 'csv',
  XLSX: 'xlsx',
  TXT: 'txt',
  PDF: 'pdf'
};