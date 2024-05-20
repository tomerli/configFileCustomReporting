/*****************************************************
 * 
 *    CONFIG FILE - CUSTOM REPORTING
 *    
 *    Update the below parameters accordingly:
 * 
 *      createPdfReport [ true/false ]
 *      fileDir
 *      grid
 *      project
 *      token
 *      branch
 * 
 *****************************************************/

checkifModuleExists('axios');
checkifModuleExists('fs');
checkifModuleExists('puppeteer');
checkifModuleExists('path');
checkifModuleExists('image-data-uri');
checkifModuleExists('util');

//need to install the following node modules
const axios = require('axios');
const fs = require('fs');
const puppeteer = require('puppeteer');
const path = require('path');
const imageDataURI = require('image-data-uri');
const util = require('util');
const sleep = util.promisify(setTimeout);


//date parameter in this format : YYYY-MM-DDTHH-MM
var myDate = new Date(Date.now());
dateMonth = (myDate.getMonth() + 1 < 10 ? '0' : '') + (myDate.getMonth() +1);
dateDay = (myDate.getDate() < 10 ? '0' : '') + myDate.getDate();
dateHour = (myDate.getHours() < 10 ? '0' : '') + myDate.getHours();
dateMin = (myDate.getMinutes() < 10 ? '0' : '') + myDate.getMinutes();
dateSec = (myDate.getSeconds() < 10 ? '0' : '') + myDate.getSeconds();
const dateFormatted = myDate.getFullYear() + '-' + dateMonth + '-' + dateDay + 'T' + dateHour + '-' + dateMin;

// true to generate a PDF report in addition to an HTML report
const createPdfReport = true;

// target directory for report generation
const fileDir = "//Users//tomerli//TestimReports//"; // or "C:\\Temp\\TestimReports\\" for Win users

// Array with <testId>: [<resultId>, <resultId>, ...] to support test data sets
const _TESTS = [];

