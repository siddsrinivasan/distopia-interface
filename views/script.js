var svg = d3.select("#district");
var w = parseFloat(svg.style("width"));
var h = parseFloat(svg.style("height"));

var districtIDs = [0, 1, 2, 3, 4, 5, 6, 7];
var minX, minY, maxX, maxY;

var counter;
var district_data;

var state_padding = 20;

var partisan_fill = d3.scaleLinear().domain([-1, 0, 1]).range(["#D0021B", "white", "#4A90E2"]);
var income_fill = d3.scaleLinear().domain([0, 100]).range(["white", "green"]);

$("#district-view").hide();

var ros = new ROSLIB.Ros({
	url: 'ws://localhost:9090'
});

ros.on('connection', function(){
	console.log("Connected to ROS bridge");
});

ros.on('error', function(error){
	console.log('Error connecting to websocket server: ', error);
});

ros.on('close', function() {
	console.log('Connection to websocket server closed.');
});

var district_listener = new ROSLIB.Topic({
	ros: ros,
	name: '/evaluated_designs',
	messageType : 'std_msgs/String'
});

var event_listener = new ROSLIB.Topic({
	ros: ros,
	name: '/tuio_control',
	messageType : 'std_msgs/String'
});

district_listener.subscribe(function(message){
	var jsonMess = JSON.parse(message.data);
	if(counter == null){ counter = jsonMess.counter; }
	else{
		if(counter < jsonMess.counter){ return; }
		else{ district_data = jsonMess; }
	}
});

event_listener.subscribe(function(message){
	console.log(message.data);
});

var district_publisher = new ROSLIB.Topic({
	ros: ros,
	name: '/evaluated_designs',
	messageType : 'std_msgs/String'
});

var arr = new ROSLIB.Message ({
	data: JSON.stringify([
	{
		"district_id": 0,
		"precincts": [10, 11, 15, 12],
		"metrics": [
			{
				"name": "race",
				"labels": ["black", "white", "hispanic", "asian", "native"],
				"data": [1200, 15283, 123, 7, 2001]
			},
			{
				"name": "partisan lean",
				"labels": ["republican", "democrat", "independent"],
				"data": [9306, 9306, 2]
			}
		]
	},
	{
		"district_id": 1,
		"precincts": [9, 4, 3, 8],
		"metrics": [
			{
				"name": "race",
				"labels": ["black", "white", "hispanic", "asian", "native"],
				"data": [15283, 2001, 15283, 1200, 7]
			},
			{
				"name": "partisan lean",
				"labels": ["republican", "democrat", "independent"],
				"data": [9306, 2, 9306]
			}
		]
	}
])});

district_publisher.publish(arr);

var countyBounds;

var countyData = [];
d3.json("records.json").then(function(data){
	data.forEach(function(county){
		countyData.push({
			id: county[0],
			name: county[3],
			boundaries: null,
			x: [null, null],
			y: [null, null]
		});
	});
});
var poly;
var polygonData = [];
var district = [];

function updateDistrictView(districtID){
		
}

function updateStateView(metric){
	var districtBounds = [];
	var metricData = [];
	district_data.forEach(function(district){
		districtBounds.push(district.boundaries);
		district.metrics.forEach(function(m){
			if(m.name == metric){ metricData.push(m); }
		});
	});

	//update states graphic
	var state = d3.select("#state");
	state.selectAll("polygon")
		.data(counties).enter().append("polygon")
		.attr("class", function(county){ return county.name; })
		.attr("points", function(county){
			return county.boundaries.map(function(point){
				return [xScale(point[0]), yScale(point[1])].join(",");
			}).join(" ");
		});
	//updates graphs on side
	for(var id = 1; id <= 8; id++){
		var rect = d3.select("#" + id).selectAll("rectangle").data(metricData[id-1]);
		var width = d3.select("#" + id).attr("width");
		var height = d3.select("#" + id).attr("height");

		var yScale = d3.scaleLinear().domain([0, 1]).range([height - state_padding, state_padding]);
		var xBin = (width - 2 * state_padding)/(metricData[id-1].length + 1);

		rect.exit().remove();
		rect.enter().append("rectangle")
			.attr("x", function(d, i){ return xBins * i; })
			.attr("y", function(d){ return yScale(d.amount); })
			.attr("width", xBin)
			.attr("height", function(d){ return height + padding - yScale(d.amount); })
			.attr("class", function(d){ return d.name; });
	}
}

function parseData(labels, data){
	var objArray = [];
	labels.forEach((label, i) => objArray.push({name: label, amount: data[i]}));
	return objArray;
}

d3.json("polygons.json").then(function(data){
	for(var i = 0; i < data.length; i++){
		countyData[i].boundaries = data[i][0];
		countyData[i].x[0] = d3.min(countyData[i].boundaries, function(countyPoint){
			return countyPoint[0];
		});
		countyData[i].x[1] = d3.max(countyData[i].boundaries, function(countyPoint){
			return countyPoint[0];
		});
		countyData[i].y[0] = d3.min(countyData[i].boundaries, function(countyPoint){
			return countyPoint[1];
		});
		countyData[i].y[1] = d3.max(countyData[i].boundaries, function(countyPoint){
			return countyPoint[1];
		});
	}
	minX = d3.min(countyData, function(county){
		return d3.min(county.boundaries, function(countyPoint){
			return countyPoint[0];
		});
	});
	minY = d3.min(countyData, function(county){
		return d3.min(county.boundaries, function(countyPoint){
			return countyPoint[1];
		});
	});

	maxX = d3.max(countyData, function(county){
		return d3.max(county.boundaries, function(countyPoint){
			return countyPoint[0];
		});
	});
	maxY = d3.max(countyData, function(county){
		return d3.max(county.boundaries, function(countyPoint){
			return countyPoint[1];
		});
	});

	//renderCounties(district, x, y);
});
/*
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
}*/