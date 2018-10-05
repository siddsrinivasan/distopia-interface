var svg = d3.select("#state");
var w = parseFloat(svg.style("width"));
var h = parseFloat(svg.style("height"));

var countyBounds;

var age = [
	{age_range: "18 to 24",
	amount: 15},
	{age_range: "25 to 44",
	amount: 27},
	{age_range: "45 to 65",
	amount: 30},
	{age_range: "65 plus",
	amount: 19}
];

var race = [
	{race: "Asian", amount: 5},
	{race: "African American", amount: 15},
	{race: "White", amount: 65},
	{race: "Native American", amount: 12},
	{race: "Native Islander", amount: 1},
	{race: "Other", amount: 1},
	{race: "Multiple", amount: 2},
];

var income = [
	{income_group: "level1", amount: 15},
	{income_group: "level2", amount: 37},
	{income_group: "level3", amount: 27},
	{income_group: "level4", amount: 21},
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

function renderRace(){
	var raceCanvas = d3.select("#population");
	
}

function renderAge(){
	var raceCanvas = d3.select("#demographics");
}

function renderAge(){
	var educationCanvas = d3.select("#education");
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
	console.log(x);
	console.log(y);

	renderCounties(district, x, y);
});

function renderCounties(counties, xRange, yRange){
	var scaling = h/((yRange[1]-yRange[0]));
	var scaledWith = Math.ceil(scaling * (xRange[1]-xRange[0]));
	var padding = (w - scaledWith)/2;
	console.log(scaling);
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