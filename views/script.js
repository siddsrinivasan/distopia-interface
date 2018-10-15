var svg = d3.select("#district");

var districtIDs = [0, 1, 2, 3, 4, 5, 6, 7];
var minX, minY, maxX, maxY;

var counter;
var district_data;

var state_padding = 20;

var partisan_fill = d3.scaleLinear().domain([-1, 0, 1]).range(["#D0021B", "white", "#4A90E2"]);
var income_fill = d3.scaleLinear().domain([0, 100]).range(["white", "green"]);

$("#district-view").hide();

var ros = new ROSLIB.Ros({
	url: 'ws://daarm.ngrok.io'
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
	console.log(jsonMess.count);
	district_data = jsonMess;
	updateStateView("hello");

	//if(counter == null){ counter = jsonMess.count; }
	//else{
	//	if(counter < jsonMess.counter){ return; }
	//	else{
	//		district_data = jsonMess;
	//		updateStateView("hello");
	//	}
	//}
});

event_listener.subscribe(function(message){
	console.log(message.data);
});

var countyBounds;

var countyData = [];
d3.json("records.json").then(function(data){
	data.forEach(function(county){
		countyData.push({
			id: county[0],
			name: county[3],
			boundaries: null,
			x: [null, null],
			y: [null, null],
			fill: null
		});
	});
});

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

});
var poly;
var polygonData = [];
var district = [];

function updateDistrictView(districtID){
	
}

function updateStateView(metric){
	var metricData = [];
	
	if(metric != null){
		district_data.districts.forEach(function(district, i){
			district.metrics.forEach(function(m){
				if(m.name == metric){ metricData.push(m); }
			});
		});
	}
	
	console.log(metricData);

	//update states graphic
	var state = d3.select("#state");

	var stateW = parseFloat(state.style("width"));
	var stateH = parseFloat(state.style("height"));

	var xScale = d3.scaleLinear().domain([minX, maxX]).range([0, stateW]);
	var yScale = d3.scaleLinear().domain([minY, maxY]).range([stateH, 0]);
	
	district_data.districts.forEach(function(distric){
		console.log(district.precincts);
		district.precincts.forEach(function(county){
			console.log(county);
		});
	});
	
	//d3.selectAll("#state > *").remove();

	//state.selectAll("g").data(distric)

	//state.selectAll("polygon").data(districtBounds);
	//
	//state.exit().remove();
	//state.selectAll("polygon").enter().append("polygon")
	//	.attr("points", function(d){
	//		d.forEach(function(county){				
	//			return countyData[county].boundaries.map(function(point){
	//				return [xScale(point[0]), yScale(point[1])].join(",");
	//			}).join(" ");
	//		})
	//	});
	//updates graphs on side
	for(var id = 1; id <= 8; id++){
		var rect = d3.select("#" + "dist" + id).selectAll("rect").data(parseData(metricData[id-1].labels, metricData[id-1].data));
		var width = parseFloat(d3.select("#" + "dist" + id).style("width"));
		var height = parseFloat(d3.select("#" + "dist" + id).style("height"));

		var yScale = d3.scaleLinear().domain([0, 1]).range([height - state_padding, state_padding]);
		var xBin = (width - 2 * state_padding)/(metricData[id-1].labels.length);

		var sum = metricData[id-1].data.reduce((a, b) => a + b, 0);
		console.log(sum);

		rect.exit().remove();
		rect.enter().append("rect")
			.attr("x", function(d, i){ return state_padding + xBin * i; })
			.attr("y", function(d){ return yScale(d.amount/sum); })
			.attr("width", xBin)
			.attr("height", function(d){ return height + state_padding - yScale(d.amount/sum); })
			.attr("class", function(d){ return d.name; })
	}
}

function parseData(labels, data){
	var objArray = [];
	labels.forEach((label, i) => objArray.push({name: label, amount: data[i]}));
	return objArray;
}

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