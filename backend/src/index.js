require('dotenv').config()

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const routes = require('./routes');

const app = express();

mongoose.connect(process.env.MONGO_STRING_CONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

app.use(cors({}))
app.use(express.json());
app.use(routes);

// Query Params: request.query (Filtros, ordenação, pág..)
// Route Params: request.params (Identificar em remoção/alteração))
// Body: request.body (Dados para criação/alteração)

app.listen(3333);