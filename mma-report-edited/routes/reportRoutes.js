const express = require("express");

const router = express.Router();                    // create instance of express router
const {readSumaryFile} = require("../readSummary"); // read the content from summary.html file 
const {connectDB,getAllCollection, addMultipleCollection, addSingleCollection} = require('../db');     

// get custom report
router.get('/:fileId', (req, res) => {

    // var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    // console.log("fullUrl :: ", fullUrl)

    // get the project name value
    const projectName = req.params.fileId;
    // create path to html file for the given project name
    let projectPath =  process.env.SRC_ROOT_PATH + "/" +projectName + "/report/summary.html"
    console.log("projectPath :: ", projectName)
    
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

              
            // add the missing issues to the database with time as 0
            // https://stackoverflow.com/questions/43374112/filter-unique-values-from-an-array-of-objects
            if(missingIssues.length > 0){
                //-- get the distinct data --
                addMultipleCollection(missingIssues);   
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


            //res.attachment('AddedSummary.html');       // download the customize report  dwFile
            //res.attachment(dwFile);  
            res.render('report', {complex : complexity, time: estTime, cost:estCost, data: printData});

           // Wait for the process to complete
           // setTimeout(() => {  console.log("Wait for 2000 ms"); }, 2000);
           
            
        })
        .catch ((err) =>{
            console.log(err)
        });
    //res.render('report-test.ejs');
});

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

// return the level of complexity 
function getComplexity(num)
{
    if(num < 5) { return 'simple'}
    else if (num > 15) { return 'difficult'}
    else return 'medium'
}

// export the router
module.exports = router;