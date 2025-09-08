const express = require('express');
const app = express();
require('dotenv').config();
require('./model/index');
const user = require('./model/userSchema');
const vacancy = require('./model/vacancySchema');
const port = process.env.port;
app.listen(port,()=>{
    console.log(`server is running on -${port}`);
});