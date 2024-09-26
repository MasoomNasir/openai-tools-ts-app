import { Request, Response } from 'express';
import { readFileSync } from 'fs';
import OpenAiService from '../services/openai.service';


export const createEmbed = async (req: Request, res: Response) => {
    try {
        const text = readFileSync('allama_iqbal.txt', 'utf8');
        const texts = text.split('\n');
        console.log(texts.length);
        let chunkSize = 100;
        const words = text.split(' ');
        const chunks = [];
        let currentChunk = '';

        for (let i = 0; i < words.length; i++) {
            if ((currentChunk + words[i]).length <= chunkSize) {
                currentChunk += (currentChunk ? ' ' : '') + words[i];
            } else {
                chunks.push(currentChunk);
                currentChunk = words[i];
            }
        }
        const openaiService = new OpenAiService();
        // const embed = await openaiService.createEmbeddingsAndStoreInDB(texts);
        res.status(200).json({
            success: true,
            // embed
            texts,
            chunks
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: 'Failed to create embed'
        });
    }
}

export const searchEmbed = async (req: Request, res: Response) => {
    try {
        const { query } = req.body;
        const openaiService = new OpenAiService();
        const embed = await openaiService.searchEmbeddings(query);
        res.status(200).json({
            success: true,
            embed
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: 'Failed to search embed'
        });
    }
}
