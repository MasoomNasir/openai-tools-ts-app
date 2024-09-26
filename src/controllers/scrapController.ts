import { Request, Response } from 'express';
import WebsiteScraper from '../services/scrapper.service';

export const scrape = async (req: Request, res: Response) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({
                success: false,
                error: "url is required"
            })
        }

        const scrapper = new WebsiteScraper();
        const scrapedText = await scrapper.scrapeWebsite(url);
        res.status(200).json({
            success: true,
            scrapedText
        })
    } catch (error: any) {
        console.log(error)
        res.status(500).json({
            success: false,
            error: error.message
        })
    }
}