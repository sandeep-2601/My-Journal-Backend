const express = require('express');
const connectToMongo = require('./db');
const cors = require('cors')
const port = 5000;
const app = express();

connectToMongo();

app.use(express.json());
app.use(cors());

//backend api routes
app.use('/api/user', require('./routes/AuthRoute'));
app.use('/api/note', require('./routes/NoteRoute'));

app.listen(port, () => {
    console.log(`listen to port ${port}`);
        });