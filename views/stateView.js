/*
	StateView
	==========
	A statewide view of a selected metric, with a heatmap and a set of histograms
*/

class StateView {
	
	constructor(initData, metricFocus){
		this.metricFocus = metricFocus ? metricFocus : "demographics";
		console.log("Initiating State View");
		this.stateDiv = d3.select("#state").selectAll("polygon");
	
		this.width = parseFloat(d3.select("#state").style("width"));
		this.height = parseFloat(d3.select("#state").style("height"));

		this.drawStatePolygons();

		this.xScale = d3.scaleLinear().domain([minX, maxX]).range([0, this.width]);
		this.yScale = d3.scaleLinear().domain([minY, maxY]).range([this.height, 0]);
	}
	
	setMetricFocus(metric){
		this.metricFocus = metric;
		this.paintHistograms();
	}

	paintStateViz(){
		this.stateDiv.data(d.counties);
		this.stateDiv.style("fill", function(county){
			return county.fill;
		});
	}

	paintHistograms(data){
		for(var id = 1; id <= 8; id++){
			if(id == 1){ console.log(parseData(metricData[id-1].labels, metricData[id-1].data));}
	
			var width = parseFloat(d3.select("#" + "dist" + id).style("width"));
			var height = parseFloat(d3.select("#" + "dist" + id).style("height"));
	
			var yScale = d3.scaleLinear().domain([0, 1]).range([height + state_padding, state_padding]);
			var xBin = (width - 2 * state_padding)/7.0;
	
			var sum = metricData[id-1].data.slice(3,10).reduce((a, b) => a + b, 0);
			
			var rect = d3.select("#" + "dist" + id)
				.selectAll("rect").data(parseData(metricData[id-1].labels, metricData[id-1].data))
				.attr("x", function(d, i){ return state_padding + xBin * i; })
				.attr("y", function(d){ return yScale(d.amount/sum); })
				.attr("width", xBin)
				.attr("height", function(d){ return height + state_padding - yScale(d.amount/sum); })
				.attr("class", function(d){ return d.name; });
	
			rect.enter().append("rect")
				.attr("x", function(d, i){ return state_padding + xBin * i; })
				.attr("y", function(d){ return yScale(d.amount/sum); })
				.attr("width", xBin)
				.attr("height", function(d){ return height + state_padding - yScale(d.amount/sum); })
				.attr("fill", function(d,i){ return colors[i]})
				.attr("class", function(d){ return d.name; });
			
			rect.exit().remove();
		}
	}

	update(data,metric){
		//update the viz. Note that the
		this.setMetricFocus(metric);

		//pull the metric wanted for each district
		let districtData = []
		d.districts.forEach(district => {
			district.metrics.forEach(m =>{
				if(m.name == metric){
					districtData.push(m);
				}
			});
		});

		//updates fills for each county so that it can use paintStateViz()
		d.districts.forEach((district,i) => {
			var sum = districtData[id-1].data.reduce((a, b) => a + b, 0);
			var fVal = districtData[i]/sum;
			var scale = d.scales.metric;
			district.precincts.forEach(p => {
				var countyDatum = d.getCounty(p);
				//countyDatum.fill = scale(fVal); //This will be used once we have scales for every metric
				d.modifyCounty(p, countyDatum);
			});
		});
		this.paintStateViz();
		this.paintHistograms(districtData);	
	}

	///ABSOLUTELY DO NOT USE THIS EXCEPT TO CHECK IF DATA BINDING IS WORKING
	//THIS WILL MESS UP ALL REAL DATA
	randomizeData(){
		var colors = ["#E6AF82", "#82E0E6", "#A49AC9", "#BDE682", "#E68882", "white", "#C582E6"];
		//update states graphic
		d.districts.forEach(district => {
			var rand = colors[Math.floor(Math.random() * colors.length)];
			district.metrics.forEach(metric => {
				var dat = [];
				for(var i = 0; i < 6; i++){
					dat.push(Math.floor(Math.random() * 50) + 1);
				}
				metric.data = dat;
			});

			district.precincts.forEach(function(p){
				var countyDatum = d.getCounty(p);
				countyDatum.fill = rand;
				d.modifyCounty(p, countyDatum);
			});
		});

		this.paintStateViz();
		this.paintHistograms(districtData);
	}

	drawStatePolygons(){
		this.stateDiv.data(d.counties).enter().append("polygon")
			.attr("points", function(county){
				return county.boundaries.map(function(point){
					return [this.xScale(point[0]), this.yScale(point[1])].join(",");
				}).join(" ");
			})
			.style("fill", function(county){ 
				if(county.fill == null) return "white";
				else return county.fill;
			});
	}
}

export default StateView;