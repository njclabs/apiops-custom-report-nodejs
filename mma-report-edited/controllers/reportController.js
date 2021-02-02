// import from packages
const path = require('path');
const {URL} = require('url');
const express = require("express");
const puppeteer = require('puppeteer');     // to create a pdf file

// import within project
const {readSumaryFile} = require("../readSummary"); // read the content from summary.html file 
const {connectDB,getAllCollection, addMultipleCollection, addSingleCollection} = require('../db');  

global.selectProject = null;                // global variable to hold the name of current project report

/*
* Read the MMA Report from the converted Mule 4 projects
* Read all the errors listed in the MongoDB database
* Generate a custom report using a template
* Display the report with estimated time and cost for the project
*/
const report_display = (req, res) => {
    
    // get the project name value
    const projectName = req.params.fileId;

    selectProject = projectName;                 // save the selected project
    // create path to html file for the given project name
    let projectPath =  process.env.SRC_ROOT_PATH + "/" +projectName + "/report/summary.html"
    console.log("Selected project :: ", projectName)
    
    let dwFile = projectName + "-summary.html";

    Promise.resolve()
        .then (() => {
                
            const fileArrayList =  readSumaryFile(projectPath);   // filePath
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

            
            // Loop through all the issues in the summary report   
            fileArrayList.forEach((element, x) => {
            
                // Compare each element in the database with the summary report
                let check = false;                  // set the boolean 
                    
                if(dbIssue.includes(element.issue))
                {
                    let getMatch = dbArrayList.find( data => (data.issue === element.issue))
                    let calTime = element.num * getMatch.time
                    issueCategory = {issue: getMatch.issue, total: element.num , time: calTime}
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

              
            // add the missing issues to the database with time as 0
            // https://stackoverflow.com/questions/43374112/filter-unique-values-from-an-array-of-objects
            if(missingIssues.length > 0){
                //-- get the distinct data --
                // filter the array to get unique data
                var uniqueMissingIssue = [];
                missingIssues.forEach(function(item){
                    var uniqueissue = uniqueMissingIssue.findIndex(x => x.issue == item.issue);

                    if(uniqueissue <= -1){
                        uniqueMissingIssue.push({issue: item.issue, time: item.time});
                    }
                });
                
                
                addMultipleCollection(uniqueMissingIssue);   
                //addMultipleCollection(missingIssues);   
            }
             

            // get number of major errors
            let majorErrors = getErrorArray(fileArrayList)
            //console.log("majorErrors ==", majorErrors)

            // get the complexity of the project
            let complexity = getComplexity(majorErrors[0])

            return Promise.all([printData, missingIssues, estTime, complexity ]);

        })
        .then (([printData, missingIssues, estTime, complexity ]) => {
                
            // render a view
            let estCost = estTime * process.env.RATE;

            // download the generated custom report
            //res.attachment('AddedSummary.html');       // download the customize report  dwFile
            //res.attachment(dwFile); 
         
            res.render('report', {complex : complexity, time: estTime, cost:estCost, data: printData, projectname:selectProject});

           // Wait for the process to complete
           // setTimeout(() => {  console.log("Wait for 2000 ms"); }, 2000);
           
            
        })
        .catch ((err) =>{
            console.log(err)
        });
    //res.render('report-test.ejs');
}

/*
* Create a pdf of the custom report on button click
* Open the pdf in the new window
* Allow user to download the pdf 
*/
const report_createPdf = (req, res) =>{
    console.log("Create PDF operation started");
    console.log("selectProject::  ", selectProject);

    
    ( async function() {

        try{
            console.log('Starting: Generating PDF Process, Kindly wait ..');
            // open a new page with the headless browser
            const browser = await puppeteer.launch();
            // Route the headless browser to a new webpage for printing
            const page = await browser.newPage();
            //await page.waitFor(10 * 1000);
            

            // get the path of the custom page
             filepath = 'http://localhost:3000/report/' + selectProject
             console.log("    filepath::  ", filepath);

            // Print the page as pdf
            await page.goto(filepath,{ waitUntil: 'networkidle2'})
            const buffer = await page.pdf({  
                // path: 'test.pdf',
                format: 'A4',
                printBackground: true
               });

            // send the pdf
            res.type('application/pdf')
            res.send(buffer)
            
            
            // Close the headless browser
            await browser.close();
            console.log('Ending: Generating PDF Process');
        
        //process.exit();
        }catch(e){
            console.log('error: ', e);
        }
    })();
    
}

// return the level of complexity 
function getComplexity(num)
{
    if(num < 5) { return 'Simple'}
    else if (num > 15) { return 'Difficult'}
    else return 'Medium'
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

// export the functions
module.exports = {
    report_display,
    report_createPdf
}