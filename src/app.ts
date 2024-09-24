import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import openaiRoutes from './routes/openaiRoutes';

dotenv.config();
const app = express();
app.use(bodyParser.json());

app.use('/api', openaiRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
