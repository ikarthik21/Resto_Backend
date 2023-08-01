import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
dotenv.config();
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
const PORT = process.env.PORT || 3100;
import router from './Routes/routes.js'


const app = express();
app.use(cors());
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());




// Mongo Connection //

const url = process.env.MONGO_CONNECTION_URL;

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB successfully');
    })
    .catch((error) => {
        console.log('Error connecting to MongoDB:', error);
    });


// Mongo Connection //



app.use('/', router);



app.listen(PORT, () => {
    console.log(`Backend started on port ${PORT}`);
})





