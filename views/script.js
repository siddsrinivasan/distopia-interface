var svg = d3.select("#state");
var w = parseFloat(svg.style("width"));
var h = parseFloat(svg.style("height"));

var countieBounds;
var districts = {
	1: {
		number: 1,
		counties: [],
		race: {
			asian: 10,
			african_american: 10,
			white: 10,
			native_american: 10,
			native_islander: 10,
			other: 10,
			multiple: 10
		},
		age: {
			"18to24": 10,
			"25to44": 10,
			"45to65": 10,
			"65plus": 10
		},
		income:{
			level1: 10,
			level2: 10,
			level3: 10,
			level4: 10
		},
		education_level:{

		},
		partisan_lean:{
			democrat: 10,
			republican: 10,
			independent: 10
		}
	},
	2: {
		number: 2,
		counties: [],
		race: {
			asian: 10,
			african_american: 10,
			white: 10,
			native_american: 10,
			native_islander: 10,
			other: 10,
			multiple: 10
		},
		age: {
			"18to24": 10,
			"25to44": 10,
			"45to65": 10,
			"65plus": 10
		},
		income:{
			level1: 10,
			level2: 10,
			level3: 10,
			level4: 10
		},
		education_level:{

		},
		partisan_lean:{
			democrat: 10,
			republican: 10,
			independent: 10
		}
	},
};

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

function getDistData(){
	countyData.forEach(function(county){

	});
	
	console.log(x);	console.log(y);
}

function renderCounties(counties, xRange, yRange){

	var scaling = h/((yRange[1]-yRange[0]));
	var scaledWith = Math.ceil(scaling * (xRange[1]-xRange[0]));
	var padding = (w - scaledWith)/2;
	console.log(scaling);
	var xScale = d3.scaleLinear().domain(xRange).range([padding, Math.ceil(scaling * (xRange[1]-xRange[0]))+padding]);
	var yScale = d3.scaleLinear().domain(yRange).range([Math.ceil(scaling * (yRange[1]-yRange[0])), 0]);
	countieBounds = svg.selectAll("polygon")
		.data(counties).enter().append("polygon")
		.attr("class", function(county){ return county.name; })
		.attr("points", function(county){
			return county.boundaries.map(function(point){
				return [xScale(point[0]), yScale(point[1])].join(",");
			}).join(" ");
		});
}