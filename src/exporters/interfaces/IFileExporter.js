export class IFileExporter {
  
  async exportToFile(filePath, articles) {
    throw new Error('exportToFile method must be implemented by subclass');
  }


  getFileExtension() {
    throw new Error('getFileExtension method must be implemented by subclass');
  }


  getFormatName() {
    throw new Error('getFormatName method must be implemented by subclass');
  }


  validateArticles(articles) {
    return Array.isArray(articles) && 
           articles.length > 0 && 
           articles.every(article => article && typeof article.toPlainObject === 'function');
  }

  prepareDataForExport(articles) {
    return articles.map(article => article.toPlainObject());
  }
}