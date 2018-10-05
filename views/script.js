var svg = d3.select("#state");
var w = parseFloat(svg.style("width"));
var h = parseFloat(svg.style("height"));

var countyBounds;

var age = [
	{age_range: "18 to 24", amount: 15},
	{age_range: "25 to 44", amount: 27},
	{age_range: "45 to 65", amount: 30},
	{age_range: "65 plus", amount: 19}
];

var race = [
	{race: "Asian", amount: 5, "color": "#8A82E5"},
	{race: "African American", amount: 15, "color": "#E68882"},
	{race: "White", amount: 65, "color": "#E6AF82"},
	{race: "Native American", amount: 12, "color": "#BDE682"},
	{race: "Native Islander", amount: 1, "color": "#C582E6"},
	{race: "Other", amount: 1, "color": "#82E0E6"},
	{race: "Multiple", amount: 2, "color": "#A49AC9"},
];

var income = [
	{income_group: "level1", amount: 15},
	{income_group: "level2", amount: 37},
	{income_group: "level3", amount: 27},
	{income_group: "level4", amount: 12},
	{income_group: "level4", amount: 10},

]

var countyData = [];
d3.json("records.json").then(function(data){
	data.forEach(function(county){
		countyData.push({
			id: county[0],
			name: county[3],
			boundaries: null
		});
	});
});
var poly;
var polygonData = [];
var district = [];

renderRace();
renderAge();
renderEdu();

function renderRace(){
	var raceCanvas = d3.select("#population");
	var thisHeight = parseFloat(raceCanvas.style("height"));
	var thisWidth = parseFloat(raceCanvas.style("width"));

	var barHeight = 0.3 * thisHeight;
	var barWidth = 0.9 * thisWidth;

	var padding = 0.05 * thisWidth;

	raceCanvas.append("rect").attr("width", barWidth).attr("height", barHeight).attr("x", 0.05 * thisWidth).attr("y", 0.35*thisHeight)
		.style("fill", "#D8D8D8").style("rx", 5).style("ry", 5);
	
	var xScale = d3.scaleLinear().domain([0,100]).range([0, barWidth]);

	race.forEach(function(dat, index){
		var x = padding;
		for(var i = 0; i < index; i++){
			x += xScale(race[i].amount);
		}
		raceCanvas.append("rect").attr("width", xScale(dat.amount)).attr("height", barHeight)
			.attr("x", x).attr("y", 0.35*thisHeight).style("rx", 5).style("ry", 5).style("fill", dat.color);
	});
}

function renderAge(){
	var ageCanvas = d3.select("#demographics");
	var thisHeight = parseFloat(ageCanvas.style("height"));
	var thisWidth = parseFloat(ageCanvas.style("width"));

	var graphHeight = 0.8 * thisHeight;
	var yPadding = 0.1 * thisHeight;
	var graphWidth = 0.5 * thisWidth;
	var xPadding = 0.25 * thisWidth;
	console.log(graphWidth);
	var yScale = d3.scaleLinear().domain([0, 50]).range([graphHeight + yPadding, yPadding])

	age.forEach(function(era, index){
		var color;
		if(index % 2 == 0){
			color = "#8A82E5";
		}
		else{
			console.log("odd");
			color = "#A49AC9";
		}
		ageCanvas.append("rect").attr("width", 75).attr("height", yScale(era.amount))
			.attr("x", index * 125 + xPadding + 25).attr("y", graphHeight - yScale(era.amount) + yPadding)
			.attr("fill", color);
	});
}

function renderEdu(){
	var educationCanvas = d3.select("#education");
	var thisHeight = parseFloat(educationCanvas.style("height"));
	var thisWidth = parseFloat(educationCanvas.style("width"));
	
	var graphHeight = 0.8 * thisHeight;
	var yPadding = 0.1 * thisHeight;
	var graphWidth = 0.5 * thisWidth;
	var xPadding = 0.25 * thisWidth;
	console.log(graphWidth);
	var yScale = d3.scaleLinear().domain([0, 50]).range([graphHeight + yPadding, yPadding])

	income.forEach(function(group, index){
		var color;
		if(index % 2 == 0){
			color = "#8A82E5";
		}
		else{
			console.log("odd");
			color = "#A49AC9";
		}
		educationCanvas.append("rect").attr("width", 75).attr("height", yScale(group.amount))
			.attr("x", index * 100 + xPadding + 25).attr("y", graphHeight - yScale(group.amount) + yPadding)
			.attr("fill", color);
	});
}

d3.json("polygons.json").then(function(data){
	for(var i = 0; i < data.length; i++){
		if(i == 51 || i == 41 || i == 39 || i == 53 || i == 59 || i == 32|| i == 44|| i == 47){
			countyData[i].boundaries = data[i][0];
			district.push(countyData[i]);
		}
	}
	var minX = d3.min(district, function(county){
		return d3.min(county.boundaries, function(countyPoint){
			return countyPoint[0];
		});
	});
	var minY = d3.min(district, function(county){
		return d3.min(county.boundaries, function(countyPoint){
			return countyPoint[1];
		});
	});

	var maxX = d3.max(district, function(county){
		return d3.max(county.boundaries, function(countyPoint){
			return countyPoint[0];
		});
	});
	var maxY = d3.max(district, function(county){
		return d3.max(county.boundaries, function(countyPoint){
			return countyPoint[1];
		});
	});
	var x = [minX, maxX], y = [minY, maxY];

	renderCounties(district, x, y);
});

function renderCounties(counties, xRange, yRange){
	var scaling = h/((yRange[1]-yRange[0]));
	var scaledWith = Math.ceil(scaling * (xRange[1]-xRange[0]));
	var padding = (w - scaledWith)/2;
	var xScale = d3.scaleLinear().domain(xRange).range([padding, Math.ceil(scaling * (xRange[1]-xRange[0]))+padding]);
	var yScale = d3.scaleLinear().domain(yRange).range([Math.ceil(scaling * (yRange[1]-yRange[0])), 0]);
	countyBounds = svg.selectAll("polygon")
		.data(counties).enter().append("polygon")
		.attr("class", function(county){ return county.name; })
		.attr("points", function(county){
			return county.boundaries.map(function(point){
				return [xScale(point[0]), yScale(point[1])].join(",");
			}).join(" ");
		});
}