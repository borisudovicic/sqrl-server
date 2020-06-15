var path = require('path');
var cheerio = require('cheerio');
var request = require("request");
const fixName = require('../../scripts/fixName');
const classTerm = "term_in=201880"; // 201860 is summer 2018, 201880 is fall 2018 (to find, inspect values of the combobox to select term)

function getDisabled(x) {
	// let enabled = [ //add classes here to enable beta testing in them. have this function return false for all cases to enable all classes
	// 	"term_in=201810-16999",
	// ]; //format: "term_in=201810-CRNHERE"
	// if (enabled.indexOf(x) > -1) {
	// 	return false //not disabled
	// } else {
	// 	return true
	// }
	return false; //this enables all classes
}

//this function also gets the name and adds it to the return object
function requestClassInfo(cookie) {
	let urlToAsk = "https://keys.kent.edu:44220/ePROD/bwskfshd.P_CrseSchdDetl/?" + classTerm;

	var options = {
		headers: {
			"referer": "https://keys.kent.edu:44220/ePROD/bwskfshd.P_CrseSchdDetl",
			'content-type': 'application/x-www-form-urlencoded',
			// "upgrade-insecure-requests": "1",
			"origin": "https://keys.kent.edu:44220",
			"host": "keys.kent.edu:44220",
			"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Safari/604.1.38",
			"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
			"connection": "keep-alive",
			"accept-encoding": "gzip, deflate",
			"content-length": "14",
			"dnt": "1",
			"cookie": cookie,
			"accept-language": "en-US",
		},
		url: urlToAsk,
		body: null,
	};

	return new Promise(resolve => {
		function reqdone(error, response, body) {
			if (!error && response.statusCode == 200) {
				var $ = cheerio.load(body);
				var classList = [];

				//scraping begins. use try blocks incase some classes have weird data so we dont crash the server
				//get the persons name
				let personName = 'Student';
				try{
					let tempName = $('.staticheaders').html().split("<br>")[0].split(" "); //locate section / line that contains name, split words into an array
					personName = tempName[1] + ' ' + tempName[tempName.length - 1] || '';
				}catch(e){console.log('Error: couldnt scrape student name')}

				//get the classes, loop thru them all
				if ($('.datadisplaytable').text()) { //if there are any "datadisplaytable" that means there are classes
					$('.datadisplaytable').each(function (index, element) {
						if (index == 0 || index % 2 == 0) { //there are 2 "datadisplaytable" per class, we only care about the first per class
							let classData = {
								name: 'Class Name Not Specified',
								id: '',
								disabled: false,
								type: 'class',
								professorEmail: '',
								professorName: '',
								section: ''
							};
							try{
								let classTitleString = $(element).children('.captiontext').text();
								let hyphenIndex = classTitleString.indexOf(' -');
								classData.name = fixName(classTitleString.substring(0, hyphenIndex));
								classData.section = classTitleString.substring(classTitleString.length-3, classTitleString.length);
							}catch(e){console.log('error getting class title')}
							// let crn = $(element).children().eq(1).children().eq(1).children().eq(1).text(); //this locates the <td> that contains the CRN (given a datadisplaytable from the HTML DOM)
							// let profName = $(element).children().eq(1).children().eq(3).children().eq(1).children().eq(0).attr('target') || '';

							//loop through table and lookup each row by its header name
							$(element).find('th').each(function () {
								switch ($(this).text()) {
									case 'Assigned Instructor:':
										//get professor email
										try{
											classData.professorEmail = $(this).closest('tr').children('td').children('a').attr('href').split(":")[1];
										}catch(e){console.log('error: couldnt scrape professor email')}
										//get professor name
										try{
											classData.professorName = $(this).closest('tr').children('td').text();
										}catch(e){console.log('error: couldnt scrape professor name')}
										break;
									case 'CRN:':
										try{
											let crn = $(this).closest('tr').children('td').text();
											let classid = classTerm + '-' + crn
											classData.id = classid;
										}catch(e){console.log('error: couldnt scrape crn')}
										break;
									default:
										break;
								}
							})
							classData.disabled = getDisabled(classData.id); //check to see if class is enabled
							//got all info, add the class
							classList.push(classData);
						}
					});

					resolve({ status: "success", message: 'Success!', classList: classList, fullName: personName })
				} else {
					//this section triggers if login failed, or if the user isnt in any classes
					console.log('Error: somethign went wrong with the request to get classes');
					resolve({ status: 'failed', "message": "Unable to authenticate user. Please check your username and password" });
				}
			} else {
				//this section means request did not return status 200, or there was an error
				console.log('Error: somethign went wrong with the request to get classes');
				resolve({ status: 'failed', message: 'Error getting class list' });
			}
		}

		//send the post request
		request.post(options, reqdone);

	})
}

