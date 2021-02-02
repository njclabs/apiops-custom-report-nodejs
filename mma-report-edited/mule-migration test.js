
const fs = require('fs');
const path = require('path');


const sourcedir = 'C:/Users/Lucky/Desktop/Mule3_projects';
const destdir = 'C:/Users/Lucky/Desktop/Mule4_projects';
const command = 'java -jar c:\\softwares\\mule-migration-assistant-runner-1.0.0\\mule-migration-assistant-runner-1.0.0.jar';

fs.readdirSync(sourcedir).map(file => {
			
	const abspath= path.join(sourcedir, file); 
    const destinationPath = path.join(destdir, file); 			
	console.log(abspath);
	let errorProjects = [];

	// check the read data is a directory
	fs.stat(abspath, (err, stats) => {
		console.log(stats.isDirectory());
					
		if(stats.isDirectory()){
			const { spawnSync } = require('child_process');     
						
			const args = [
						"-muleVersion", "4.3.0",
						"-projectBasePath", abspath, "-destinationProjectBasePath", destinationPath	];

			// run the command line arguments in node js 
			const migration = spawnSync(command, args, {shell: process.platform == 'win32'});
			//console.log("Error while migrating project but generates report for - ", file );
					//console.log(`${migration.stdout}`);
			
					//console.log(`${migration.stderr}`);
				if(`${migration.stdout}`.includes('MIGRATION FAILED')){
					//errorProjects.push(file);

					console.log("Migration failed for - ", file );
					console.log(`${migration.stdout}`);
					
				 }
				 else if (`${migration.stdout}`.includes('MigrationTaskException') && `${migration.stdout}`.includes('MIGRATION ASSISTANT RUN SUCCESSFULLY')){
					console.log("Error occured while migrating but generates report for - ", file );
					console.log(`${migration.stdout}`);
				 }
				 else if(`${migration.stdout}`.includes('MIGRATION ASSISTANT RUN SUCCESSFULLY') && !(`${migration.stdout}`.includes('MigrationTaskException'))){
				//  else{
					console.log(`${migration.stdout}`);
					console.log("Migration successful for - ", file );
				 }
				 else{
					console.log("Destination folder already exist for ", file);}
					console.log(`${migration.stderr}`);
				 }
				   //console.log(`stdout: ${data}`);
				   //console.log("Error while migrating projects but report generated",  errorProjects);
			
				// if(`${migration.stderr}`.includes('Destination folder already exist')){
				// console.error("Destination folder already exist for ", file);}
		

						
		
    			 
    })
    		
    
});