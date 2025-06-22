import puppeteer from 'puppeteer';
import { ArticleEntity } from './ArticleEntity.js';
import { ScrapingConfig } from '../config/ScrapingConfig.js';
import { SELECTORS } from '../utils/Constants.js';
import { ValidationUtils } from '../utils/ValidationUtils.js';

export class WebScrapingService {
  
  constructor(config = null) {
    this.config = config || new ScrapingConfig();
    this.browser = null;
    this.page = null;
  }

  async initializeBrowser() {
    try {
      this.browser = await puppeteer.launch(this.config.getBrowserOptions());
      this.page = await this.browser.newPage();
      
      await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      await this.page.setViewport({ width: 1920, height: 1080 });
      
    } catch (error) {
      throw new Error(`Failed to initialize browser: ${error.message}`);
    }
  }
  async navigateToPage() {
    const maxRetries = this.config.retryAttempts;
    let attempt = 1;

    while (attempt <= maxRetries) {
      try {
        console.log(`Navigating to ${this.config.targetUrl} (Attempt ${attempt}/${maxRetries})`);
        
        await this.page.goto(this.config.targetUrl, this.config.getPageOptions());
        
        await this.page.waitForSelector(SELECTORS.ARTICLE_LIST, { timeout: 10000 });
        console.log('Page loaded successfully');
        return;
        
      } catch (error) {
        console.warn(` Navigation attempt ${attempt} failed: ${error.message}`);
        
        if (attempt === maxRetries) {
          throw new Error(`Failed to navigate after ${maxRetries} attempts: ${error.message}`);
        }
        
        attempt++;
        await this.delay(this.config.requestDelay * attempt);
      }
    }
  }

  async extractArticleData() {
    try {
      console.log('Extracting article data...');
      
      const articleData = await this.page.$$eval(SELECTORS.ARTICLE_LIST, (nodes) => {
        return nodes.map((li) => {
          const titleLink = li.querySelector('.post__title a');
          const url = titleLink?.href?.trim() ?? '';
          const titulo = titleLink?.innerText?.trim() ?? '';
          
          const resumen = li.querySelector('.post__tease')?.innerText?.trim() ?? '';
          
          const fecha = li.querySelector('.post__meta .published')?.innerText?.trim() ?? '';
          
          const authorImg = li.querySelector('img[alt]');
          let autor = authorImg?.alt?.trim() ?? 'Desconocido';
          
          autor = autor.replace(/(photo|avatar)/i, '').trim() || 'Desconocido';
          
          const imagen = authorImg?.src ?? '';
          
          return { titulo, resumen, autor, fecha, url, imagen };
        });
      });

      console.log(`Extracted ${articleData.length} articles`);
      return articleData;
      
    } catch (error) {
      throw new Error(`Failed to extract article data: ${error.message}`);
    }
  }

  processArticleData(rawData) {
    const articles = rawData
      .map(data => ArticleEntity.fromScrapedData(data))
      .filter(article => article.isValid());

    console.log(`Processed ${articles.length} valid articles`);
    
    if (articles.length === 0) {
      throw new Error('No valid articles were extracted');
    }

    return articles;
  }

  async scrapeArticles() {
    try {
      if (!this.config.isValid()) {
        throw new Error('Invalid scraping configuration');
      }

      await this.initializeBrowser();
      await this.navigateToPage();
      
      const rawData = await this.extractArticleData();
      const articles = this.processArticleData(rawData);
      
      return articles;
      
    } catch (error) {
      console.error('Scraping failed:', error.message);
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  async cleanup() {
    try {
      if (this.page) {
        await this.page.close();
      }
      if (this.browser) {
        await this.browser.close();
      }
    } catch (error) {
      console.warn('Cleanup warning:', error.message);
    }
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static forUrl(targetUrl) {
    if (!ValidationUtils.isValidUrl(targetUrl)) {
      throw new Error('Invalid target URL provided');
    }
    
    const config = new ScrapingConfig({ targetUrl });
    return new WebScrapingService(config);
  }
}