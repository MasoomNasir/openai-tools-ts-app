import { OpenAI } from 'openai';
import { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources/chat';
import { getTotalProductCount, getProductById, getTopRatedProduct, getTotalItemCount, getProductsByCategory, Category, getCategories } from '../utils/inventory';
import { ChromaClient, OpenAIEmbeddingFunction } from 'chromadb';

export default class OpenAiService {
  private openai: OpenAI;
  private chromaClient: ChromaClient;
  private embeddingFunction: OpenAIEmbeddingFunction;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY as string,
    });
    this.chromaClient = new ChromaClient({
      path: 'http://localhost:8000',
    });
    this.embeddingFunction = new OpenAIEmbeddingFunction({
      openai_api_key: process.env.OPENAI_API_KEY as string,
    });
  }

  async chatWithStockMaster(prompt: string): Promise<string> {
    try {
      const messages: ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: 'You are a helpful assistant that gives information about the inventory. You have access to the following functions: getTotalProductCount, getProductsByCategory'
        },
        { role: "user", content: prompt }
      ];
      const tools: ChatCompletionTool[] = [
        {
          type: "function",
          function: {
            name: "getTotalProductCount",
            description: "Get the total Products in the inventory",
          }
        },
        {
          type: "function",
          function: {
            name: "getProductById",
            description: "Get the Product details by product id",
            parameters: {
              type: "object",
              properties: {
                productId: {
                  type: "integer",
                  description: "The id of the product to get details for"
                }
              },
              required: ["productId"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "getTopRatedProduct",
            description: "Get the top rated product in the inventory",
          }
        },
        {
          type: "function",
          function: {
            name: "getTotalItemCount",
            description: "Get the total item count in the inventory",
          }
        },
        {
          type: "function",
          function: {
            name: "getProductsByCategory",
            description: "To get the products by category and also the total products in that category",
            parameters: {
              type: "object",
              properties: {
                category: {
                  type: "string",
                  description: "The category of the products to get",
                  enum: Object.values(Category)
                }
              },
              required: ["category"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "getCategories",
            description: "Get the total categories of the products in the inventory",
          }
        }
      ];

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messages,
        tools: tools,
        tool_choice: "auto",
        max_tokens: 1000
      });

      if (response.choices[0].finish_reason === 'tool_calls' && response.choices[0].message.tool_calls) {
        const toolCall = response.choices[0].message.tool_calls[0];
        messages.push(response.choices[0].message);

        let toolResponse: string | object;

        switch (toolCall.function.name) {
          case 'getTotalProductCount':
            toolResponse = getTotalProductCount().toString();
            break;
          case 'getProductById':
          case 'getProductsByCategory':
            const parsedArguments = JSON.parse(toolCall.function.arguments);
            toolResponse = toolCall.function.name === 'getProductById'
              ? getProductById(parsedArguments.productId)
              : getProductsByCategory(parsedArguments.category);
            break;
          case 'getTopRatedProduct':
            toolResponse = getTopRatedProduct();
            break;
          case 'getTotalItemCount':
            toolResponse = getTotalItemCount().toString();
            break;
          case 'getCategories':
            toolResponse = getCategories();
            break;
          default:
            throw new Error(`Unknown function: ${toolCall.function.name}`);
        }

        messages.push({
          role: 'tool',
          content: JSON.stringify(toolResponse),
          tool_call_id: toolCall.id
        });

        const secondResponse = await this.openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: messages
        });

        return secondResponse.choices[0].message.content || "No valid response received";
      }

      return response.choices[0]?.message?.content || "No valid response received";
    } catch (err) {
      throw new Error((err as Error).message);
    }
  }

  async createEmbeddingsAndStoreInDB(texts: string[]) {
    try {
      const collection = await this.chromaClient.getOrCreateCollection({
        name: "iqbal_embeddings",
        embeddingFunction: this.embeddingFunction,
      });

      const embeddings = await Promise.all(texts.map(text =>
        this.openai.embeddings.create({
          model: "text-embedding-3-small",
          input: text,
        })
      ));

      // const dummyEmbeddings = this.generateDummyEmbeddings(texts.length);

      await collection.add({
        ids: texts.map((_, i) => `id_${i}`),
        embeddings: embeddings.map(embedding => embedding.data[0].embedding),
        metadatas: texts.map(text => ({ text })),
        documents: texts,
      });

      // let collection2 = await this.chromaClient.getCollection({
      //   name: "my_embeddings",
      //   embeddingFunction: this.embeddingFunction,
      // }); 
      // await this.chromaClient.deleteCollection({name: "my_embeddings"});  
      console.log("Embeddings saved to Chroma DB");
      return embeddings;
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  async searchEmbeddings(embedding: number[]) {
    try {
      const collection = await this.chromaClient.getOrCreateCollection({
        name: "my_embeddings",
        embeddingFunction: this.embeddingFunction,
      });
      const result = await collection.query({
        queryEmbeddings: [embedding],
        nResults: 1,
      });
      return result;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  }

  async getPromptEmbeddings(prompt: string) {
    try {   
      const embedding = await this.openai.embeddings.create({
        model: "text-embedding-3-small",
        input: prompt,
      });
      return embedding.data[0].embedding;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  }

  private generateDummyEmbeddings(count: number): number[][] {
    const embeddingSize = 384; // Size for text-embedding-3-small model
    return Array.from({ length: count }, () =>
      Array.from({ length: embeddingSize }, () => Math.random())
    );
  }

  async chatWithThirtyNorth(prompt: string) {
    try {
      const embedding = await this.getPromptEmbeddings(prompt);
      const result = await this.searchEmbeddings(embedding);
      console.log(result);
      const messages: ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: 'You are an assistant for Thirty North. Use the provided context to answer questions.'
        },
        {
          role: 'user',
          content: `Context from embedding search:\n${JSON.stringify(result.included)}\n\nUser question: ${prompt}`
        }
      ];

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: messages,
        max_tokens: 200
      });

      return response.choices[0].message.content || "No valid response received";
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }
}
