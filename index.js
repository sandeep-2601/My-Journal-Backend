const express = require('express');
const connectToMongo = require('./db');

const port  = 3000;
const app = express();

connectToMongo();

app.use(express.json());

app.get('/',(req,res)=>{
    res.send("Hello welcome here");
});

app.use('/api/user',require('./routes/auth'));

app.get('/:id',(req,res)=>{
    const id = req.params.id;
    res.send(`Hello welcome here ${id}`);
});

app.listen(port,()=>{
    console.log(`listen to port ${port}`);
});