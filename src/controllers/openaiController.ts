import { Request, Response } from "express";
import OpenAiService from "../services/openai.service";


export const chatWithStockMaster = async (req: Request, res: Response) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Invalid prompt" });
  }
  try {
    const ai = new OpenAiService()
    const reply = await ai.chatWithStockMaster(prompt)
    res.json({
      success: true,
      response: reply,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
