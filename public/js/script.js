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
				createChart(analysis);
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

	var box = document.getElementById('chart');
	box.style.display = 'block';

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

	/*Chart.types.Line.extend({
		name: "myChart",
		initialize: function() {
			Chart.types.Line.prototype.initialize.apply(this, arguments);
		},
		draw: function() {
			Chart.types.Line.prototype.draw.apply(this, arguments);

			var point = this.datasets[0].points[this.options.lineAtIndex]
			var scale = this.scale
			console.log(this);

			// draw line
			this.chart.ctx.beginPath();
			this.chart.ctx.moveTo(scale.startPoint + 12, point.y);
			this.chart.ctx.strokeStyle = '#ff0000';
			this.chart.ctx.lineTo(this.chart.width, point.y);
			this.chart.ctx.stroke();

			// write TODAY
			this.chart.ctx.textAlign = 'center';
			this.chart.ctx.fillText("TODAY", scale.startPoint + 35, point.y + 10);
		}
	});*/

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
