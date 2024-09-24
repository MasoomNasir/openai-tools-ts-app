import { OpenAI } from 'openai';
import { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources/chat';
import { getTotalProductCount, getProductById, getTopRatedProduct, getTotalItemCount, getProductsByCategory, Category, getCategories } from '../utils/inventory';

export default class OpenAiService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY as string,
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
      const willInvokeFunction = response.choices[0].finish_reason === 'tool_calls';
      if (willInvokeFunction && response.choices[0].message.tool_calls) {
        const tollCall = response.choices[0].message.tool_calls![0]
        if (tollCall.function.name === 'getTotalProductCount') {
          const totalProductCount = getTotalProductCount();
          messages.push(response.choices[0].message);
          messages.push({
            role: 'tool',
            content: totalProductCount.toString(),
            tool_call_id: tollCall.id
          })
        } else if (tollCall.function.name === 'getProductById') {
          const rawArgument = tollCall.function.arguments;
          const parsedArguments = JSON.parse(rawArgument);
          const product = getProductById(parsedArguments.productId);
          messages.push(response.choices[0].message);
          messages.push({
            role: 'tool',
            content: JSON.stringify(product),
            tool_call_id: tollCall.id
          })
          const secondResponse = await this.openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: messages
          })
          return secondResponse.choices[0].message.content || "No valid response received";
        } else if (tollCall.function.name === 'getTopRatedProduct') {
          const topRatedProduct = getTopRatedProduct();
          messages.push(response.choices[0].message);
          messages.push({
            role: 'tool',
            content: JSON.stringify(topRatedProduct),
            tool_call_id: tollCall.id
          })

        } else if (tollCall.function.name === 'getTotalItemCount') {
          const totalItemCount = getTotalItemCount();
          messages.push(response.choices[0].message);
          messages.push({
            role: 'tool',
            content: totalItemCount.toString(),
            tool_call_id: tollCall.id
          })
        } else if (tollCall.function.name === 'getProductsByCategory') {
          const rawArgument = tollCall.function.arguments;
          const parsedArguments = JSON.parse(rawArgument);
          const productsByCategory = getProductsByCategory(parsedArguments.category);
          messages.push(response.choices[0].message);
          messages.push({
            role: 'tool',
            content: JSON.stringify(productsByCategory),
            tool_call_id: tollCall.id
          })
        } else if (tollCall.function.name === 'getCategories') {
          const categories = getCategories();
          messages.push(response.choices[0].message);
          messages.push({
            role: 'tool',
            content: JSON.stringify(categories),
            tool_call_id: tollCall.id
          })
        }
        const secondResponse = await this.openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: messages
        })
        return secondResponse.choices[0].message.content || "No valid response received";
      }
      return response.choices[0]?.message?.content || "No valid response received";
    } catch (err) {
      throw new Error((err as Error).message);
    }
  }
}
