import fs from 'fs';
import PDFDocument from 'pdfkit';
import { IFileExporter } from '../interfaces/IFileExporter.js';
import { FileUtils } from '../../utils/FileUtils.js';

export class PdfFileExporter extends IFileExporter {
  
  constructor() {
    super();
    this.pageMargin = 50;
    this.colors = {
      primary: '#1f2937',
      secondary: '#6b7280',
      accent: '#3b82f6',
      text: '#374151'
    };
  }

  async exportToFile(filePath, articles) {
    if (!this.validateArticles(articles)) {
      throw new Error('Invalid articles provided for PDF export');
    }

    return new Promise(async (resolve, reject) => {
      try {
        const exportData = this.prepareDataForExport(articles);
        await FileUtils.ensureDirectory(filePath);
        
        const doc = this.createPdfDocument();
        const writeStream = fs.createWriteStream(filePath);
        
        doc.pipe(writeStream);
        
        this.renderDocument(doc, exportData);
        
        doc.end();
        
        writeStream.on('finish', async () => {
          console.log(`PDF exported: ${filePath} (${await FileUtils.getFileSize(filePath)} bytes)`);
          resolve();
        });
        
        writeStream.on('error', reject);
        
      } catch (error) {
        reject(new Error(`PDF export failed: ${error.message}`));
      }
    });
  }


  createPdfDocument() {
    return new PDFDocument({
      size: 'A4',
      margin: this.pageMargin,
      info: {
        Title: 'Mozilla Hacks - Artículos Técnicos',
        Author: 'Mozilla Hacks Scraper',
        Subject: 'Artículos técnicos extraídos de Mozilla Hacks',
        Creator: 'Belinda',
        CreationDate: new Date()
      }
    });
  }


  renderDocument(doc, articleData) {
    this.renderHeader(doc, articleData.length);
    this.renderTableOfContents(doc, articleData);
    
    articleData.forEach((article, index) => {
      if (index > 0) doc.addPage();
      this.renderArticle(doc, article, index + 1);
    });
    
    this.renderFooter(doc);
  }

  renderHeader(doc, totalArticles) {
    const pageWidth = doc.page.width - 2 * this.pageMargin;
    
    doc.fillColor(this.colors.primary)
       .fontSize(28)
       .font('Helvetica-Bold')
       .text('Mozilla Hacks', this.pageMargin, 80, { align: 'center' });
    
    doc.fontSize(18)
       .fillColor(this.colors.secondary)
       .text('Artículos Técnicos', this.pageMargin, 120, { align: 'center' });
    

    const metadataY = 160;
    doc.rect(this.pageMargin, metadataY, pageWidth, 80)
       .fillAndStroke('#f8fafc', '#e2e8f0');
    
    doc.fillColor(this.colors.text)
       .fontSize(12)
       .font('Helvetica')
       .text(`Fecha de extracción: ${new Date().toLocaleDateString('es-ES')}`, this.pageMargin + 20, metadataY + 20)
       .text(`Total de artículos: ${totalArticles}`, this.pageMargin + 20, metadataY + 40)
       .text('Fuente: https://hacks.mozilla.org/', this.pageMargin + 20, metadataY + 60);
  }

  renderTableOfContents(doc, articleData) {
    doc.addPage();
    
    doc.fillColor(this.colors.primary)
       .fontSize(20)
       .font('Helvetica-Bold')
       .text('Índice de Contenidos', this.pageMargin, 80);
    
    let yPosition = 120;
    
    articleData.forEach((article, index) => {
      if (yPosition > 700) {
        doc.addPage();
        yPosition = 80;
      }
      
      const title = this.truncateText(article.titulo, 60);
      
      doc.fillColor(this.colors.accent)
         .fontSize(12)
         .font('Helvetica')
         .text(`${index + 1}. ${title}`, this.pageMargin, yPosition, {
           link: `article_${index + 1}`,
           underline: true
         });
      
      yPosition += 25;
    });
  }

  renderArticle(doc, article, articleNumber) {
    const pageWidth = doc.page.width - 2 * this.pageMargin;
    let yPosition = 80;

    doc.addNamedDestination(`article_${articleNumber}`);
    
    doc.fillColor(this.colors.primary)
       .fontSize(18)
       .font('Helvetica-Bold')
       .text(`${articleNumber}. ${article.titulo}`, this.pageMargin, yPosition, {
         width: pageWidth,
         align: 'left'
       });
    
    yPosition += 40;
    

    doc.fillColor(this.colors.secondary)
       .fontSize(11)
       .font('Helvetica')
       .text(`👤 Autor: ${article.autor}`, this.pageMargin, yPosition)
       .text(`📅 Fecha: ${article.fecha}`, this.pageMargin + 200, yPosition);
    
    yPosition += 30;
    

    doc.fillColor(this.colors.text)
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('Resumen:', this.pageMargin, yPosition);
    
    yPosition += 25;
    
    doc.fontSize(12)
       .font('Helvetica')
       .fillColor(this.colors.text)
       .text(article.resumen, this.pageMargin, yPosition, {
         width: pageWidth,
         align: 'justify',
         lineGap: 3
       });
    
    yPosition += Math.ceil(article.resumen.length / 80) * 18 + 30;
    
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('URL del artículo:', this.pageMargin, yPosition);
    
    yPosition += 20;
    
    doc.fontSize(11)
       .fillColor(this.colors.accent)
       .text(article.url, this.pageMargin, yPosition, {
         link: article.url,
         underline: true
       });
  }


  renderFooter(doc) {
    const pageCount = doc.bufferedPageRange().count;
    
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      
      doc.fillColor(this.colors.secondary)
         .fontSize(10)
         .text(`Página ${i + 1} de ${pageCount}`, 
               doc.page.width - 150, 
               doc.page.height - 30, 
               { align: 'right' });
    }
  }


  truncateText(text, maxLength) {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  getFileExtension() {
    return 'pdf';
  }

  getFormatName() {
    return 'PDF';
  }
}