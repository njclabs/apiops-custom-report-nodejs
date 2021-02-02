const fs = require('fs');
const path = require('path');
const express = require("express"); 
const shell = require('shelljs');      
const bodyParser = require('body-parser');
const dotenv = require('dotenv')
const {childProjects,muleMigration} = require("../mule-migration.js");

dotenv.config({path: './config/config.env'})
const cloneDir = process.env.MULE3_SRC;
const destinationPath = process.env.MULE4_DEST;


const git_clone = (req,res) => {
    let gitRepo = req.body.gitValue;
    let cloneCommand =  "git clone " + gitRepo;
    var mule3Project;
    
    var totalProjectsList = [];
    let muleProject = getProjectName(gitRepo);
    console.log("muleProjectNameFromGit",muleProject);
    //console.log("cloneCommand::::", cloneCommand)
    if(gitRepo.includes(".git")){
       console.log("gitRepo::::", gitRepo)
      
       shell.cd(cloneDir);
       console.log("cloneDir", cloneDir)
       fs.readdirSync(cloneDir).map(file => {
           totalProjectsList.push(file);
           console.log("totalProjectsList",totalProjectsList)
       });
       
           
              if(totalProjectsList!=[] && totalProjectsList.includes(muleProject)){
                    console.log("Already cloned");
                    let projectContent = projectContents(muleProject);
                  res.render('cloneOutput', {projectList: [], contents: projectContent, repoName: muleProject});
                }
                else{
                    //console.log("Still Proceed to clone")
                   shell.exec(cloneCommand);
                   let projectContent = projectContents(muleProject);
                res.render('cloneOutput', {projectList: projectContent,  contents: projectContent, repoName: muleProject})
               }
   }
    else{
       res.render('cloneOutput', {projectList: [], repoName: "Not Git Repository"});
    }
}

const git_migrate = (req, res) => {
    let projectName = req.body.project;
    let gitProject = req.body.repoNameValue;
    let sourcePath;
    let projectDestinationPath;
    let migrationOutput;
    
    var outputMessage=[];
    if(Array.isArray(projectName) && projectName.length>0){
        const projectsListValues = Object.entries(projectName);
        projectsListValues.forEach(([key,value])=> {
            sourcePath = path.join(cloneDir,gitProject,value);
             projectDestinationPath = path.join(destinationPath,value);
             migrationOutput = muleMigration(sourcePath,projectDestinationPath,value,outputMessage);
            }) ; 
         
    }
    else{
        sourcePath = path.join(cloneDir,projectName);
        //console.log("sourcePath",sourcePath);
         projectDestinationPath = path.join(destinationPath,projectName);
         migrationOutput = muleMigration(sourcePath,projectDestinationPath,projectName,outputMessage);
    }
    res.render('migrationOutput', {message: migrationOutput, projects: projectName})
   
  
}

function getProjectName(path){
    var splitPath = path.split("/");
    var str = splitPath[splitPath.length-1]
   // console.log("str :: ", str)
  var finalString = str.replace(".git","");
  return finalString;
}
function projectContents(muleProject){
   let projectInfoArr= [];
       let projectsarr = childProjects(cloneDir,muleProject);
       let projectsList = Object.entries(projectsarr);
    projectsList.forEach(([key,value])=> {
        let projInfo;                             // store data in json format
          projInfo = {filename: value};
            projectInfoArr.push(projInfo)
        }) ; 
        console.log("projectInfoArr", projectInfoArr);
        return projectInfoArr;
  
}


// export the functions
module.exports = {
    git_clone,
    git_migrate
}