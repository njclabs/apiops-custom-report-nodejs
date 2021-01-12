const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const sourcedir = 'E:/Mule/mule3Convert';
const destdir = 'E:/Mule/Destination';
const command = 'java -jar E:\\mule-migration-assistant-runner-1.0.0\\mule-migration-assistant-runner-1.0.0.jar';

fs.readdirSync(sourcedir).map(file => {
			
	const abspath= path.join(sourcedir, file); 
    const destinationPath = path.join(destdir, file); 			
	console.log(abspath);
	//let errorProjects = [];

	// check the read data is a directory
	fs.stat(abspath, (err, stats) => {
		console.log("isDirectory: ", stats.isDirectory());
					
		if(stats.isDirectory()){			     
						
			const args = [
						"-muleVersion", "4.3.0",
						"-projectBasePath", abspath, "-destinationProjectBasePath", destinationPath	];

			// run the command line arguments in node js 
			const migration = spawnSync(command, args, {shell: process.platform == 'win32'});
				if(`${migration.stdout}`){
					console.log(`${migration.stdout}`)	;
				}
				if(`${migration.stderr}`){
					console.log("Destination Folder already exist for - ", file , "\r\n", `${migration.stderr}`)	;
					
				}
						
		}
    			 
    })
    		
    
});