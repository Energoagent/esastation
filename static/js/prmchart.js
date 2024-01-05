let dt = new Date();
let prdt = new Date(dt.getTime() - 60 * 60 * 1000);

function timeFormat(hours, minutes, seconds) {
	if (hours < 10) h = '0' + hours 
	else h = hours;
	if (minutes < 10) m = '0' + minutes 
	else m = minutes;
	if (seconds) {
		if (seconds < 10) s = '0' + seconds 
		else s = seconds;
		return h + ':' + m + ':' + s;
	}
	else return h + ':' + m;
};

function dateFormat(year, month, day) {
	if (month < 10) m = '0' + month 
	else m = month;
	if (day < 10) d = '0' + day 
	else d = day;
	return d + '-' + m + '-' + year;
};

let periodEndDate = dateFormat(dt.getDate(), (dt.getMonth() + 1 ), dt.getFullYear());
let periodEndTime = timeFormat(dt.getHours(), dt.getMinutes());

let periodStartDate = dateFormat(dt.getDate(), (dt.getMonth() + 1 ), dt.getFullYear());
let periodStartTime = timeFormat(prdt.getHours(), prdt.getMinutes());


let periodEnd = periodEndDate + ' ' + periodEndTime + ':' + dt.getSeconds();
let periodStart = periodStartDate + ' ' + periodStartTime + ':' + prdt.getSeconds();

let requestJSON = {
	'parameterName':'mbT212',
	'periodStart': periodStart,
	'periodEnd': periodEnd
};

console.log(requestJSON);

let data_mbdP, intervalData;

let options_mbdP = {
	title: '212.Мыши'+': Температура C°',
	height: 600,
	curveType: 'function',
	legend: {position: 'bottom'},
	backgroundColor:'#dde6eb',
	colors:['blue', 'orange', 'orange', 'red', 'red'],
	theme: {chartArea: 
		{width:'90%', height:'70%', backgroundColor:'#dde6eb'},
	},
//	hAxis: {showTextEvery: 10},
};

let chart_mbdP;

function addDPChart() {
	data_mbdP = new google.visualization.DataTable();
	data_mbdP.addColumn('string', 'Время'); 
	data_mbdP.addColumn('number', 't C°'); 
	data_mbdP.addColumn('number', 'нижн пред'); 
	data_mbdP.addColumn('number', 'верхн пред');
	data_mbdP.addColumn('number', 'нижн авария');
	data_mbdP.addColumn('number', 'верхн авария'); 
	chart_mbdP = new google.visualization.LineChart(document.getElementById('chart_mbdP'));
	chart_mbdP.draw(data_mbdP, options_mbdP);
};

function drawDPChart() {
	if (chart_mbdP) {
		if (intervalData) {
			data_mbdP.removeRows(0, data_mbdP.getNumberOfRows())
			let count = intervalData.values.length;
			for (let i = 0; i < count; i++) {
				intervalData.values[i].push(intervalData.loWarn, intervalData.hiWarn, intervalData.loAlarm, intervalData.hiAlarm);
			};
			data_mbdP.addRows(intervalData.values);
		};
		chart_mbdP.draw(data_mbdP, options_mbdP);
	};
};

function getDataAndDraw() {
	let req = new XMLHttpRequest();
	req.open("POST", "http://" + window.location.host + "/data");
	req.onreadystatechange = function() {
		if(this.readyState === 4 && this.status === 200) {
			intervalData = JSON.parse(this.response);
			drawDPChart();
		};
	};
	req.send(JSON.stringify(requestJSON));
};
			
function getChartControlData() {
	requestJSON = {
		'parameterName': document.getElementById('parameter').value,
		'periodStart': document.getElementById('start_date').value + ' ' + document.getElementById('start_time').value + ':00',
		'periodEnd': document.getElementById('end_date').value + ' ' + document.getElementById('end_time').value + ':00'
	};
};	

function setChartControlData() {
	document.getElementById('start_date').value = periodStartDate;
	document.getElementById('start_time').value = periodStartTime;
	document.getElementById('end_date').value = periodEndDate;
	document.getElementById('end_time').value = periodEndTime;
};


//console.log('DEBAG:', requestJSON);
