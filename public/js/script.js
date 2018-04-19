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

	var data = {
		labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
		series: [
			[],
			[]
		]
	};

	data.labels = [];
	analysis = JSON.parse(analysis);
	// console.log(analysis['Average Hero Sentiment']);
	for (var i in analysis['Average Hero Sentiment']) {
		console.log(i);
		console.log(analysis['Average Hero Sentiment'][i]);
		data.labels.push(i);
		data.series[0].push(analysis['Average Hero Sentiment'][i]);
		data.series[1].push(analysis['Hero Tweet Sentiment'][i]);
	}

	var options = {
		seriesBarDistance: 10,
		reverseData: true,
		width: 1000,
		height: 2000,
		plugins: [
			Chartist.plugins.ctTargetLine({
				value: 3,
				axis: 'y'
			}),
			Chartist.plugins.ctTargetLine({
				value: 2,
				axis: 'y'
			})
		],
		axisY: {
			onlyInteger: true
		}
	};

	var chart = new Chartist.Line('.ct-chart', data, options);

	/*chart.on('created', function(context) {
		var htmlOffset = document.getElementsByClassName('ct-end')[0].innerHTML;
		xOffset = +htmlOffset;
		console.log(xOffset);
	});*/


	chart.on('draw', function(data) {
		if (data.type === 'line') {
			data.element.animate({
				y1: {
					dur: 1000,
					from: data.y1,
					to: data.y2,
					easing: Chartist.Svg.Easing.easeOutQuint
				},
				opacity: {
					dur: 1000,
					from: 0,
					to: 1,
					easing: Chartist.Svg.Easing.easeOutQuint
				},
			});
		}
	});
}
