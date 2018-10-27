/*
	Histogram
	==========
	Generic histogram
	Inputs:
		selector: d3 selector, e.g. "#district7"
		data: 
*/
import {parseData} from '../distopiaInterface';

const padding = 20;

class Histogram{
	constructor(selector, initialData, labels, styles) {
		this.selector = selector;
		this.render(initialData, labels, styles);
	}

	render(data, labels, styles){
		const colors = styles.colors;
		const width = parseFloat(d3.select(this.selector).style("width"));
		const height = parseFloat(d3.select(this.selector).style("height"));

		const xScale = d3.scaleOrdinal().domain(labels.map(function(d){ return d; })).range([padding, width - padding])
			.paddingInner([0.1]).paddingOuter([0.2]).align([0.5]);
		const yScale = d3.scaleLinear().domain([0, 1]).range([padding, height - padding]);

		const xAxis = d3.axisBottom(xScale);
		const yAxis = d3.axisLeft(yScale);

		//sum across the frequency bins to normalize the counts
		const sum = frequencies.reduce((a, b) => a + b, 0);

		//adds axis to the histogram
		d3.select(this.selector).append("g").call(xAxis)
			.attr("transform", "translate(" + [padding, height - padding], ")");
		d3.select(this.selector).append("g").call(yAxis)
			.attr("transform", "translate(" + [padding, padding], ")");

		//enters data
		let rect = d3.select(this.selector)
			.selectAll("rect").data(parseData(labels, data))
			.attr("x", function(d){ return xScale(d.name); })
			.attr("y", function(d){ return -yScale(d.amount/sum); })
			.attr("width", xScale.bandwidth())
			.attr("height", function(d){ return yScale(d.amount/sum); })
			.attr("fill", function(d,i){ return colors[labels[i]]});

		//updates data
		rect.enter().append("rect")
			.attr("x", function(d){ return xScale(d.name); })
			.attr("y", function(d){ return -yScale(d.amount/sum); })
			.attr("width", xScale.bandwidth())
			.attr("height", function(d){ return yScale(d.amount/sum); })
			.attr("fill", function(d,i){ return colors[labels[i]]});
		
		//removes data
		rect.exit().remove();
	}

	update(data, labels, styles) {
		this.render(data, labels, styles);
	}
}

export default Histogram;