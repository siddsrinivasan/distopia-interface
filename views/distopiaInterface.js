/*
	DistopiaInterface
	=================
	The main controller for the Distopia HUD
*/

class DistopiaInterface{
	
	minX; minY; maxX; maxY;

	constructor(initialView = "state"){
		this.svg = d3.select("#district");
		this.districtIDs = [0, 1, 2, 3, 4, 5, 6, 7];
		this.counter = 0;
		this.districts = [];
		this.counties = [];
		this.initRosBridge();
		this.initDataListener();
		this.initControlListener();
		this.setupCounties();
		this.currentView = initialView;
		this.scales = {
			"partisanFill": d3.scaleLinear().domain([-1, 0, 1]).range(["#D0021B", "white", "#4A90E2"]),
			"incomeFill": d3.scaleLinear().domain([0, 100]).range(["white", "green"])
		}

		if(initialView == "state"){
			$("#district-view").hide();
			$("#state-view").show();
		}
		else{
			$("#state-view").hide();
			$("#district-view").show();
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
		//check the counter
		const messageData = JSON.parse(message.data);
		if(messageData.counter <= this.counter){
			return;
		}
		this.counter = messageData.counter;
		this.districts = messageData.districts;
		if(this.currentView == "state"){
			this.stateView.update(this.districts);
		}
		else{
			this.districtView.update(this.districts);
		}
	}

	handleCommand(message){
		console.log("Got Command:",message);
	}

	setupCounties(){
		d3.json("records.json").then(function(data){
			data.forEach(function(county){
				this.counties.push({
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
				this.counties[i].boundaries = data[i][0];
				this.counties[i].x[0] = d3.min(this.counties[i].boundaries, function(countyPoint){
					return countyPoint[0];
				});
				this.counties[i].x[1] = d3.max(this.counties[i].boundaries, function(countyPoint){
					return countyPoint[0];
				});
				this.counties[i].y[0] = d3.min(this.counties[i].boundaries, function(countyPoint){
					return countyPoint[1];
				});
				this.counties[i].y[1] = d3.max(this.counties[i].boundaries, function(countyPoint){
					return countyPoint[1];
				});
			}
			minX = d3.min(this.counties, function(county){
				return d3.min(county.boundaries, function(countyPoint){
					return countyPoint[0];
				});
			});
			minY = d3.min(this.counties, function(county){
				return d3.min(county.boundaries, function(countyPoint){
					return countyPoint[1];
				});
			});
			maxX = d3.max(this.counties, function(county){
				return d3.max(county.boundaries, function(countyPoint){
					return countyPoint[0];
				});
			});
			maxY = d3.max(this.counties, function(county){
				return d3.max(county.boundaries, function(countyPoint){
					return countyPoint[1];
				});
			});
			initateStateView();
		});
	}

	set modifyCounty(id, data){
		if(this.counties[id] != null){
			this.counties[id] = data;
			return true;
		}
		else{
			return false;
		}
	}

	get getCounty(id){
		if(this.counties[id] != null){
			return this.counties[id];
		}
		else { return false; }
	}
}

function parseData(labels, data){
	var objArray = [];
	labels.forEach((label, i) => objArray.push({name: label, amount: data[i]}));
	return objArray;
}


d = DistopianInterface();
d.initDataListener();
d.initControlListener();