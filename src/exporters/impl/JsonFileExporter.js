import { IFileExporter } from '../interfaces/IFileExporter.js';
import { FileUtils } from '../../utils/FileUtils.js';
import { DEFAULT_VALUES } from '../../utils/Constants.js';

export class JsonFileExporter extends IFileExporter {
  
  async exportToFile(filePath, articles) {
    if (!this.validateArticles(articles)) {
      throw new Error('Invalid articles provided for JSON export');
    }

    try {
      const exportData = this.prepareDataForExport(articles);
      const jsonOutput = this.createJsonStructure(exportData);
      const jsonString = JSON.stringify(jsonOutput, null, 2);
      
      await FileUtils.writeFileSecure(filePath, jsonString, DEFAULT_VALUES.ENCODING);
      
      console.log(`JSON exported: ${filePath} (${await FileUtils.getFileSize(filePath)} bytes)`);
      
    } catch (error) {
      throw new Error(`JSON export failed: ${error.message}`);
    }
  }

  createJsonStructure(articleData) {
    return {
      metadata: {
        exportedAt: new Date().toISOString(),
        totalArticles: articleData.length,
        source: 'Mozilla Hacks Scraper',
        version: '1.0.0'
      },
      articles: articleData
    };
  }

  getFileExtension() {
    return 'json';
  }

  getFormatName() {
    return 'JSON';
  }
}