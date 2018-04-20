function storeData(userName) {
	return new Promise(function(resolve, reject) {
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				//xhttp.responseText
				var xhttp2 = new XMLHttpRequest();
				xhttp2.onreadystatechange = function() {
					if (this.readyState == 4 && this.status == 200) {
						//xhttp2.responseText
						var xhttp3 = new XMLHttpRequest();
						xhttp3.onreadystatechange = function() {
							if (this.readyState == 4 && this.status == 200) {
								//xhttp3.responseText
								resolve(1);
							}
						};
						xhttp3.open("GET", "api/saveHeroTweets/" + userName, true);
						xhttp3.send();
					}
				};
				xhttp2.open("GET", "api/following/" + userName, true);
				xhttp2.send();
			}
		};
		xhttp.open("GET", "api/getTweets/" + userName, true);
		xhttp.send();
	});
}

let analysis = '';

function getResult(userName) {
	return new Promise(function(resolve, reject) {
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				analysis = xhttp.responseText;
				analysisJSON = JSON.parse(analysis);
				let result = document.getElementById('result');
				let resultHTML = '<div class="box"><div class="title">Hey @' + userName + '</div><div class="content"><p>Your profile\'s average Sentiment is ' + Math.round(analysisJSON['Average User Sentiment'] * 100) / 100 + '</p>';
				resultHTML += '<p>Your last Tweet\'s Sentiment is ' + Math.round(analysisJSON['User Tweet Sentiment'] * 100) / 100 + '</p>';
				let max = -999;
				let maxInfluence, flag = 1;
				for (var i in analysisJSON['Average Hero Sentiment']) {
					flag = 1;
					if (0 > analysisJSON['Influence'][i]['normalized']) {
						flag = -1;
					}
					if (max < (analysisJSON['Influence'][i]['normalized'] * flag * 100) / 100) {
						max = Math.round(analysisJSON['Influence'][i]['normalized'] * flag * 100) / 100;
						maxInfluence = i + ' has the biggest influence on you with a normalized influence score of ' + max;
					}
					console.log(analysisJSON['Hero Tweet Sentiment'][i]);
				}
				resultHTML += '<p>' + maxInfluence + '</p></div></div>';
				result.innerHTML += resultHTML;
				createChart(analysis);
				document.getElementById('json').innerHTML += '<pre>' + JSON.stringify(analysisJSON['Influence'], undefined, 2) + '</pre>';
				resolve(1);
			}
		};
		xhttp.open("GET", "api/result/" + userName, true);
		xhttp.send();
	});
}

function execute() {
	let userName = document.getElementById('twitterHandle').value;
	let result = document.getElementById('result');
	if (userName != '') {
		// storeData(userName).then(() => {
		result.innerHTML = "<div class='notification is-success'>Result Stored Successfully!</div>";
		getResult(userName).then(() => {
			// result.innerHTML += "<div class='box'>" + analysis + "</div>";
		});
		// });
	} else {
		window.alert("The Twitter Handle Field is Emtpy")
	}
	return false;
}

function createChart(analysis) {
	console.log('hi');
	console.log(analysis);

	document.getElementById('chart').style.display = 'block';

	document.getElementById('json').style.display = 'block';

	var dataLabels = [];
	var avgHeroSent = [];
	var heroSent = [];

	analysis = JSON.parse(analysis);
	for (var i in analysis['Average Hero Sentiment']) {
		console.log(i);
		console.log(analysis['Average Hero Sentiment'][i]);
		dataLabels.push(i);
		avgHeroSent.push(analysis['Average Hero Sentiment'][i]);
		heroSent.push(analysis['Hero Tweet Sentiment'][i]);
	}

	var ctx = document.getElementById('myChart').getContext('2d');

	var chart = new Chart(ctx, {
		// The type of chart we want to create
		type: 'line',

		// The data for our dataset
		data: {
			labels: dataLabels,
			datasets: [{
				label: 'Average Hero Sentiment',
				fill: false,
				borderColor: "#C6EB98",
				// lineTension: 0.1,
				data: avgHeroSent
			}, {
				label: 'Hero Tweet Sentiment',
				fill: false,
				borderColor: "#79BD8F",
				// lineTension: 0.1,
				data: heroSent
			}]
		},

		// Configuration options go here
		options: {
			annotation: {
				annotations: [{
					type: 'line',
					mode: 'horizontal',
					scaleID: 'y-axis-0',
					value: analysis['Average User Sentiment'],
					borderColor: '#ff8080',
					borderDash: [4, 4],
					borderWidth: 2,
					label: {
						enabled: true,
						position: "right",
						yPadding: 4,
						fontSize: 11,
						content: 'User\'sAvgSent'
					}
				}, {
					type: 'line',
					mode: 'horizontal',
					scaleID: 'y-axis-0',
					value: analysis['User Tweet Sentiment'],
					borderColor: '#00A288',
					borderDash: [4, 4],
					borderWidth: 2,
					label: {
						enabled: true,
						fontSize: 11,
						position: "right",
						yPadding: 4,
						content: 'User\'sLastTweetSent'
					}
				}]
			}
		}
	});
}
