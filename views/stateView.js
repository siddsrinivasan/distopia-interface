/*
	StateView
	==========
	A statewide view of a selected metric, with a heatmap and a set of histograms
*/
import {parseData, distopia, MIN_X, MIN_Y, MAX_X, MAX_Y, SCALE} from './distopiaInterface.js'
import Histogram from "./viz/histogram.js";

var SELF;

export class StateView {
	
	constructor(initData, metricFocus = "demographics"){
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
			for(var i = 0; i < 8; i++){
				this.histograms.push(new Histogram("#" + "dist" + id, initData[i].data, initData[i].labels, styles[this.metricFocus]));
			}
		}
	}
	
	setMetricFocus(metric){
		this.metricFocus = metric;
		this.paintHistograms();
	}

	paintStateViz(){
		this.stateDiv.data(distopia.counties);
		this.stateDiv.style("fill", function(county){
			return county.fill;
		});
	}

	paintHistograms(data, labels){
		for(var i = 0; i < 8; i++){
			this.histograms[i].update(data[i], labels, styles[this.metricFocus]);
		}
	}

	update(data,metric){
		//update the viz. Note that the
		this.setMetricFocus(metric);

		console.log(data);

		if(this.histograms.length == 0){
			for(var i = 0; i < 8; i++){
				SELF.histograms.push(new Histogram("#" + "dist" + id, data[i].data, data[i].labels, styles[SELF.metricFocus]));
			}
		}
		if(!this.drawn){ this.drawStatePolygons(); }

		//pull the metric wanted for each district
		let districtData = []
		data.districts.forEach(district => {
			district.metrics.forEach(m =>{
				if(m.name == metric){
					districtData.push(m);
				}
			});
		});

		//updates fills for each county so that it can use paintStateViz()
		distopia.districts.forEach((district,i) => {
			var sum = districtData[id-1].data.reduce((a, b) => a + b, 0);
			var fVal = districtData[i]/sum;
			var scale = distopia.scales.metric;
			district.precincts.forEach(p => {
				var countyDatum = distopia.getCounty(p);
				//countyDatum.fill = scale(fVal); //This will be used once we have scales for every metric
				distopia.modifyCounty(p, countyDatum);
			});
		});
		this.paintStateViz();
		this.paintHistograms(districtData);	
	}

	drawStatePolygons(){
		//TODO: change how referencing counties
		this.stateDiv.data(distopia.getCounties()).enter().append("polygon")
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