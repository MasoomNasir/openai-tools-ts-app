import express from 'express';
import dotenv from 'dotenv';
import openaiRoutes from './routes/openaiRoutes';
import cors from 'cors';
import embedRoutes from './routes/embedRoutes';
import scrapperRoutes from './routes/scrapperRoutes';
import { swaggerUi, specs } from './swagger';

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());
app.get("/", (req, res) => {
 return res.status(200).json({
    success: true,
    message: "Welcome to the OpenAI Tools API"
  })
})
app.use('/api/chat', openaiRoutes);
app.use('/api/embed', embedRoutes);
app.use('/api/scrape', scrapperRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found"
  })
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
