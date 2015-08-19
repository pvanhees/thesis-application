function drawChord(graph) {
	if (!graph.hasGraphProperties("weighted", "directed")
			|| !graph.hasNodeProperties("category")) {
		d3.select("body").append("p").html("The selected data is not fit for this visualisation");
		return false;
	}

	var width = 800,
	height = 800,
	r1 = height / 2,
	innerRadius = Math.min(width, height) * .39,
	outerRadius = innerRadius * 1.04;

	categories = graph.getDataProperties().categories;

	matrix = [];
	for(i = 0; i < categories.length; i++){
		row = [];
		for(j = 0; j < categories.length; j++){
			row[j] = 0;
		}
		matrix[i]  = row;
	}

	graph.getEdges().forEach( function(edge) {
		sourceIndex = categories.indexOf(graph.getNodeProperty(edge.source, "category"));
		targetIndex = categories.indexOf(graph.getNodeProperty(edge.target, "category"));

		matrix[sourceIndex][targetIndex] = matrix[sourceIndex][targetIndex] + 1;
	});


	var colors = [];
	for(i = 0; i < categories.length; i++){
		colors[i] = '#'+(Math.random()*0xFFFFFF<<0).toString(16);
	}

	var fill = d3.scale.ordinal()
		.domain(d3.range(categories.length))
		.range(colors);  

	var formatPercent = d3.format(".1%");

	var arc = d3.svg.arc()
		.innerRadius(innerRadius)
		.outerRadius(outerRadius);

	var chord = d3.layout.chord()
		.padding(.04)
		.sortSubgroups(d3.descending)
		.sortChords(d3.ascending)
		.matrix(matrix);

	var svg = d3.select("#visualisations").append("svg")
	.attr("width", width+200)
	.attr("height", height+200)
	.append("g")
	.attr("transform", "translate(" + (width+200) / 2 + "," + (height+200) / 2 + ")");

	svg.append("g").selectAll("path")
		.data(chord.groups)
		.enter().append("path")
		.attr("class", "arc")
		.style("fill", function(d) {
			return d.index < 4 ? '#444444' : fill(d.index);
		})
		.attr("d", d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius))
	
	svg.append("g")
		.attr("class", "chord")
		.selectAll("path")
		.data(chord.chords)
		.enter().append("path")
		.attr("d", d3.svg.chord().radius(innerRadius))
		.style("fill", function(d) { return fill(d.target.index); })
		.style("opacity", 0.7);


	svg.append("g").selectAll(".arc")
		.data(chord.groups)
		.enter().append("svg:text")
		.attr("dy", ".35em")
		.attr("text-anchor", function(d) { return ((d.startAngle + d.endAngle) / 2) > Math.PI ? "end" : null; })
		.attr("transform", function(d) {
			return "rotate(" + (((d.startAngle + d.endAngle) / 2) * 180 / Math.PI - 90) + ")"
			+ "translate(" + (r1 - 50) + ")"
			+ (((d.startAngle + d.endAngle) / 2) > Math.PI ? "rotate(180)" : "");
		})
		.text(function(d) {
			return categories[d.index];
		});	
}