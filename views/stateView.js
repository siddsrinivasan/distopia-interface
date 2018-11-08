/*
	StateView
	==========
	A statewide view of a selected metric, with a heatmap and a set of histograms
*/
import {parseData, METRICS, METRIC_TYPE, STYLES, SCALE} from './distopiaInterface.js'
import Histogram from "./viz/histogram.js";

var SELF;

export class StateView {
	
	constructor(initData, metricFocus = "population", counties){
		this.counties = counties;
		this.metricFocus = metricFocus;
		console.log("Initiating State View");
		this.stateDiv = d3.select("#state");
	
		this.width = parseFloat(d3.select("#state").style("width"));
		this.height = parseFloat(d3.select("#state").style("height"));
		SELF = this;

		this.xScale = null;
		this.yScale = null;

		this.MIN_X = null;
		this.MIN_Y = null;
		this.MAX_X = null;
		this.MAX_Y = null;

		this.drawn = false;
		this.drawStatePolygons();

		let max = 1;
		if(this.metricFocus == "population"){ max = 3000000; }
		console.log(max);

		this.histograms = [];
		if(initData != null){
			const focusedData = this.filterByFocusMetric(initData);
			for(var i = 0; i < 8; i++){
				this.histograms.push(new Histogram("#" + "dist" + (i+1), focusedData[i].data, focusedData[i].labels, styles[this.metricFocus],max));
			}
		}
	}

	filterByFocusMetric(data){
		let districtData = []
		data.forEach(district => {
			let d = {
				precincts: district.precincts,
				name: null,
				labels: null,
				data: null,
				scalar_value: null,
				scalar_maximum: null
			}
			district.metrics.forEach(m => {
				if(m.name == this.metricFocus){
					d.name = m.name;
					d.labels = m.labels;
					d.data = m.data;
					d.scalar_value = m.scalar_value;
					d.scalar_maximum = m.scalar_maximum;
				}
			});
			districtData.push(d);
		});
		return districtData;
	}
	
	setMetricFocus(metric){
		this.metricFocus = metric;
	}

	getMetricFocus(){
		return this.metricFocus;
	}

	setBounds(MIN_X, MIN_Y, MAX_X, MAX_Y){
		this.MIN_X = MIN_X;
		this.MIN_Y = MIN_Y;
		this.MAX_X = MAX_X;
		this.MAX_Y = MAX_Y;

		this.xScale = d3.scaleLinear().domain([MIN_X, MAX_X]).range([20, this.width - 20]);
		this.yScale = d3.scaleLinear().domain([MIN_Y, MAX_Y]).range([this.height - 20, 20]);
	}

	paintStateViz(){
		let state = this.stateDiv.selectAll("polygon").data(this.counties);
		state.attr("fill", function(county){
			return county.fill;
		});
	}

	paintHistograms(data){
		let max = 1;
		if(this.metricFocus == "population"){ max = 3000000; }
		for(var i = 0; i < this.histograms.length; i++){
			this.histograms[i].update(data[i].data, data[i].labels, STYLES[this.metricFocus], max);
		}
	}

	update(data,metric){
		//update the viz. Note that the
		if(metric != undefined){
			if(metric != this.metric){
				this.setMetricFocus(metric);
			}
		}
		console.log(this.metricFocus);
		if(data.length < 8){ return; }
		
		//pull the metric wanted for each district
		let max = 1;
		if(this.metricFocus == "population"){ max = 3000000; }
		console.log(max);
		const districtData = this.filterByFocusMetric(data);
		if(this.histograms.length == 0){
			for(var i = 0; i < 8; i++){
				this.histograms.push(new Histogram("#" + "dist" + (i+1), districtData[i].data, districtData[i].labels, STYLES[this.metricFocus], max));
			}
		}
		if(!this.drawn){ this.drawStatePolygons(); }

		console.log(districtData);

		districtData.forEach((district) => {
			let scale = SCALE[this.metricFocus];
			let f = scale([district.scalar_value, district.scalar_maximum]);
			district.precincts.forEach((precinct) => {
				this.counties[precinct].fill = f;
			});
		});

		this.paintStateViz();
		this.paintHistograms(districtData);	
	}

	drawStatePolygons(){
		if(this.xScale != null){
			this.stateDiv.selectAll("polygon").data(this.counties).enter().append("polygon")
				.attr("points", function(county){
					return county.boundaries.map(function(point){
						return [SELF.xScale(point[0]), SELF.yScale(point[1])].join(",");
					}).join(" ");
				})
				.attr("fill", function(county){
					return county.fill;
				});
			this.drawn = true;
		}
		else{ return; }
	}
}