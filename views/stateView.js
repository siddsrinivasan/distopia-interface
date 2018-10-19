/*
    StateView
    ==========
    A statewide view of a selected metric, with a heatmap and a set of histograms
*/

class StateView{
    constructor(minX, maxX, initData, metricFocus){
        this.metricFocus = metricFocus ? metricFocus : "demographics";
        console.log("Initiating State View");
        this.state = d3.select("#state").selectAll("polygon");
    
        this.width = parseFloat(d3.select("#state").style("width"));
        this.height = parseFloat(d3.select("#state").style("height"));
    
        this.xScale = d3.scaleLinear().domain([minX, maxX]).range([0, this.width]);
        this.yScale = d3.scaleLinear().domain([minY, maxY]).range([this.height, 0]);
    
        this.state.data(initData).enter().append("polygon")
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
    setMetricFocus(metric){
        this.metricFocus = metric;
    }

    paintStateViz(data){

    }

    paintHistograms(data){

    }

    update(data,metric){
        //update the viz. Note that the
        this.setMetricFocus(metric);
        //pull the metric wanted for each district
        let districtData = []
        data.forEach((district,i)=>{
            district.metrics.forEach((m)=>{
                if(m.name == metric){
                    districtData.push(m);        
                }
            })
        })

    }
    var metricData = [];

	if(metric != null){
		district_data.districts.forEach(function(district, i){
			district.metrics.forEach(function(m){
				if(m.name == metric){ metricData.push(m); }
			});
		});
	}

	var colors = ["#E6AF82", "#82E0E6", "#A49AC9", "#BDE682", "#E68882", "white", "#C582E6"];

	//update states graphic
	district_data.districts.forEach(function(district){
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

		var yScale = d3.scaleLinear().domain([0, 1]).range([height - state_padding, state_padding]);
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

export default StateView;