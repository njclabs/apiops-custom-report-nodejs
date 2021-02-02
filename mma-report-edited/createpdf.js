const path = require('path');
const fse = require('fs-extra');
const puppeteer = require('puppeteer');     // to create a pdf file


( async function() {

    try{
        console.log('Starting: Generating PDF Process, Kindly wait ..');
        /** Launch a headleass browser */
        const browser = await puppeteer.launch();
        /* 1- Create a newPage() object. It is created in default browser context. */
        const page = await browser.newPage();
        
        await page.setContent('<h1>hello</h1>');
        await page.emulateMediaType('screen')
        //await page.emulateMedia('screen');
        await page.pdf({
            path: 'test.pdf',
            format: 'A4',
            printBackground: true
        });
        
        
	/* 4- Cleanup: close browser. */
	await browser.close();
    console.log('Ending: Generating PDF Process');
    
    process.exit();
    }catch(e){
        console.log('error: ', e);
    }
})();

const init = async () => {
	try {
		const pdf = await printPdf();
		fs.writeFileSync(buildPathPdf, pdf);
		console.log('Succesfully created an PDF table');
	} catch (error) {
		console.log('Error generating PDF', error);
	}
};