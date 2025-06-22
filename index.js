import { WebScrapingService } from './src/core/WebScrapingService.js';
import { ExporterFactory } from './src/exporters/ExporterFactory.js';
import { FILE_PATHS, EXPORT_FORMATS} from './src/utils/Constants.js'
import { ValidationUtils } from './src/utils/ValidationUtils.js'
import { FileUtils } from './src/utils/FileUtils.js'

class MozillaHacksScraperApplication {
  
  constructor() {
    this.scrapingService = new WebScrapingService();
    this.startTime = null;
    this.articles = [];
  }

  async run() {
    try {
      this.startTime = Date.now();
      this.displayWelcomeMessage();
      
      await this.executeScrapingProcess();
      await this.executeExportProcess();
      
      this.displaySuccessMessage();
      
    } catch (error) {
      this.handleApplicationError(error);
      process.exit(1);
    }
  }

  displayWelcomeMessage() {
    console.log('');
    console.log(' ================================');
    console.log(' Mozilla Hacks Article Scraper');
    console.log(' ================================');
    console.log('');
    console.log(' Starting web scraping process...');
    console.log(' Target: https://hacks.mozilla.org/');
    console.log('');
  }


  async executeScrapingProcess() {

    this.articles = await this.scrapingService.scrapeArticles();
    
    if (!ValidationUtils.validateArticlesArray(this.articles)) {
      throw new Error('Failed to extract valid articles from target website');
    }
  
  }

  async executeExportProcess() {    
    const exportPromises = this.createExportPromises();
    const results = await Promise.allSettled(exportPromises);
    
    this.processExportResults(results);
  }

  createExportPromises() {
    const exportTasks = [
      { format: EXPORT_FORMATS.JSON, path: FILE_PATHS.ARTICLES_JSON },
      { format: EXPORT_FORMATS.CSV, path: FILE_PATHS.ARTICLES_CSV },
      { format: EXPORT_FORMATS.XLSX, path: FILE_PATHS.ARTICLES_XLSX },
      { format: EXPORT_FORMATS.TXT, path: FILE_PATHS.ARTICLES_TXT },
      { format: EXPORT_FORMATS.PDF, path: FILE_PATHS.ARTICLES_PDF }
    ];

    return exportTasks.map(task => this.exportToFormat(task.format, task.path));
  }

  async exportToFormat(format, filePath) {
    try {
      const exporter = ExporterFactory.createExporter(format);
      await exporter.exportToFile(filePath, this.articles);
      
      return { 
        format, 
        filePath, 
        success: true,
        size: await FileUtils.getFileSize(filePath)
      };
      
    } catch (error) {
      return { 
        format, 
        filePath, 
        success: false, 
        error: error.message 
      };
    }
  }

  processExportResults(results) {
    let successCount = 0;
    let totalSize = 0;

    results.forEach(result => {
      const { value } = result;
      
      if (value?.success) {
        successCount++;
        totalSize += value.size || 0;
      } else {
        console.error(`Export failed for ${value.format} (${value.filePath}): ${value.error}`);
      }
    });
  }


  displaySuccessMessage() {
    const executionTime = ((Date.now() - this.startTime) / 1000).toFixed(2);
    
    console.log('');
    console.log(' ================================');
    console.log(' SCRAPING COMPLETED SUCCESSFULLY');
    console.log(' ================================');
    console.log('');
    console.log(` Performance Metrics:`);
    console.log(`   • Articles extracted: ${this.articles.length}`);
    console.log(`   • Execution time: ${executionTime}s`);
    console.log(`   • Output directory: ${FILE_PATHS.OUTPUT_DIR}`);
    console.log('');
    console.log(' Generated files:');
    console.log('   • articles.json  - Structured JSON data');
    console.log('   • articles.csv   - Spreadsheet compatible');
    console.log('   • articles.xlsx  - Excel workbook');
    console.log('   • articles.txt   - Human readable text');
    console.log('   • articles.pdf   - Professional document');
    console.log('');
  }

  handleApplicationError(error) {
    console.error('');
    console.error(' ================================');
    console.error(' APPLICATION ERROR');
    console.error(' ================================');
    console.error('');
    console.error(` Error: ${error.message}`);
    console.error('');
    
    if (process.env.NODE_ENV === 'development') {
      console.error(' Stack trace:');
      console.error(error.stack);
      console.error('');
    }
    
    console.error(' Troubleshooting suggestions:');
    console.error('   • Check internet connection');
    console.error('   • Verify target website accessibility');
    console.error('   • Ensure write permissions for output directory');
    console.error('   • Run with NODE_ENV=development for detailed logs');
    console.error('');
  }
}


async function bootstrap() {
  const app = new MozillaHacksScraperApplication();
  await app.run();
}

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

if (import.meta.url === `file://${process.argv[1]}`) {
  bootstrap().catch(console.error);
}