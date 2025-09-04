const express = require('express');
const app = express();
require('dotenv').config();
require('./model/index');
const port = process.env.port;
app.listen(port,()=>{
    console.log(`server is running on -${port}`);
})