function getMajor(cookie) {
	let urlToAsk = "https://keys.kent.edu:44220/ePROD/bwskrsta.P_RegsStatusDisp/?" + classTerm;

	var options = {
		headers: {
			"referer": "https://keys.kent.edu:44220/ePROD/bwskfshd.P_CrseSchdDetl",
			'content-type': 'application/x-www-form-urlencoded',
			// "upgrade-insecure-requests": "1",
			"origin": "https://keys.kent.edu:44220",
			"host": "keys.kent.edu:44220",
			"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Safari/604.1.38",
			"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
			"connection": "keep-alive",
			"accept-encoding": "gzip, deflate",
			"content-length": "14",
			"dnt": "1",
			"cookie": cookie,
			"accept-language": "en-US",
		},
		url: urlToAsk,
		body: null,
	};

	return new Promise(resolve => {
		function reqdone(error, response, body) {
			if (!error && response.statusCode == 200) {
				var $ = cheerio.load(body);
				let majors = [];
				if ($('.datadisplaytable').text()) {
					$('.datadisplaytable').find('th').each(function () {
						if ($(this).text() == 'Major and Department:') {
							//maybe they can have more than 1 major ?
							let description = $(this).closest('tr').children('td').text();
							let commaIndex = description.indexOf(',') > -1 ? description.indexOf(',') : description.length;
							let major = description.substring(0, commaIndex);
							majors.push(major);
						}
					})
					if (majors) {
						resolve(majors);
					} else {
						resolve()
					}
				}
			} else {
				resolve()
			}
		}
		//send the post request
		request.post(options, reqdone);
	})

}

//this function tries to get a cookie. if it does, it uses it to try to get the classes and other info
let getClassesKent = function (username, password) { 

	let urlToAsk = 'https://keys.kent.edu:44220/ePROD/twbkwbis.P_ValLogin/?sid=' + username + '&PIN=' + password;
	var options = {
		headers: {
			'content-type': 'application/x-www-form-urlencoded',
			"upgrade-insecure-requests": "1",
			"origin": "https://keys.kent.edu:44220",
			"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36",
			"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
			"referer": "https://keys.kent.edu:44220/ePROD/bwskfshd.P_CrseSchdDetl",
			"accept-encoding": "gzip, deflate, br",
			"accept-language": "en-US,en;q=0.8,hu;q=0.6",
			"cache-control": "no-cache"
		},
		url: urlToAsk,
		body: null,
	};

	return new Promise(resolve => {

		function reqdone(error, response, body) {
			if (!error && response.statusCode == 200 && response.headers['set-cookie']) {
				//success, got cookie. now get the classes and info

				let returnObject = {
					status: 'failed',
					message: 'Error',
					classList: [],
					major: ''
				};

				requestClassInfo(response.headers['set-cookie']).then(result => {
					if (result && result.status == 'success') {
						returnObject = result;
						return getMajor(response.headers['set-cookie'])
					} else {
						returnObject.message = result.message;
						return function () { return null };
					}

				}).then(major => {
					if (major && major.length > 0) {
						returnObject.classList.push({
							name: 'Major: ' + major[0],
							id: 'kent-' + major[0],
							type: 'major',
							disabled: getDisabled('kent-' + major[0])
						})
						returnObject.major = major[0];
						returnObject.status = 'success'; //still give a major chat if they have no classes
					} else {
						console.log('failed getting major')
					}

				}).then(() => {
					resolve(returnObject);
				})

			} else {
				console.log('Error: somethign went wrong with the request to get the cookie');
				resolve({ status: 'failed', "message": "Unable to authenticate user. Please check your username and password." });
			}
		}

		//send the post request
		request.post(options, reqdone);
	})
}

module.exports = getClassesKent;


