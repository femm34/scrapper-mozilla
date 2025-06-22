import { Parser } from 'json2csv';
import { IFileExporter } from '../interfaces/IFileExporter.js';
import { FileUtils } from '../../utils/FileUtils.js';
import { DEFAULT_VALUES } from '../../utils/Constants.js';

export class CsvFileExporter extends IFileExporter {
  
  constructor() {
    super();
    this.csvParser = new Parser({
      fields: [
        { label: 'Título', value: 'titulo' },
        { label: 'Resumen', value: 'resumen' },
        { label: 'Autor', value: 'autor' },
        { label: 'Fecha', value: 'fecha' },
        { label: 'URL', value: 'url' },
        { label: 'Imagen', value: 'imagen' }
      ],
      delimiter: ',',
      quote: '"',
      escapedQuote: '""',
      header: true
    });
  }

  async exportToFile(filePath, articles) {
    if (!this.validateArticles(articles)) {
      throw new Error('Invalid articles provided for CSV export');
    }

    try {
      const exportData = this.prepareDataForExport(articles);
      const csvContent = this.csvParser.parse(exportData);
      
      await FileUtils.writeFileSecure(filePath, csvContent, DEFAULT_VALUES.ENCODING);
      
      console.log(`CSV exported: ${filePath} (${await FileUtils.getFileSize(filePath)} bytes)`);
      
    } catch (error) {
      throw new Error(`CSV export failed: ${error.message}`);
    }
  }

  getFileExtension() {
    return 'csv';
  }

  getFormatName() {
    return 'CSV';
  }
}