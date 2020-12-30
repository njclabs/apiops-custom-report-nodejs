const fs = require('fs');
const path = require('path');
const sourcedir = 'C:/Users/Lucky/Desktop/Mule3_projects';
const destdir = 'C:/Users/Lucky/Desktop/Mule4_projects';
//const jarpath = 'C:/Softwares/mule-migration-assistant-runner-1.0.0';
const command = 'java -jar C:\\Softwares\\mule-migration-assistant-runner-1.0.0\\mule-migration-assistant-runner-1.0.0.jar';
/*fs.readdir(dir, (err, files) => {
    if (err) {
        throw err;
    }
*/ // files object contains all files names
    // log them on console
   // files.forEach(file => {
    	fs.readdirSync(sourcedir).map(file => {
    		const abspath= path.join(sourcedir, file); 
    		const destinationPath = path.join(destdir, file); 			
console.log(abspath);
    		fs.stat(abspath, (err, stats) => {
                console.log(stats.isDirectory());
    			
    			if(stats.isDirectory()){
    				const { spawn } = require('child_process');
    				
    	    		const args = [
    	    					"-muleVersion", "4.3.0",
    	    					"-projectBasePath", abspath, "-destinationProjectBasePath", destinationPath	];
    	    		
    	    		const migration = spawn(command, args, {shell: process.platform == 'win32'});
    	    		migration.stdout.on('data', (data) => {
    	    		  console.log(`stdout: ${data}`);
    	    		});

    	    		migration.stderr.on('data', (data) => {
    	    		  console.error(`stderr: ${data}`);
    	    		});

    	    		migration.on('close', (code) => {
    	    		  console.log(`child process exited with code ${code}`);
    	    		});
    				
    			}
    			 
    			})
    		
    		
    		});
    	
    	
        
  //  });
//});