// Dummy function to simulate browsing the web
export const browseWeb = (query: string): string => {
  return `Simulated results for the query: "${query}"`;
};

// Dummy function to simulate a calculator tool
export const calculate = (expression: string): string => {
  try {
    const result = eval(expression); // Eval should not be used in production, only for demo purposes
    return `The result of ${expression} is ${result}`;
  } catch (error) {
    return "Invalid expression";
  }
};

// Dummy function to simulate image generation
export const generateImage = (prompt: string): string => {
  return `Simulated generated image based on: "${prompt}"`;
};
