/*
	DistopiaInterface
	=================
	The main controller for the Distopia HUD
*/


class DistopiaInterface{

	constructor(initialView = "state"){
		this.svg = d3.select("#district");
		this.districtIDs = [0, 1, 2, 3, 4, 5, 6, 7];
		this.minX = this.minY = this.maxX = this.maxY = 0;
		this.counter = 0;
		this.districts = [];
		this.statePadding = 20;
		this.initRosBridge();
		this.initDataListener();
		this.initControlListener();

		this.scales = {
			"partisanFill": d3.scaleLinear().domain([-1, 0, 1]).range(["#D0021B", "white", "#4A90E2"]),
			"incomeFill": d3.scaleLinear().domain([0, 100]).range(["white", "green"])
		}

		if(initialView == "state"){
			$("#district-view").hide();
		}
		else{
			$("#state-view").hide();
		}
		

	}

	initRosBridge(){
		this.ros = new ROSLIB.Ros({
			url: 'ws://localhost:9090'
		});
		
		this.ros.on('connection', function(){
			console.log("Connected to ROS bridge");
		});
		
		this.on('error', function(error){
			console.log('Error connecting to websocket server: ', error);
		});
		
		this.on('close', function() {
			console.log('Connection to websocket server closed.');
		});
	}

	initDataListener(){
		this.dataListener = new ROSLIB.Topic({
			ros: ros,
			name: '/evaluated_designs',
			messageType : 'std_msgs/String'
		});

		this.dataListener.subscribe(this.handleData);
	}

	initControlListener(){
		this.controlListener = new ROSLIB.Topic({
			ros: ros,
			name: '/tuio_control',
			messageType : 'std_msgs/String'
		});
		this.controlListener.subscribe(handleCommand);
	}

	handleData(message){
		var jsonMess = JSON.parse(message.data);
		//console.log(jsonMess.count);
		districts = jsonMess;
		updateStateView("demographics");
	}

	handleCommand(message){
		console.log("Got Command:",message);
	}

	
}

d = DistopianInterface();


var svg = d3.select("#district");

var districtIDs = [0, 1, 2, 3, 4, 5, 6, 7];
var minX, minY, maxX, maxY;

var counter;
var districts;

var statePadding = 20;

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
	//console.log(jsonMess.count);
	districts = jsonMess;
	updateStateView("demographics");
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
	initateStateView();
});
var poly;
var polygonData = [];
var district = [];

function initateStateView(){
	console.log("initate");
	var state = d3.select("#state").selectAll("polygon");

	var stateW = parseFloat(d3.select("#state").style("width"));
	var stateH = parseFloat(d3.select("#state").style("height"));

	var xStateScale = d3.scaleLinear().domain([minX, maxX]).range([0, stateW]);
	var yStateScale = d3.scaleLinear().domain([minY, maxY]).range([stateH, 0]);

	state.data(countyData).enter().append("polygon")
		.attr("points", function(county){
			return county.boundaries.map(function(point){
				return [xStateScale(point[0]), yStateScale(point[1])].join(",");
			}).join(" ");
		})
		.style("fill", function(county){ 
			if(county.fill == null) return "white";
			else return county.fill;
		});
}

function updateStateView(metric){
	var metricData = [];

	if(metric != null){
		districts.districts.forEach(function(district, i){
			district.metrics.forEach(function(m){
				if(m.name == metric){ metricData.push(m); }
			});
		});
	}

	var colors = ["#E6AF82", "#82E0E6", "#A49AC9", "#BDE682", "#E68882", "white", "#C582E6"];

	//update states graphic
	districts.districts.forEach(function(district){
		var rand = colors[Math.floor(Math.random() * colors.length)];
		
			switch(metric){
				case "demographics":
					whitePop = 	district.metrics[0].data[2] //this will not generalize!!!!
					totalPop =  district.metrics[0].data[0]
					summaryColor = d3.interpolatePurples(1-whitePop/(1.0*totalPop));
					console.log("COLOR",whitePop, totalPop, summaryColor);
					break;
			}
		district.precincts.forEach(function(county){
			countyData[county].fill = summaryColor;
		});
	});

	updateDistMap();

	function updateDistMap(){
		var state = d3.select("#state").selectAll("polygon").data(countyData);
		
		state.style("fill", function(county){
			return county.fill;
		});
	}
	
	//updates graphs on side
	for(var id = 1; id <= 8; id++){
		if(id == 1){ console.log(parseData(metricData[id-1].labels, metricData[id-1].data));}

		
		var width = parseFloat(d3.select("#" + "dist" + id).style("width"));
		var height = parseFloat(d3.select("#" + "dist" + id).style("height"));

		var yScale = d3.scaleLinear().domain([0, 1]).range([height - statePadding, statePadding]);
		var xBin = (width - 2 * statePadding)/7.0;

		var sum = metricData[id-1].data.slice(3,10).reduce((a, b) => a + b, 0);
		
		var rect = d3.select("#" + "dist" + id)
			.selectAll("rect").data(parseData(metricData[id-1].labels, metricData[id-1].data))
			.attr("x", function(d, i){ return statePadding + xBin * i; })
			.attr("y", function(d){ return yScale(d.amount/sum); })
			.attr("width", xBin)
			.attr("height", function(d){ return height + statePadding - yScale(d.amount/sum); })
			.attr("class", function(d){ return d.name; });

		rect.enter().append("rect")
			.attr("x", function(d, i){ return statePadding + xBin * i; })
			.attr("y", function(d){ return yScale(d.amount/sum); })
			.attr("width", xBin)
			.attr("height", function(d){ return height + statePadding - yScale(d.amount/sum); })
			.attr("fill", function(d,i){ return colors[i]})
			.attr("class", function(d){ return d.name; });
		
		rect.exit().remove();
	}
}

export function parseData(labels, data, fields){
	var objArray = [];
	labels.forEach((label, i) => {if(fields.find(i)>=0) objArray.push({name: label, amount: data[i]})});
	return objArray;
}