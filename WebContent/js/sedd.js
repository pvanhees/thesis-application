var cutoff,
	graphs,
	maxNodeHeight,
	nodeWidth,
	seddSize,
	groups,
	offset;

function drawSedd(graphs,cutoff){
	this.graphs = graphs;
	//make sure the graphs have the right properties
	for(i = 0; i < graphs.length; i++){
		if (graphs[i].hasGraphProperties(["weighted", "directed"])) {
			d3.select("body").append("p").html("The selected data is not fit for this visualisation");
			return false;
		}
	}

	maxNodeHeight = 50;
	nodeWidth = 10;
	var margin = {top: 1, right: 1, bottom: 6, left: 1},
		categoryWidth = 25,
		groupWidth = 80,
		separatorHeight = 10,
		width = 1500 - margin.left - margin.right,
		height = 500 - margin.top - margin.bottom,
		colors = ["#EC008C","#00AEEF"];


	var formatNumber = d3.format(",.0f"),
	format = function(d) { return formatNumber(d) + " TWh"; };
	//color = d3.scale.category20();

	var svg = d3.select("#visualisations").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var categories = ["A","G","I","L","V","C","M","S","T","P","F","W","Y","H","K","R","D","E","N","Q",".","X"];
	var groups = [];
	groups.push(["A","G","I","L","V"]);
	groups.push(["C","M","S","T"]);
	groups.push(["P"]);
	groups.push(["F","W","Y"]);
	groups.push(["H","K","R"]);
	groups.push(["D","E","N","Q"]);
	groups.push(["."]);
	groups.push(["X"]);

	var groupNames = d3.map();
	groupNames.set(0,"aliphatic");
	groupNames.set(1,"OH or Sulfur");
	groupNames.set(2,"cyclic");
	groupNames.set(3,"aromatic");
	groupNames.set(4,"basic");
	groupNames.set(5,"acidic");
	groupNames.set(6,"blank");
	groupNames.set(7,"unknown");

	seddSize = [width - groupWidth - categoryWidth , height];
	categoryYPositions = computeYPositions(categories, maxNodeHeight, groups, seddSize);
	maxWeight = calculateMaxWeight();


	var cutoffWeight = calculateCutoffWeight(cutoff);

	// append gray rectangle for background
	svg.append("g").append("rect")
	.attr("height", height)
	.attr("width",width)
	.attr("transform","translate(" + groupWidth + ")")
	.style("stroke", "gray")
	.style("opacity", "0.1");

	// draw white rectangles as separator for groups
	svg.append("g").selectAll(".separator")
		.data(groups)
		.enter().append("g")
		.attr("transform", function (d) {
			lastCat = d[d.length-1];
			y = maxNodeHeight + categoryYPositions.get(lastCat);
			return "translate(0," + y + ")";
		})
		.append("rect")
		.attr("height", separatorHeight)
		.attr("width" , width)
		.style("stroke", "white")
		.style("fill" , "white")
	
	//draw categories
	svg.append("g").selectAll(".category")
		.data(categories)
		.enter()
		.append("text")
		.attr("x", groupWidth + 4)
		.attr("y", function(c) {return categoryYPositions.get(c) + 5;})
		.attr("font-size","10px")
		.attr("text-anchor", "start")
		.text(function(c) {return c;});

	//draw groupnames
	svg.append("g").selectAll(".group")
		.data(groupNames.keys())
		.enter()
		.append("text")
		.attr("x", groupWidth - 3)
		.attr("y", function(c) {
			var firstCat = groups[c][0];
			return categoryYPositions.get(firstCat) + 5;
		})
		.attr("font-size","10px")
		.attr("text-anchor", "end")
		.text(function(c) {return groupNames.get(c);});

	for(i = 0; i < graphs.length; i++){
		graph = graphs[i];
		var path = createEdgePathCalculator(graph);

		var link = svg.append("g")
			.attr("transform","translate(" + (categoryWidth + groupWidth) + ")")
			.selectAll(".link" + graph.getId())
			.data(graph.getEdges().filter(function (e) { return graph.getEdgeProperty(e.id, "weight") > cutoffWeight}))
			.enter().append("path")
			.attr("class", "link")
			.attr("d", path)
			.style("stroke-width", function(e) { return weightScale(graph.getEdgeProperty(e.id, "sequenceIds").length, graph) })
			.style("stroke", function(e) {
				var group=graph.getEdgeProperty(e.id,"group");
				return d3.rgb(colors[group])
			;})
			.style("opacity", "0.7")
			.style("cursor","pointer")
			.on("mouseenter", function(e) {selectSequence(e, graph);})
			.on("mouseleave", function (e) { redrawWithCutoff(cutoff, graph);});


		var node = svg.append("g")
			.attr("transform","translate(" + (categoryWidth + groupWidth) + ")")
			.selectAll(".node" + graph.getId())
			.data(graph.getNodes().filter(function (n) { return graph.getNodeProperty(n.id, "weight") > cutoffWeight}))
			.enter().append("g")
			.attr("class", "node")
			.attr("transform", function(n) { 
				var nodeY = categoryYPositions.get(graph.getNodeProperty(n.id, "category"))
				- (graph.getNodeProperty(n.id, "weight") / 2);
				var nodeX = xScale(graph.getNodeProperty(n.id, "x"));
				return "translate(" + nodeX + "," + nodeY + ")"; 
			});

		node.append("rect")
			.attr("height", function(n) { return graph.getNodeProperty(n.id, "weight") * 2; })
			.attr("width", function(n) { return nodeWidth}) 
			.style("stroke", function(n) { return d3.rgb(colors[graph.getNodeProperty(n.id, "group")]);})
			.style("fill", function(n) { return d3.rgb(colors[graph.getNodeProperty(n.id, "group")]);})
			.style("opacity", "0.7")
			.append("title")
			.text(function(n) { return n.id + "\n" + format(graph.getNodeProperty(n.id, "weight")); });
	}
}

