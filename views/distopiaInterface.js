/*
	DistopiaInterface
	=================
	The main controller for the Distopia HUD
*/

var MIN_X, MIN_Y, MAX_X, MAX_Y;

//These are global color scales for different metrics
//To invoke, scales.[NAME OF SCALE](VALUE) ex: scales.partisanFill(0.5)
var SCALE = {
	partisanFill : d3.scaleLinear().domain([-1, 0, 1]).range(["#D0021B", "white", "#4A90E2"]),
	incomeFill : d3.scaleLinear().domain([0, 100]).range(["white", "green"])
}

var METRICS = ["income","age","sex","race","education","occupation","population","projected_votes","pvi","wasted_votes","compactness"]

var METRIC_TYPE = ["histogram","histogram","histogram","histogram","histogram","histogram","scalar","histogram","scalar","histogram","scalar"]

var STYLES = {

	race: {
		colors:{
			white: "#FFFFF",
			black: "#AAAAA"
		}
	},
}

class DistopiaInterface{
	/*
		This class interfaces between the TUI and the HUD.$
		It contains the ROS initialization and listener callbacks
		It also initializes the state and district views.						
	*/
	constructor(initialView = "state"){
		this.districtIDs = [0, 1, 2, 3, 4, 5, 6, 7];
		this.counter = 0;
		this.districts = [];
		this.counties = [];
		this.initRosBridge();
		this.initDataListener();
		this.initControlListener();
		this.setupCounties();

		//initializes stateView and districtView classes as null variables
		//(easy way to check if they need to be initialized)
		this.stateView = null;
		this.districtView = null;

		this.currentView = initialView;
	
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
		
		this.ros.on('error', function(error){
			console.log('Error connecting to websocket server: ', error);
		});
		
		this.ros.on('close', function() {
			console.log('Connection to websocket server closed.');
		});
	}

	initDataListener(){
		this.dataListener = new ROSLIB.Topic({
			ros: this.ros,
			name: '/evaluated_designs',
			messageType : 'std_msgs/String'
		});

		this.dataListener.subscribe(this.handleData);
	}

	initControlListener(){
		this.controlListener = new ROSLIB.Topic({
			ros: this.ros,
			name: '/tuio_control',
			messageType : 'std_msgs/String'
		});
		this.controlListener.subscribe(this.handleCommand);
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
			if(this.stateView == null){ this.stateView(this.districts); }
			else{ this.stateView.update(this.districts); }
		}
		else{
			if(this.districtView == null){ this.districtView(this.districts); }
			else{ this.districtView.update(this.districts); }
		}
	}

	handleCommand(message){
		console.log("Got Command:",message);
	}

	setupCounties(){
		let self = this;
		d3.json("records.json").then(function(data){
			data.forEach(function(county){
				self.counties.push({
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
				self.counties[i].boundaries = data[i][0];
				self.counties[i].x[0] = d3.min(self.counties[i].boundaries, function(countyPoint){
					return countyPoint[0];
				});
				self.counties[i].x[1] = d3.max(self.counties[i].boundaries, function(countyPoint){
					return countyPoint[0];
				});
				self.counties[i].y[0] = d3.min(self.counties[i].boundaries, function(countyPoint){
					return countyPoint[1];
				});
				self.counties[i].y[1] = d3.max(self.counties[i].boundaries, function(countyPoint){
					return countyPoint[1];
				});
			}
			MIN_X = d3.min(self.counties, function(county){
				return d3.min(county.boundaries, function(countyPoint){
					return countyPoint[0];
				});
			});
			MIN_Y = d3.min(self.counties, function(county){
				return d3.min(county.boundaries, function(countyPoint){
					return countyPoint[1];
				});
			});
			MAX_X = d3.max(self.counties, function(county){
				return d3.max(county.boundaries, function(countyPoint){
					return countyPoint[0];
				});
			});
			MAX_Y = d3.max(self.counties, function(county){
				return d3.max(county.boundaries, function(countyPoint){
					return countyPoint[1];
				});
			});
			//initateStateView();
		});
	}

	toggleView(){
		if(this.currentView == "state"){
			$("#district-view").hide();
			$("#state-view").show();
			this.currentView = "district";
		}
		else{
			$("#state-view").hide();
			$("#district-view").show();
			this.currentView = "state";
		}
	}
	
	modifyCounty(id, data){
		if(this.counties[id] != null){
			this.counties[id] = data;
			return true;
		}
		else{
			return false;
		}
	}
	
	//first call getCounty id and then modify
	getCounty(id){
		if(this.counties[id] != null){
			return this.counties[id];
		}
		else { return false; }
	}
}

export const parseData = (labels, data) => {
	let objArray = [];
	labels.forEach((label, i) => objArray.push({name: label, amount: data[i]}));
	return objArray;
}

var d = new DistopiaInterface();
d.initDataListener();
d.initControlListener();

$(".button").click(() =>{
	d.toggleView();
});