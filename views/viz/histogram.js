/*
	Histogram
	==========
	Generic histogram
	Inputs:
		selector: d3 selector, e.g. "#district7"
		data: 
*/
import {parseData} from '../distopiaInterface.js';

const padding = 45;

class Histogram{
	constructor(selector, initialData, labels, styles) {
		this.selector = selector;
		this.render(initialData, labels, styles);
	}

	render(data, labels, styles){
		d3.select(this.selector).selectAll(".xAxis").remove(); 
		d3.select(this.selector).selectAll(".yAxis").remove();
		d3.select(this.selector).selectAll("rect").remove();

		const colors = styles.colors;
		const width = parseFloat(d3.select(this.selector).style("width"));
		const height = parseFloat(d3.select(this.selector).style("height"));

		const xScale = d3.scaleBand().domain(labels.map(function(d){ return d; }))
										.range([padding, width - padding])
										.paddingInner([0.1])
										.paddingOuter([0.2])
										.align([0.5])
		const yScale = d3.scaleLinear().domain([0, 3000000]).range([height - padding, padding]);

		//sum across the frequency bins to normalize the counts
		//const sum = data.reduce((a, b) => a + b, 0);

		//adds axis to the histogram
		d3.select(this.selector).append("g").attr("class", "xAxis")
			.attr("transform", "translate(" + [0, height - padding] + ")")
			.call(d3.axisBottom(xScale));
		d3.select(this.selector).append("g").attr("class", "yAxis")
			.attr("transform", "translate(" + [padding, 0] + ")")
			.call(d3.axisLeft(yScale));

		//enters data
		let rect = d3.select(this.selector)
			.selectAll("rect").data(parseData(labels, data))
			.attr("x", function(d){ return xScale(d.name); })
			.attr("y", function(d){ return yScale(d.amount); })
			.attr("width", xScale.bandwidth())
			.attr("height", function(d){ return yScale(0) - yScale(d.amount); })
			.attr("fill", function(d,i){ return colors[labels[i]]});

		//updates data
		rect.enter().append("rect")
			.attr("x", function(d){ return xScale(d.name); })
			.attr("y", function(d){ return yScale(d.amount); })
			.attr("width", xScale.bandwidth())
			.attr("height", function(d){ return yScale(0) - yScale(d.amount); })
			.attr("fill", function(d,i){ return colors[labels[i]]});
		
		//removes data
		rect.exit().remove();
	}

	update(data, labels, styles) {
		this.render(data, labels, styles);
	}
}

export default Histogram;