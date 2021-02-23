// import from packages
const path = require('path');
const {URL} = require('url');
const express = require("express");
const puppeteer = require('puppeteer');     // to create a pdf file

const fs = require('fs');
const ejs = require('ejs');

// import within project
const {readSumaryFile} = require("../readSummary"); // read the content from summary.html file 
const {getHtmlResList, readResourceFile} = require("../readResources"); // read sub-error files
const {connectDB,getAllCollection, addMultipleCollection, addSingleCollection} = require('../db');  
const { fstat } = require('fs');

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
                   // console.log("element.issue : ", element.issue);

                    // save the error desription in a variable 
                    // if there is a match 
                    let getMatch = dbArrayList.find( data => (data.issue === element.issue))
                    let calTime = element.num * getMatch.time  // number of issues * time to solve each issue
                    issueCategory = {issue: getMatch.issue, total: element.num , time: calTime, alink: element.link}

                    
                    printData.push(issueCategory)
                    estTime += getMatch.time;
                }
                    
                else{
                    issueCategory = {issue: element.issue, total: element.num , time: 0, alink: element.link}
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

            //get the verification time
            let verifyTime = getVerificationTime(estTime)
            //console.log("verifyTime :", verifyTime);

            return Promise.all([printData, missingIssues,verifyTime, estTime, complexity ]);

        })
        .then (([printData, missingIssues, verifyTime, estTime, complexity ]) => {
                
            // render a view
            // calculate the cost to migrate in hours including the testing time
            let estCost = (((estTime+verifyTime)/60)* process.env.RATE).toFixed(2);

            // calcualte time in hours
            var totaltime = estTime;
            var hours = (totaltime / 60);
            var rhours = Math.floor(hours);
            var minutes = (hours - rhours) * 60;
            var rminutes = Math.round(minutes);
            

            estTime = (estTime/60).toFixed(2);

            // download the generated custom report
            //res.attachment('AddedSummary.html');       // download the customize report  dwFile
            //res.attachment(dwFile); 

            //console.log("printData : ", printData)

            // check if the folder exists or not 
            // if folder does not exist then create a new custom folder
            // const folderName = path.join(process.env.SRC_ROOT_PATH ,  projectName, "report/customResource");
            // try{
            //     if(!fs.existsSync(folderName)){
            //         fs.mkdirSync(folderName)
            //         console.log("New folder created")
            //     }
            // }
            // catch(err){
            //     console.error(err)
            // }


            // read all the html files in the \report\resource folder
            const htmlList = getHtmlResList(selectProject)         

            // Loop through all the issues in the summary report   
            htmlList.forEach((element, x) => {
                console.log("element = ", element)

                // get the filename
                var token = element.split("\\");
                // var customFilename = "./resource/custom-"+token[(token.length-1)]
                var customFilename = "./resources/"+token[(token.length-1)]
                console.log("customFilename = ", customFilename)
                // const result = 
                readResourceFile(element, (issueOnFile, description, issueHrefList, issueDetailList)=>{
                    // console.log("issueOnFile ==> ", issueOnFile); 
                    // console.log("description ==> ", description);
                    // console.log("issueHrefList ==> ", issueHrefList);
                    // console.log("issueDetailList ==> ", issueDetailList);


                    console.log("Create html page");
                    let customSubIssuePath = path.join(__dirname,'/views/error-details.ejs')
                    console.log("path ::" , customSubIssuePath);
                
                    // save the html file
                    //E:\NJCMule_Program\NodeJSExample\mma-report\views\error-details.ejs
                    var template = fs.readFileSync('./views/error-details.ejs', 'utf-8');
                    var html = ejs.render(template,{issue: issueOnFile, des: description, reflinks:issueHrefList, detail: issueDetailList});
                    console.log("Save the html");
                
                    //fs.writeFileSync("./resource/result.html",html,'utf8');
                    fs.writeFileSync(customFilename,html,'utf8');

                }); 
                
            });

            

            res.render('report', {complex : complexity, timeHrs: rhours, timeMins:rminutes, cost:estCost, vtime: verifyTime, data: printData, projectname:selectProject});

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
            // console.log("    filepath::  ", filepath);

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
    if(num < process.env.MIN_ISSUE) { return 'Simple'}
    else if (num > process.env.MAX_ISSUE) { return 'Difficult'}
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

//return the estimated time to test the project
function getVerificationTime(estimatedTime){
    if(estimatedTime < process.env.MIN_TIME) { return 30}
    else if (estimatedTime > process.env.AVG_TIME) { return 90}
    else return 60
}

// export the functions
module.exports = {
    report_display,
    report_createPdf
}