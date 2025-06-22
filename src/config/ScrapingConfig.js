import { SCRAPING_CONFIG } from '../utils/Constants.js';


export class ScrapingConfig {
  constructor(customConfig = {}) {
    this.targetUrl = customConfig.targetUrl || SCRAPING_CONFIG.TARGET_URL;
    this.browserOptions = {
      ...SCRAPING_CONFIG.BROWSER_OPTIONS,
      ...customConfig.browserOptions
    };
    this.pageOptions = {
      ...SCRAPING_CONFIG.PAGE_OPTIONS,
      ...customConfig.pageOptions
    };
    this.retryAttempts = customConfig.retryAttempts || 3;
    this.requestDelay = customConfig.requestDelay || 1000;
  }


  isValid() {
    try {
      new URL(this.targetUrl);
      return this.retryAttempts > 0 && this.requestDelay >= 0;
    } catch {
      return false;
    }
  }

  getBrowserOptions() {
    return this.browserOptions;
  }

  getPageOptions() {
    return this.pageOptions;
  }
  static createDevelopmentConfig() {
    return new ScrapingConfig({
      browserOptions: {
        headless: false,
        devtools: true,
        slowMo: 100
      },
      retryAttempts: 1
    });
  }

  static createProductionConfig() {
    return new ScrapingConfig({
      browserOptions: {
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      },
      retryAttempts: 3
    });
  }
}