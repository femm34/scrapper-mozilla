import { IFileExporter } from '../interfaces/IFileExporter.js';
import { FileUtils } from '../../utils/FileUtils.js';
import { DEFAULT_VALUES } from '../../utils/Constants.js';

export class TextFileExporter extends IFileExporter {
  
  async exportToFile(filePath, articles) {
    if (!this.validateArticles(articles)) {
      throw new Error('Invalid articles provided for text export');
    }

    try {
      const exportData = this.prepareDataForExport(articles);
      const textContent = this.formatAsText(exportData);
      
      await FileUtils.writeFileSecure(filePath, textContent, DEFAULT_VALUES.ENCODING);
      
      console.log(`📝 Text exported: ${filePath} (${await FileUtils.getFileSize(filePath)} bytes)`);
      
    } catch (error) {
      throw new Error(`Text export failed: ${error.message}`);
    }
  }

  formatAsText(articleData) {
    const header = this.createHeader(articleData.length);
    const separator = '═'.repeat(80);
    const articleSeparator = '─'.repeat(80);
    
    const formattedArticles = articleData.map((article, index) => {
      return this.formatSingleArticle(article, index + 1);
    }).join(`\n${articleSeparator}\n`);

    return [header, separator, formattedArticles, separator].join('\n');
  }


  createHeader(totalArticles) {
    const timestamp = new Date().toLocaleString('es-ES');
    return `
MOZILLA HACKS - ARTÍCULOS TÉCNICOS
Generated: ${timestamp}
Total Articles: ${totalArticles}
Source: https://hacks.mozilla.org/
    `.trim();
  }

 
  formatSingleArticle(article, index) {
    return `
 ARTÍCULO #${index}

 Título: ${article.titulo}
 Autor: ${article.autor}
 Fecha: ${article.fecha}
 URL: ${article.url}
  Imagen: ${article.imagen || 'N/A'}

 Resumen:
${this.wrapText(article.resumen, 70)}
    `.trim();
  }


  wrapText(text, maxLength = 70) {
    if (!text || text.length <= maxLength) return text;
    
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
      if ((currentLine + ' ' + word).length <= maxLength) {
        currentLine = currentLine ? currentLine + ' ' + word : word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    
    if (currentLine) lines.push(currentLine);
    return lines.join('\n');
  }

  getFileExtension() {
    return 'txt';
  }

  getFormatName() {
    return 'Text';
  }
}