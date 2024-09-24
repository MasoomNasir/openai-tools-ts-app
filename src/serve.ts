import readLineSync from "readline-sync";
import colors from "colors";
import dotenv from 'dotenv';
import OpenAiService from "./services/openai.service";
dotenv.config();

async function run() {
    const openai = new OpenAiService();
    console.log(colors.bold.green("Welcome to the StockMaster Chatbot"));
    console.log(colors.bold.green("You can start the chatting with StockMaster"));
    while (true) {
      const userInput = readLineSync.question(colors.yellow("You: "));
      if (userInput.toLowerCase() === "exit") {
        return;
      }
   
      const response = await openai.chatWithStockMaster(userInput);
      const text = response;
      console.log(colors.green("StockMaster: ") + colors.italic(text));
    }
}

run();