import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';

class WebsiteScraper {
    private visitedUrls: Set<string> = new Set();
    private maxPages: number = 50;
    private outputFilePath: string;
    private pageDelimiter: string = '\n\n==== PAGE DELIMITER ====\n\n';

    constructor(maxPages?: number, outputFilePath?: string) {
        if (maxPages) {
            this.maxPages = maxPages;
        }
        this.outputFilePath = outputFilePath || path.join(process.cwd(), 'scraped_data.txt');
    }

    async scrapeWebsite(startUrl: string): Promise<void> {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        const queue: string[] = [startUrl];

        try {
            // Clear the file content at the start of scraping
            await fs.writeFile(this.outputFilePath, '');

            while (queue.length > 0 && this.visitedUrls.size < this.maxPages) {
                const currentUrl = queue.shift();
                if (!currentUrl || this.visitedUrls.has(currentUrl)) continue;

                console.log(`Scraping: ${currentUrl}`);
                await page.goto(currentUrl, { waitUntil: 'networkidle0' });

                // Extract text from the current page
                const pageText = await page.evaluate(() => document.body.innerText);
                const cleanedText = pageText.replace(/\s+/g, ' ').trim();

                // Save the scraped data to file after each page
                await this.appendScrapedData(currentUrl, cleanedText);

                // Find and queue new links
                const links = await page.evaluate((baseUrl) => {
                    return Array.from(document.querySelectorAll('a'))
                        .map(a => a.href)
                        .filter(href => href.startsWith(baseUrl));
                }, startUrl);

                for (const link of links) {
                    if (!this.visitedUrls.has(link)) {
                        queue.push(link);
                    }
                }

                this.visitedUrls.add(currentUrl);
            }
        } catch (error) {
            console.error(`Error scraping:`, (error as Error).message);
            throw new Error((error as Error).message);
        } finally {
            await browser.close();
        }
    }

    private async appendScrapedData(url: string, content: string): Promise<void> {
        try {
            const data = `URL: ${url}\n\nContent:\n${content}${this.pageDelimiter}`;
            await fs.appendFile(this.outputFilePath, data);
            console.log(`Scraped data for ${url} appended to ${this.outputFilePath}`);
        } catch (error) {
            console.error(`Error appending scraped data:`, (error as Error).message);
        }
    }
}

export default WebsiteScraper;
