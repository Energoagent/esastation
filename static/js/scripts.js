// немасштабируемые foreignObject в SVG
let els = [];

function setSVGForeignObjectsNonScale(svg){

	function fixedSizeForeignObject(el) {
		let info = {
			el: el, svg: svg,
			w: el.getAttribute('width') * 1, h: el.getAttribute('height') * 1,
			x: el.getAttribute('x') * 1, y: el.getAttribute('y') * 1
		};
		els.push(info);
		el.removeAttribute('x');
		el.removeAttribute('y');
		calculateSVGScale(svg);
		fixScale(info);
	}

	function resizeSVGs(evt) {
		calculateSVGScale(svg);
		els.forEach(fixScale);
	}

	function calculateSVGScale(svg) {
		let 
			w1 = svg.viewBox.animVal.width, 
			h1 = svg.viewBox.animVal.height;
		if (!w1 && !h1) svg.scaleRatios = [1,1]; // No viewBox
		else {
			let info = getComputedStyle(svg);
			let 
				w2 = parseFloat(info.width), 
				h2 = parseFloat(info.height);
			let par = svg.preserveAspectRatio.animVal;
			if (par.align === SVGPreserveAspectRatio.SVG_PRESERVEASPECTRATIO_NONE) {
				svg.scaleRatios = [w2/w1, h2/h1];
			} else {
				let meet = par.meetOrSlice === SVGPreserveAspectRatio.SVG_MEETORSLICE_MEET;
				let ratio = (w1/h1 > w2/h2) != meet ? h2/h1 : w2/w1;
				svg.scaleRatios = [ratio, ratio];
			}
		}
	}

	function fixScale(info) {
		let s = info.svg.scaleRatios;
		info.el.setAttribute('width', info.w * s[0]);
		info.el.setAttribute('height',info.h * s[1]);
		info.el.setAttribute('transform','translate(' + info.x + ',' + info.y + ') scale(' + 1/s[0] + ',' + 1/s[1] + ')');
	}

	foreignObjects = svg.querySelectorAll('foreignObject');
	if (foreignObjects) {
		for(el of foreignObjects) fixedSizeForeignObject(el);
		window.addEventListener('resize', resizeSVGs, false);
	}
}


// масштабирование SVG сообразно body
function svgScale() {
	h = window.innerHeight;
	w = window.innerWidth;
	let elem = document.querySelector('svg'); 
	if(elem) { 
		elem.style.width = w *0.95;
		elem.style.height = h * 0.95;
	};
};

// создание pix сетки
function drawPixelGrid(stepX, stepY){
	let svgFloorPlan = document.getElementById("floor_plan")
	if (svgFloorPlan) {
		let maxX = Number(svgFloorPlan.getAttribute('width'));
		let maxY = Number(svgFloorPlan.getAttribute('height'));
		if (stepX && (stepX > 0)) {
			for(let x = 0; x < maxX; x = x + stepX) {
				let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
				line.setAttribute('x1', String(x));
				line.setAttribute('x2', String(x));
				line.setAttribute('y1', '0');
				line.setAttribute('y2', String(maxY));
				line.setAttribute('stroke', 'red');
				svgFloorPlan.appendChild(line);
				let txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
				txt.setAttribute('y', '100');
				txt.setAttribute('x', String(x));
				txt.style.fill = 'red';
				txt.style.font = 'Arial';
				txt.style.fontSize = '20';
				txt.innerHTML = String(x);
				svgFloorPlan.appendChild(txt);
			};
		};
		if (stepY && (stepY > 0)) {
			for(let y = 0; y < maxY; y = y + stepY) {
				let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
				line.setAttribute('y1', String(y));
				line.setAttribute('y2', String(y));
				line.setAttribute('x1', '0');
				line.setAttribute('x2', String(maxX));
				line.setAttribute('stroke', 'red');
				svgFloorPlan.appendChild(line);
				let txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
				txt.setAttribute('x', '100');
				txt.setAttribute('y', String(y));
				txt.style.fill = 'red';
				txt.style.font = 'Arial';
				txt.style.fontSize = '20';
				txt.innerHTML = String(y);
				svgFloorPlan.appendChild(txt);
//console.log('DEBUG:', txt);
			};
		};
	};
}


// запрос от сервера SCADA и вывод в HTML параметров (переменных)
let pageN = 1;

function displayParameters() {
	var req = new XMLHttpRequest();
	req.open("POST", "http://" + window.location.host + "/parameter/?page=" + String(pageN));
	req.onreadystatechange = function() {
		if(this.readyState === 4 && this.status === 200) {
			parameters = JSON.parse(this.response);
			for(let i=0; i < parameters.length; i++) {
				let elem = document.getElementById(parameters[i].ID);
				if(elem) {
					if (elem.getAttribute('data-type') === 'lamp'){
						if (parameters[i].Value === 2) {
							elem.href.baseVal ='#lamp_on';
						}
						else {
							elem.href.baseVal ='#lamp_off';
						};
					};
					if (elem.getAttribute('data-type') === 'door'){
						if (parameters[i].Value === 0) {
							elem.href.baseVal ='#door_closed';
						}
						else {
							elem.href.baseVal ='#door_open';
						};
					};
					elem.innerText = parameters[i].Value;
					elem.style.color = parameters[i].color;
				};
			};
		};
	};
	req.send();
} 



function parametersChart(pn) {
	pageN = pn;
	setInterval(displayParameters,
	5000
	)
}

function displayAlarms() {
	var req = new XMLHttpRequest();
	req.open("POST", "http://" + window.location.host + "/alarms");
	req.onreadystatechange = function() {
		if(this.readyState === 4 && this.status === 200) {
			alarms = JSON.parse(this.response);
			if (alarms) {
				let tableBody = document.getElementById('tableBody');
				let rows = tableBody.getElementsByTagName('tr');
				let i=0, row;
				let alarmsCount = alarms.length;
				let rowsCount = rows.length;
				while(true) {
					if (i < alarmsCount) {
						if (i < rowsCount) row = rows[i]
						else row = tableBody.insertRow();
						row.innerHTML = "<td>" + alarms[i].t_raise + "</td><td>" + alarms[i].m_raise + "</td><td>-</td><td>-</td>";
						if (alarms[i].Type === 3) row.className = "table-danger"
						else row.className = "table-warning";
					}
					else 
						if (i < rowsCount) {
							rows[i].innerHTML = "<td>-</td><td>-</td><td>-</td><td>-</td>";
							rows[i].className = "table-info";
						}
						else break;
					i++;
				};	
			};
		};
	};
	req.send();
} 

function alarmsChart() {
	setInterval(displayAlarms,
	5000
	)
}
