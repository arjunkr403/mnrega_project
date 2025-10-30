import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import mgnregaRoutes from './routes/mgnregaRoutes.js'
import dbConnect from './config/db.js'

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

//MonogDB connection
dbConnect();

//Routes
app.use('/api/mgnrega', mgnregaRoutes);

app.get('/', (req, res) => {
    res.send("MGNREGA API running");
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));