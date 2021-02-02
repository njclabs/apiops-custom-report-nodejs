const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const dotenv = require('dotenv') 
// Load configuration
dotenv.config({path: './config/config.env'})
const sourcedir = process.env.MULE3_SRC;
const destdir = process.env.MULE4_DEST;
const command = process.env.MMA_JAR_PATH;
let abspath;
let destinationPath;

function childProjects(sourcedir,gitProject){
var sourceArray = [];
fs.readdirSync(sourcedir).map(file => {	
	
	let clonePath= path.join(sourcedir, file); 
	
	fs.readdirSync(clonePath).map(innerfile => {
			var projectnameFrompath = getProjectNamefromPath(clonePath);
			if(innerfile=="src" && gitProject == projectnameFrompath){
				abspath= clonePath ;
			 	destinationPath = path.join(destdir, file);
			 	sourceArray.push(file); 
				}		
		
			if(innerfile!="src" && innerfile!=".git" && projectnameFrompath.includes(gitProject) ){
				var innerpath= path.join(clonePath, innerfile); 
				var destinPath = path.join(destdir, innerfile); 
				if(fs.statSync(innerpath).isDirectory()){
					abspath = innerpath;
					destinationPath = destinPath;
					sourceArray.push(innerfile);
				}
			}
	});
});
console.log("sourceArray",sourceArray);
return sourceArray;

}

function muleMigration(sourcePath, destinationDirectory,projectName,outputMessage){
	
	console.log("sourcePath:::",sourcePath);
console.log("destinationDirectory:::",destinationDirectory);	
	const args = ["-muleVersion", "4.3.0",
	"-projectBasePath", sourcePath, "-destinationProjectBasePath", destinationDirectory	];

// run the command line arguments in node js 
const migrationOutput = spawnSync(command, args, {shell: process.platform == 'win32'});

if(`${migrationOutput.stdout}`.includes('MIGRATION FAILED')){
	outputMessage.push("Migration failed for ::: " + projectName);
	console.log("1", `${migrationOutput.stdout}`);
	 }
 else if (`${migrationOutput.stdout}`.includes('MigrationTaskException') && `${migrationOutput.stdout}`.includes('MIGRATION ASSISTANT RUN SUCCESSFULLY')){
	outputMessage.push("Error: Issue occured while migrating " + projectName + "but generates report");
	console.log("2", `${migrationOutput.stdout}`);
	}
 else if(`${migrationOutput.stdout}`.includes('MIGRATION ASSISTANT RUN SUCCESSFULLY') && !(`${migrationOutput.stdout}`.includes('MigrationTaskException'))){
	//outputMessage.push("Migration successful for ::: " + projectName);
	outputMessage.push(projectName + " project migrated successfully." );
	console.log("3", `${migrationOutput.stdout}`);
	}
  else{
	  //outputMessage.push("Destination folder already exist for ::: " + projectName);
	  outputMessage.push("Error: " + projectName + " folder already exists.");
	  console.log("4", `${migrationOutput.stderr}`)
}
console.log("final outputMessage before return ::: ", outputMessage );
return outputMessage;
}


function getProjectNamefromPath(path){
	var splitPath = path.split("\\");
	var str = splitPath[splitPath.length-1]
  return str;
}


module.exports = {childProjects,muleMigration}