function selectSequence(d, graph){
	d3.selectAll(".link" + graph.getId())
		.data(graph.getEdges())
		.style("stroke-width", function(e) { 
			var scale = d3.scale.linear().rangeRound([0,maxNodeHeight * 2]).domain([0,graph.getDataProperties().datasize]);
			var amount = scale(sequenceContainsSequences(e,d, graph));
//			var value = weightScale(amount, graph);
			return amount ; 
		});
}

function sequenceContainsSequences(edge, selectedEdge, graph){
	if(graph.getEdgeProperty(edge.id, "group") != graph.getEdgeProperty(selectedEdge.id, "group") ){ 
		return 0;
	}
	var amount = 0;
	var selectedSequences = graph.getEdgeProperty(selectedEdge.id, "sequenceIds");
	var selectedLength = selectedSequences.length;
	var otherSequences = graph.getEdgeproperty(edge, "sequenceIds");

	for(var j = 0; j < otherSequences.length; j++){
		for(var i = 0; i < selectedLength; i++){
			if(otherSequences[j] === selectedSequences[i]){
				amount++;
			}
		}
	}
	return amount;
}

function weightScale(e, graph){
	scale = d3.scale.linear().rangeRound([0.1,maxNodeHeight]).domain([0,graph.getDataProperties().datasize]);
	return scale(e);
}

function xScale(d){
	var scale = d3.scale.linear().rangeRound([1,seddSize[0] - nodeWidth]).domain([0,35]);
	return scale(d);
}

function redrawWithCutoff(cutoff, graph) {
	this.cutoff = cutoff;
	var cutoffWeight = calculateCutoffWeight(cutoff);
	d3.selectAll(".link" + graph.getId())
	.data(graph.edges)
	.style("opacity", function (e) {return e.properties.weight > cutoffWeight ? "0.7" : "0";})
	.style("stroke-width", function(e) { return e.dy; });

	d3.selectAll(".node" + graph.getId())
	.data(graph.nodes)
	.style("opacity", function (e) {return e.properties.weight > cutoffWeight ? "0.7" : "0";});
}

function calculateCutoffWeight(cutoff){
	var cutoffScaler = d3.scale.linear().range([0,maxWeight]).domain([0,1]);
	return cutoffScaler(cutoff);
}

function computeYPositions(categories, maxNodeHeight, groups, seddSize){
	yPositions = d3.map();
	var offset = 10
	var drawingHeight = seddSize[1] - groups.length * offset;
	var scale = d3.scale.linear().rangeRound([10,drawingHeight]).domain([0,categories.length]);

	categories.forEach(function (cat) {
		var baseValue = scale(categories.indexOf(cat));
		var groupNb = 0;
		for (i = 0; i < groups.length; i++) {
			if (groups[i].indexOf(cat) !== -1){
				groupNb = i;
			}
		}
		var value = (baseValue + (groupNb * offset));
		yPositions.set(cat, value);

	});
	return yPositions;
}

function calculateMaxWeight(){
	maxWeight = 0;
	for(i = 0; i < graphs.length; i++){
		nodes = graphs[i].getNodes();
		nodes.forEach( function (node) {
			var nodeWeight=graphs[i].getNodeProperty(node.id, "weight");
			if(nodeWeight > maxWeight){
				maxWeight = nodeWeight;
			}
		});
	}
	return maxWeight;
}

function createEdgePathCalculator(graph) {
	function link(edge) {
		var source = edge.source;
		var target = edge.target;
		var srcHeight = graph.getNodeProperty(source, "weight");
		var destHeight = graph.getNodeProperty(target, "weight");
		var sourceY = categoryYPositions.get(graph.getNodeProperty(source, "category"));
		var destY = categoryYPositions.get(graph.getNodeProperty(target, "category"));

		var x0 = xScale(graph.getNodeProperty(source, "x")) + nodeWidth;
		var x1 = xScale(graph.getNodeProperty(target, "x"));
		var y0 = sourceY + srcHeight /2;
		var y1 = destY + destHeight /2;

		return "M" + x0 + "," + y0
		+ "L" + x1 + "," + y1
	}
	return link;
}
