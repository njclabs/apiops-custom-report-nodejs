const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const { connectDB } = require('./app/db');

// create instance of express
const app = express()

// register ejs as view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'app', 'views'));


app.use(express.static(__dirname + 'app/public'));
require('./app/routes/reports.routes')(app);
// const { assert } = require('console');
// const { readSync } = require('fs');
// const { request } = require('http');

connectDB();

app.listen(3000);

let rootPath = 'E:/Mule/InputFile';

// const fileList = getArrFilePath(rootPath)           // get array of all the summary files with path
//const fileList = Object.keys(getArrFilePath(rootPath))

// convert object to array
//https://www.samanthaming.com/tidbits/76-converting-object-to-array/
// const fileArray = Object.entries(fileList);
// // Read each values 
// fileArray.forEach(([key,value])=> {
//     //console.log("FILENAME ******* ", value)

//     // get the project name
//     let customReportName = getProjectName(value) + "-summary.html"
//     console.log("customReportName :: ", customReportName)
// }) ; 

// With middleware 
// app.use('/', function(req, res, next){ 
//     res.attachment('newSummary.html'); 
//     //console.log(res.get('Content-Disposition'));  
//     next(); 
// })