exports.config = {
    grid:       "Testim-Grid",
    project:    "8iuIg6jOYNgj5YnNs5RJ",
    token:      "HFPMMWmDBgphmMFNcfS4oxVts7JPyZChVl1rYgGXBPs5pkKT8C",
    branch:     "master",
    
    afterTest (test) {
        addResult(_TESTS, test.testId, test.resultId);
    },

    async afterSuite () {
        const results = [];
 
        _TESTS.forEach(entry => {
            console.log(`Result IDs for test ${entry.key}:`);
            entry.values.forEach(value => {
                console.log(value);
                results.push(testim_fetch_result(value));
            });
        });

        // build HTML and write into a file
        for (let result of await Promise.all(results)) {

            //console.log("\n==================================== Test Result ==========================================\n" + JSON.stringify(result) + "\n==============================================================================\n");
            //console.log(extractResultId(result.testResult.link) + " | " + result.testResult.link + " | " + result.testResult.testName + " | " + result.testResult.executionDate + " | " + result.testResult.executionTime + " | " + result.testResult.baseURL + " | " + result.testResult.testResult + " | " + result.testResult.errorMessage);

            let html = "<html><head><style>@import url(https://fonts.googleapis.com/css?family=Roboto);</style></head><body style='font-family: Roboto; text-align: center; padding-left: 30px; padding-right: 30px; padding-top: 10px;'><center><b>Test Results</b></center><br>";
            html += "<div style='margin: 5px 30px 30px; box-shadow: 0px 15px 15px rgba( 0, 0, 0, 0.2 );'>"
            html += "<table style='border-collapse: collapse; width: 100%; margin-bottom: 5rem; border: none; align: center; padding: .35em; table-layout: fixed; border-radius: 5px;'>\n";
            html += "<tr style='border: 1px solid #dedede; text-align: center; align: center; padding: 10px;'>\n";
            html += "<td style='text-align: left; font-weight: bold; padding-left: 20px; width: 30%; border-right: 1px solid #dedede;'><b>Test Name</b></td><td style='text-align: left; padding: 8px; padding-left: 20px;'><a href='" + result.testResult.link + "'>" + result.testResult.testName + "</a></td>\n";
            html += "</tr>\n";
            html += "<tr style='border: 1px solid #dedede; text-align: center; align: center; padding: 10px;'>\n";
            html += "<td style='text-align: left; font-weight: bold; padding-left: 20px; width: 30%; border-right: 1px solid #dedede;'><b>Run Date</b></td><td style='text-align: left; padding: 8px; padding-left: 20px;'>" + result.testResult.executionDate + " " + result.testResult.executionTime + "</td>\n";
            html += "</tr>\n";
            html += "<tr style='border: 1px solid #dedede; text-align: center; align: center; padding: 10px;'>\n";
            html += "<td style='text-align: left; font-weight: bold; padding-left: 20px; width: 30%; border-right: 1px solid #dedede;'><b>Base URL</b></td><td style='text-align: left; padding: 8px; padding-left: 20px;'><a href='" + result.testResult.baseURL + "'>" + result.testResult.baseURL + "</a></td>\n";
            html += "</tr>\n";
            html += "<tr style='border: 1px solid #dedede; text-align: center; align: center; padding: 10px;'>\n";
            if (result.testResult.testResult.toLowerCase() === 'passed') {
                html += "<td style='text-align: left; font-weight: bold; padding-left: 20px; width: 30%; border-right: 1px solid #dedede;'><b>Test Status</b></td><td style='text-align: left; padding: 8px; padding-left: 20px; color: green;'>" + result.testResult.testResult + "</td>\n";
            }
            else {
                html += "<td style='text-align: left; font-weight: bold; padding-left: 20px; width: 30%; border-right: 1px solid #dedede;'><b>Test Status</b></td><td style='text-align: left; padding: 8px; padding-left: 20px; color: red;'>" + result.testResult.testResult + "</td>\n";
            }
            html += "</tr>\n";
            if (result.testResult.errorMessage != null) {
                html += "<tr style='border: 1px solid #dedede; text-align: center; align: center; padding: 10px;'>\n";
                html += "<td style='text-align: left; font-weight: bold; padding-left: 20px; width: 30%; border-right: 1px solid #dedede;'><b>Error Message</b></td><td style='text-align: left; padding: 8px; padding-left: 20px;'>" + result.testResult.errorMessage + "</td>\n";
                html += "</tr>\n";
            }
            html += "</table>\n";
            html += "</div>\n";


            if(result.testResult.stepsResults.length > 0 && result.testResult.stepsResults != 'undefined') {
                html += "<div style='margin: 5px 30px 30px; box-shadow: 0px 15px 15px rgba( 0, 0, 0, 0.2 );'>"
                html += "<table style='border-collapse: collapse; width: 100%; margin-bottom: 5rem; border: none; align: center; padding: .35em; table-layout: fixed; border-radius: 5px;'>\n";
                html += "<th style='text-align: center; padding: 8px; color: #ffffff; background: #324960;'><b>Step #</b></th>";
                html += "<th style='text-align: center; padding: 8px; color: #ffffff; background: #324960;'><b>Step Name</b></th>";
                html += "<th style='text-align: center; padding: 8px; color: #ffffff; background: #324960;'><b>Step Type</b></th>";
                html += "<th style='text-align: center; padding: 8px; color: #ffffff; background: #324960;'><b>Step Duration</b></th>";
                html += "<th style='text-align: center; padding: 8px; color: #ffffff; background: #324960;'><b>Step Status</b></th>";
                html += "<th style='text-align: center; padding: 8px; color: #ffffff; background: #324960;'><b>Step Screenshot</b></th>";
                
                var i = 0;

                for (let step_result of result.testResult.stepsResults) {

                    i++;
                    //console.log( i + " | " + step_result.description + " | " + step_result.type + " | " + step_result.duration + " | " + step_result.status + " | " + step_result.screenshot);

                    html += "<tr style='border: 1px solid #dedede; text-align: center; align: center; padding: 10px;'>\n";
                    html += "<td style='text-align: center; font-weight: bold; padding-top: 10px; padding-bottom: 10px;'>" + i + "</td>";
                    html += "<td style='text-align: left; font-weight: bold; padding-top: 10px; padding-bottom: 10px;'>" + step_result.description + "</td>";
                    html += "<td style='text-align: center; font-weight: bold; padding-top: 10px; padding-bottom: 10px;'>" + step_result.type + "</td>";
                    html += "<td style='text-align: center; font-weight: bold; padding-top: 10px; padding-bottom: 10px;'>" + step_result.duration + "</td>";
                    if (step_result.status.toLowerCase() == 'passed') {
                        html += "<td style='text-align: center; font-weight: bold; padding-top: 10px; padding-bottom: 10px; color: green;'>" + step_result.status + "</td>";
                    }
                    else {
                        html += "<td style='text-align: center; font-weight: bold; padding-top: 10px; padding-bottom: 10px; color: red;'>" + step_result.status + "</td>";
                    }

                    //turn an image into a data URI string
                    const dataURI = await imageDataURI.encodeFromURL(step_result.screenshot);
                    //console.log(dataURI);
                    await sleep(3000);

                    html += "<td style='text-align: center; font-weight: bold; padding-top: 10px; padding-bottom: 10px;'><a href='" + step_result.screenshot + "'><img style='width:150px;' src='" + dataURI + "'></a></td>\n";
                    html += "</tr>\n";
                }

                html += "</table>\n";
                html += "</div>\n";
            }

            html += "</body></html>";

            const resultID = extractResultId(result.testResult.link);

            await createHTMLReport(html, result.testResult.testId, resultID, result.testResult.testResult);

            if (createPdfReport) {
                await createPDFReport(result.testResult.testId, resultID, result.testResult.testResult);
            }
            
        }
    }
}


