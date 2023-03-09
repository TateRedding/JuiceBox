require('dotenv').config();

const express = require('express');
const app = express();

app.use(express.urlencoded({ extended: true }));
const bodyParser = require('body-parser');
app.use(bodyParser.json());

const apiRouter = require('./api');
app.use('/api', apiRouter);

const morgan = require('morgan');
app.use(morgan('dev'));
app.use(express.json());

app.use((req, res, next) => {
    console.log('<--- Body Logger START --->');
    console.log(req.body);
    console.log('<--- Body Logger END --->');

    next();
});

const { client } = require('./db');
client.connect();

const { PORT = 3000 } = process.env;
app.listen(PORT, () => {
    console.log('Server running on port', PORT)
});