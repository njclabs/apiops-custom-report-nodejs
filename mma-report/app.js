const path = require ('path');
const express = require('express');
//const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const Issue = require('./models/dbmodel');
const {connectDB,getAllCollection, addMultipleCollection, addSingleCollection} = require('./db');
// get the error list from te summary file 
const {readSumaryFile} = require("./readSummary");
const {getArrFilePath} = require("./readDir");    // get the list of files to generate custom report
//var util = require('util')
// var reload = require('reload')
// var http = require('http')


// create instance of express
const app = express()

// register ejs as view engine
app.set('view engine', 'ejs');

app.use(express.static(__dirname+'/public'));

// const { assert } = require('console');
// const { readSync } = require('fs');
// const { request } = require('http');

const rate = 10; // cost per hour

// set static file path 
const filePath = (path.join(__dirname, 'resource','summary.html'));


// connect to mongoDB database using mongoose module 
connectDB();


// add the missing issues to the database
//addMultipleCollection(missingIssues);

//listen to a port
app.listen(3000);

let rootPath = 'E:/Mule/InputFile';

const fileList = getArrFilePath(rootPath)           // get array of all the summary files with path
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



// make a get request
app.get('/', (req,res) => {

    // Read summery report from each path and dislay a custom report
    // const fileArray = Object.entries(fileList);
    // // Use loop to reas each summary report 
    // fileArray.forEach(([key,value])=> {
    //     console.log("FILENAME ******* ", value)

    //     // get the project from the path
    //     let customReportName = getProjectName(value) + "-summary.html"
    //     console.log("customReportName :: ", customReportName)
 
        Promise.resolve()
            .then (() => {
                
                const fileArrayList =  readSumaryFile(filePath);   // filePath
                const dbArrayList = getAllCollection();
                return Promise.all([fileArrayList, dbArrayList ]);
            })
            
            .then (([fileArrayList, dbArrayList ]) => {
           

                let printData = []          // store array of object o print in html
                let missingIssues = [];     // store array of objects to add in DB
                let estTime = 0;                // estimated time to complete the prject

                // Store only the issues in DB as an array   
                var dbIssue =[];     
                dbArrayList.forEach((item) => {
                    dbIssue.push(item.issue);
                });                

                // console.log("dbArrayList ---->", dbArrayList) 
                // console.log("fileArrayList ---->", fileArrayList) 
                // Loop through all the issues in the summary report   
                fileArrayList.forEach((element, x) => {
            
                    // Compare each element in the database with the summary report
                    let check = false;                  // set the boolean 
                    
                    if(dbIssue.includes(element.issue))
                    {
                        let getMatch = dbArrayList.find( data => (data.issue === element.issue))
                        issueCategory = {issue: getMatch.issue, total: element.num , time: getMatch.time}
                        printData.push(issueCategory)
                        estTime += getMatch.time;
                    }
                    
                    else{
                        issueCategory = {issue: element.issue, total: element.num , time: 0}
                        printData.push(issueCategory)

                        //console.log("check point  ==", element.issue);
                        if (!(element.issue == 'Errors:' ||  element.issue == 'Info:' ||  element.issue == 'Warnings:' || (element.issue).includes(".xml"))){
                            issueCategory = {issue: element.issue, time: 0};
                            missingIssues.push(issueCategory)
                            //console.log("missingIssues ==", missingIssues);
                        }
                    }
                    
                });   
                //console.log("printData == ", printData);
                //console.log("missingIssues ==", missingIssues);
                //console.log("estTime ==", estTime)
                
                //addMultipleCollection(missingIssues);    // add the missing issues to the database with time as 0

                // get number of major errors
                let majorErrors = getErrorArray(fileArrayList)
                //console.log("majorErrors ==", majorErrors)

                // get the complexity of the project
                let complexity = getComplexity(majorErrors[0])

                return Promise.all([printData, missingIssues, estTime, complexity ]);

            })
            .then (([printData, missingIssues, estTime, complexity ]) => {
                
                // render a view
                let estCost = estTime * rate;

                // Render the summary report
                // window.location.reload()

                // res.attachment('AddedSummary.html');       // download the customize report
                res.render('index', {complex : complexity, time: estTime, cost:estCost, data: printData});

               // Wait for the process to complete
                //setTimeout(() => {  console.log("Wait for 2000 ms"); }, 2000);
                
                 
            
            })
            .catch ((err) =>{
                console.log(err)
            });
    //}) ;
});




// return the level of complexity 
function getComplexity(num)
{
    if(num < 5) { return 'simple'}
    else if (num > 15) { return 'difficult'}
    else return 'medium'
}

// return array of errors by category
function getErrorArray(fileArrayList){

    let arrError = [];
    let count = 0;
    fileArrayList.forEach((item) => {
        
        if((item.issue).includes(".xml")){
             count += parseInt(item.num)
        }
        else if (item.issue === "Warnings:" ||  item.issue === "Info:"){
            
            arrError.push(count);
            count = 0
        }
        
        
    });
    arrError.push(count);
    return arrError;
}

// Return the name of the the project from the given path
function getProjectName(path){
    var splitPath = path.split("\\")

    // var projectName = splitPath[3];
    // console.log("==", projectName)

    return splitPath[3]
}