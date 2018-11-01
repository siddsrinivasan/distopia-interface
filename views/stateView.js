/*
	StateView
	==========
	A statewide view of a selected metric, with a heatmap and a set of histograms
*/
import {parseData, MIN_X, MIN_Y, MAX_X, MAX_Y, METRICS, METRIC_TYPE, STYLES, SCALE} from './distopiaInterface.js'
import Histogram from "./viz/histogram.js";

var SELF;

export class StateView {
	
	constructor(initData, metricFocus = "population", counties){
		this.counties = counties;
		this.metricFocus = metricFocus;
		console.log("Initiating State View");
		this.stateDiv = d3.select("#state").selectAll("polygon");
	
		this.width = parseFloat(d3.select("#state").style("width"));
		this.height = parseFloat(d3.select("#state").style("height"));
		SELF = this;

		this.xScale = d3.scaleLinear().domain([MIN_X, MAX_X]).range([0, this.width]);
		this.yScale = d3.scaleLinear().domain([MIN_Y, MAX_Y]).range([this.height, 0]);

		this.drawn = false;

		this.histograms = [];
		if(initData != null){
			this.drawStatePolygons();
			const focusedData = this.filterByFocusMetric(initData);
			for(var i = 0; i < 8; i++){
				this.histograms.push(new Histogram("#" + "dist" + (i+1), focusedData[i].data, focusedData[i].labels, styles[this.metricFocus]));
			}
		}
	}

	filterByFocusMetric(data){
		let districtData = []
		data.forEach(district => {
			district.metrics.forEach(m =>{
				if(m.name == this.metricFocus){
					districtData.push(m);
				}
			});
		});
		return districtData;
	}
	
	setMetricFocus(metric){
		this.metricFocus = metric;
		//this.paintHistograms();
	}

	getMetricFocus(){
		return this.metricFocus;
	}

	paintStateViz(countyData){
		this.stateDiv.data(countyData);
		this.stateDiv.style("fill", function(county){
			return county.fill;
		});
	}

	paintHistograms(data){
		for(var i = 0; i < this.histograms.length; i++){
			this.histograms[i].update(data[i].data, data[i].labels, STYLES[this.metricFocus]);
		}
	}

	update(data,metric){
		//update the viz. Note that the
		if(metric != undefined){
			this.setMetricFocus(metric);
		}
		console.log(data);
		if(data.length < 8){
			return;
		}
		//pull the metric wanted for each district

		let filledCounties = [];		
		const districtData = this.filterByFocusMetric(data);
		if(this.histograms.length == 0){
			for(var i = 0; i < 8; i++){
				this.histograms.push(new Histogram("#" + "dist" + (i+1), districtData[i].data, districtData[i].labels, STYLES[this.metricFocus]));
			}
		}
		if(!this.drawn){ this.drawStatePolygons(); }

		districtData.forEach((district) => {
			let f = SCALE[this.metricFocus](district.data);
			district.precincts.forEach((precinct) => {
				filledCounties.push({...this.counties[precinct], fill: f});
			});
		});

		this.paintStateViz(filledCounties);
		this.paintHistograms(districtData);	
	}

	drawStatePolygons(){
		//TODO: change how referencing counties
		this.stateDiv.data(this.counties).enter().append("polygon")
			.attr("points", function(county){
				return county.boundaries.map(function(point){
					return [SELF.xScale(point[0]), SELF.yScale(point[1])].join(",");
				}).join(" ");
			})
			.style("fill", function(county){ 
				if(county.fill == null) return "white";
				else return county.fill;
			});
		this.drawn = true;
	}
}