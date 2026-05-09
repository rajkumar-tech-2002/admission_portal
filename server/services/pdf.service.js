const puppeteer = require('puppeteer');
const ejs = require('ejs');
const path = require('path');

class PdfService {
    async generateEnquiryPdf(record) {
        try {
            const templatePath = path.join(__dirname, '../templates/report.ejs');
            
            // Helper functions for template
            const formatDate = (dateStr) => {
                if (!dateStr) return '';
                const date = new Date(dateStr);
                return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
            };

            const formatTime = (dateStr) => {
                if (!dateStr) return '';
                const date = new Date(dateStr);
                return date.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true
                });
            };

            const html = await ejs.renderFile(templatePath, { 
                record, 
                formatDate, 
                formatTime 
            });

            const browser = await puppeteer.launch({
                headless: "new",
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();
            await page.setContent(html, { waitUntil: 'networkidle0' });
            
            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
            });

            await browser.close();
            return pdfBuffer;
        } catch (error) {
            console.error('PDF generation failed:', error);
            throw error;
        }
    }
}

module.exports = new PdfService();
