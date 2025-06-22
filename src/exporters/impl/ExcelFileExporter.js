import xlsx from 'xlsx';
import { IFileExporter } from '../interfaces/IFileExporter.js';
import { FileUtils } from '../../utils/FileUtils.js';

export class ExcelFileExporter extends IFileExporter {
  
  async exportToFile(filePath, articles) {
    if (!this.validateArticles(articles)) {
      throw new Error('Invalid articles provided for Excel export');
    }

    try {
      const exportData = this.prepareDataForExport(articles);
      const workbook = this.createWorkbook(exportData);
      
      await FileUtils.ensureDirectory(filePath);
      xlsx.writeFile(workbook, filePath);
      
      console.log(`Excel exported: ${filePath} (${await FileUtils.getFileSize(filePath)} bytes)`);
      
    } catch (error) {
      throw new Error(`Excel export failed: ${error.message}`);
    }
  }


  createWorkbook(articleData) {
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(articleData);
    
    const columnWidths = [
      { wch: 40 }, // titulo
      { wch: 60 }, // resumen
      { wch: 20 }, // autor
      { wch: 15 }, // fecha
      { wch: 50 }, // url
      { wch: 30 }  // imagen
    ];
    
    worksheet['!cols'] = columnWidths;
    
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Mozilla Hacks Articles');
    
    return workbook;
  }

  getFileExtension() {
    return 'xlsx';
  }

  getFormatName() {
    return 'Excel';
  }
}