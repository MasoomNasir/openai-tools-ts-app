import { Request, Response } from "express";

// Initialize OpenAI client

export const chatWithTools = async (req: Request, res: Response) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Invalid prompt" });
  }

  try {
    res.json({
      success: true,
      response: "",
    });
  } catch (error: any) {
    // Error handling with validation
    res.status(500).json({ success: false, error: error.message });
  }
};
