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

  sanitizeString(str) {
    return typeof str === 'string' ? str.trim() : '';
  }

  processAuthor(author) {
    if (!author || typeof author !== 'string') {
      return DEFAULT_VALUES.UNKNOWN_AUTHOR;
    }
    
    const cleaned = author
      .replace(/(photo|avatar|image)/gi, '')
      .trim();
    
    return cleaned || DEFAULT_VALUES.UNKNOWN_AUTHOR;
  }

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


  isValid() {
    return this.title !== DEFAULT_VALUES.EMPTY_FIELD && 
           this.url !== DEFAULT_VALUES.EMPTY_FIELD;
  }

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