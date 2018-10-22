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
		const width = parseFloat(d3.select(selector).style("width"));
		const height = parseFloat(d3.select(selector).style("height"));

		const yScale = d3.scaleLinear().domain([0, 1]).range([height - padding, padding]);
		const binWidth = (width - 2 * padding)/7.0;

		//sum across the frequency bins to normalize the counts
		const sum = frequencies.reduce((a, b) => a + b, 0);

		let rect = d3.select(this.selector)
			.selectAll("rect").data(parseData(labels, data))
			.attr("x", function(d, i){ return padding + binWidth * i; })
			.attr("y", function(d){ return yScale(d.amount/sum); })
			.attr("width", binWidth)
			.attr("height", function(d){ return height + padding - yScale(d.amount/sum); })
			.attr("fill", function(d,i){ return colors[labels[i]]});

		rect.enter().append("rect")
			.attr("x", function(d, i){ return padding + binWidth * i; })
			.attr("y", function(d){ return yScale(d.amount/sum); })
			.attr("width", binWidth)
			.attr("height", function(d){ return height + padding - yScale(d.amount/sum); })
			.attr("fill", function(d,i){ return colors[labels[i]]});
		
		rect.exit().remove();
	}

	update(data, labels, styles) {
		this.render(data, labels, styles);
	}
}

export default Histogram;