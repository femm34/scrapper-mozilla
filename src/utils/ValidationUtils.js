export class ValidationUtils {
  

  static validateArticlesArray(articles) {
    return Array.isArray(articles) && articles.length > 0;
  }

  static isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static isValidFilePath(filePath) {
    return typeof filePath === 'string' && 
           filePath.trim().length > 0 && 
           !filePath.includes('..');
  }

  static isValidExportFormat(format) {
    const supportedFormats = ['json', 'csv', 'xlsx', 'txt', 'pdf'];
    return supportedFormats.includes(format.toLowerCase());
  }

  static sanitizeFilename(filename) {
    return filename.replace(/[<>:"/\\|?*]/g, '_').trim();
  }
}