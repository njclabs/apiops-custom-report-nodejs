const { getAllCollection } = require('../db');
const { readSumaryFile } = require("../utils/readSummary");
const path = require('path');
const filePath = (path.join(__dirname, '..', 'resource', 'summary.html'));
const rate = 10;
exports.fetchReports = async () => {
    try {
        const fileArrayList = await readSumaryFile(filePath);   // filePath
        const dbArrayList = await getAllCollection();
        let dbIssue = dbArrayList.map(item => { return item.issue })
        let printData = [];
        let missingIssues = [];
        let estTime = 0;
        fileArrayList.forEach(async (element, x) => {
            // Compare each element in the database with the summary report
            let check = false;

            if (dbIssue.includes(element.issue)) {
                let getMatch = dbArrayList.find(data => (data.issue === element.issue))
                issueCategory = { issue: getMatch.issue, total: element.num, time: getMatch.time }
                printData.push(issueCategory)
                estTime += getMatch.time;
            }

            else {

                issueCategory = { issue: element.issue, total: element.num, time: 0 }
                printData.push(issueCategory)

                //console.log("check point  ==", element.issue);
                if (!(element.issue == 'Errors:' || element.issue == 'Info:' || element.issue == 'Warnings:' || (element.issue).includes(".xml"))) {
                    issueCategory = { issue: element.issue, time: 0 };
                    missingIssues.push(issueCategory)
                }
            }

        });
        let majorErrors = getErrorArray(fileArrayList)

        // get the complexity of the project
        let complexity = getComplexity(majorErrors[0]);
        let estCost = estTime * rate;

        return { complex: complexity, time: estTime, cost: estCost, data: printData }
    } catch (er) {
        return er;
    }
}

function getComplexity(num) {
    if (num < 5) { return 'simple' }
    else if (num > 15) { return 'difficult' }
    else return 'medium'
}

// return array of errors by category
function getErrorArray(fileArrayList) {

    let arrError = [];
    let count = 0;
    fileArrayList.forEach((item) => {

        if ((item.issue).includes(".xml")) {
            count += parseInt(item.num)
        }
        else if (item.issue === "Warnings:" || item.issue === "Info:") {

            arrError.push(count);
            count = 0
        }


    });
    arrError.push(count);
    return arrError;
}

// Return the name of the the project from the given path
async function getProjectName(path) {
    var splitPath = path.split("\\")

    // var projectName = splitPath[3];
    // console.log("==", projectName)

    return splitPath[3]
}