// Add a result to the array
function addResult(store, key, value) {
    let entry = store.find(item => item.key === key);
    if (entry) {
        entry.values.push(value);
    } else {
        store.push({ key: key, values: [value] });
    }
}


//extract result-id from the link
function extractResultId(url) {
    const resultIdParam = "result-id=";
    const startIndex = url.indexOf(resultIdParam);
    const valueStartIndex = startIndex + resultIdParam.length;
    return url.substring(valueStartIndex);
}


// fetch test result from Testim
async function testim_fetch_result (resultId) {

    //console.log("resultId: " + resultId);
    const api_key = "PAK-E8dkGBw4yC0qSW-KSkt8ldM5luVycc2I5NbnBovN543FD/R+8t7vt+/QAIAgX5WoCZyHTou2S7gtK6gte";
    const url     = "https://api.testim.io/runs/tests/" + resultId + "?stepsResults=true";
    
    return axios(url, {
        headers: {
            "Authorization": "Bearer " + api_key,
        }
    })
        .then(res => {
            const json = res.data;

            if (json.error) {
                throw new Error(json.error.message);
            }

            return json;
        });
}

// create HTML report
async function createHTMLReport (html, testId, resultId, testResult) {

    const HTMLFileName = "Test-Results-Report__" + testId + "__" + resultId + "__" + dateFormatted + "__" + testResult + ".html";

    fs.writeFile(fileDir + HTMLFileName, html, (err) => { 
        if (err) 
          console.log("Error: " + err); 
        else { 
          console.log("HTML File written successfully\n"); 
          //console.log("The written has the following contents:"); 
          //console.log(fs.readFileSync(fileDir + HTMLFileName, "utf8")); 
        } 
      }); 
    
}

// create PDF report
async function createPDFReport (testId, resultId, testResult) {

    const HTMLFileName = "Test-Results-Report__" + testId + "__" + resultId + "__" + dateFormatted + "__" + testResult + ".html";
    const PDFFileName = "Test-Results-Report__" + testId + "__" + resultId + "__" + dateFormatted + "__" + testResult + ".pdf";

    (async () => {
        try{
            // Create browser instance
            const browser = await puppeteer.launch({headless: 'new'});
        
            // Create a new page
            const page = await browser.newPage();

            // Get HTML content
            const html = fs.readFileSync(path.resolve(fileDir, HTMLFileName), 'utf-8');

            // Set HTML as page content
            await page.setContent(html, { waitUntil: 'domcontentloaded' });

            // Custom web font
            //await page.addStyleTag({ path: fileDir + 'roboto.css' });

            // To reflect CSS used for screens instead of print
            await page.emulateMediaType('screen');

            // Save PDF File
            await page.pdf({ path: path.resolve(fileDir, PDFFileName), format: 'A3', margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }, printBackground: true});
        
            // Close browser instance
            await browser.close();

            console.log('PDF file has been generated successfully.');
        } catch (error) {
            console.log("Error: " + error);
        }
    })();

    
}

function checkifModuleExists(module) {
    const { exec } = require('child_process');
    // define the module name to check and install
    const moduleName = module;
    // check if the module is installed
    exec(`npm list ${moduleName}`, (err, stdout, stderr) => {
        if (err) {
            // the module is not installed, so install it
            console.log(`Installing ${moduleName}...`);
            exec(`npm install ${moduleName}`, (err, stdout, stderr) => {
            if (err) {
                console.error(`Error installing ${moduleName}: ${err}`);
            } else {
                console.log(`${moduleName} installed successfully`);
            }
            });
        } else {
            // the module is already installed
            console.log(`${moduleName} is already installed`);
        }
    });
}



