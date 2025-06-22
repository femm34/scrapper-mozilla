import { DEFAULT_VALUES } from '../utils/Constants.js';

export class ArticleEntity {
  constructor(data = {}) {
    this.title = this.sanitizeString(data.title) || DEFAULT_VALUES.EMPTY_FIELD;
    this.summary = this.sanitizeString(data.summary) || DEFAULT_VALUES.EMPTY_FIELD;
    this.author = this.processAuthor(data.author) || DEFAULT_VALUES.UNKNOWN_AUTHOR;
    this.publishDate = this.sanitizeString(data.publishDate) || DEFAULT_VALUES.EMPTY_FIELD;
    this.url = this.sanitizeUrl(data.url) || DEFAULT_VALUES.EMPTY_FIELD;
    this.featuredImage = this.sanitizeUrl(data.featuredImage) || DEFAULT_VALUES.EMPTY_FIELD;
    this.createdAt = new Date().toISOString();
  }

  /**
   * Sanitizes string input removing extra whitespace
   * @param {string} str - Input string to sanitize
   * @returns {string} Sanitized string
   */
  sanitizeString(str) {
    return typeof str === 'string' ? str.trim() : '';
  }

  /**
   * Processes author name removing common image alt text artifacts
   * @param {string} author - Raw author string
   * @returns {string} Processed author name
   */
  processAuthor(author) {
    if (!author || typeof author !== 'string') {
      return DEFAULT_VALUES.UNKNOWN_AUTHOR;
    }
    
    const cleaned = author
      .replace(/(photo|avatar|image)/gi, '')
      .trim();
    
    return cleaned || DEFAULT_VALUES.UNKNOWN_AUTHOR;
  }

  /**
   * Validates and sanitizes URL
   * @param {string} url - Input URL
   * @returns {string} Validated URL or empty string
   */
  sanitizeUrl(url) {
    if (!url || typeof url !== 'string') return '';
    
    const trimmed = url.trim();
    try {
      new URL(trimmed);
      return trimmed;
    } catch {
      return '';
    }
  }

  /**
   * Validates if article has minimum required data
   * @returns {boolean} True if article is valid
   */
  isValid() {
    return this.title !== DEFAULT_VALUES.EMPTY_FIELD && 
           this.url !== DEFAULT_VALUES.EMPTY_FIELD;
  }

  /**
   * Converts entity to plain object for export
   * @returns {Object} Plain object representation
   */
  toPlainObject() {
    return {
      titulo: this.title,
      resumen: this.summary,
      autor: this.author,
      fecha: this.publishDate,
      url: this.url,
      imagen: this.featuredImage
    };
  }

  /**
   * Creates ArticleEntity from scraped DOM data
   * @param {Object} domData - Raw DOM data from scraping
   * @returns {ArticleEntity} New article instance
   */
  static fromScrapedData(domData) {
    return new ArticleEntity({
      title: domData.titulo,
      summary: domData.resumen,
      author: domData.autor,
      publishDate: domData.fecha,
      url: domData.url,
      featuredImage: domData.imagen
    });
  }
}