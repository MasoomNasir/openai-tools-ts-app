import express from 'express';
import dotenv from 'dotenv';
import openaiRoutes from './routes/openaiRoutes';
import cors from 'cors';

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());
app.use("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the OpenAI Tools API"
  })
})
app.use('/api/chat', openaiRoutes);
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
