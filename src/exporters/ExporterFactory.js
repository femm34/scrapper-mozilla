import { JsonFileExporter } from './impl/JsonFileExporter.js';
import { CsvFileExporter } from './impl/CsvFileExporter.js';
import { ExcelFileExporter } from './impl/ExcelFileExporter.js';
import { TextFileExporter } from './impl/TextFileExporter.js';
import { PdfFileExporter } from './impl/PdfFileExporter.js';
import { EXPORT_FORMATS } from '../utils/Constants.js';
import { ValidationUtils } from '../utils/ValidationUtils.js';

export class ExporterFactory {
  

  static exporterRegistry = new Map([
    [EXPORT_FORMATS.JSON, JsonFileExporter],
    [EXPORT_FORMATS.CSV, CsvFileExporter],
    [EXPORT_FORMATS.XLSX, ExcelFileExporter],
    [EXPORT_FORMATS.TXT, TextFileExporter],
    [EXPORT_FORMATS.PDF, PdfFileExporter]
  ]);


  static createExporter(format) {
    const normalizedFormat = format.toLowerCase();
    
    if (!ValidationUtils.isValidExportFormat(normalizedFormat)) {
      throw new Error(`Unsupported export format: ${format}`);
    }

    const ExporterClass = this.exporterRegistry.get(normalizedFormat);
    
    if (!ExporterClass) {
      throw new Error(`No exporter implementation found for format: ${format}`);
    }

    return new ExporterClass();
  }

  static getSupportedFormats() {
    return Array.from(this.exporterRegistry.keys());
  }



  static createAllExporters() {
    const exporters = new Map();
    
    for (const format of this.exporterRegistry.keys()) {
      exporters.set(format, this.createExporter(format));
    }
    
    return exporters;
  }

  static registerExporter(format, ExporterClass) {
    if (!format || !ExporterClass) {
      throw new Error('Both format and ExporterClass are required');
    }

    this.exporterRegistry.set(format.toLowerCase(), ExporterClass);
  }


  static isFormatSupported(format) {
    return this.exporterRegistry.has(format.toLowerCase());
  }


  static getFormatInfo() {
    return Array.from(this.exporterRegistry.entries()).map(([format, ExporterClass]) => {
      const exporter = new ExporterClass();
      return {
        format,
        extension: exporter.getFileExtension(),
        name: exporter.getFormatName()
      };
    });
  }
}