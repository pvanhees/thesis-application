class @JsonGraph 
  nodes = [] 
  edges = []
  edgeObjects = []
  nodeProperties = {}
  edgeProperties = {}
  
  constructor: (@json) ->
    for edge in @json.edges
      edges.push({"id":edge.id, "source": edge.source, "target": edge.target})
      edgeProperties[edge.id] = edge.properties
    for node in @json.nodes
      nodes.push({"id":node.id})
      nodeProperties[node.id] = node.properties
  
  getId: ->
  	@json.id
  
  hasGraphProperties: (properties...) ->
  	hasAllProperties = true
  	for property in properties
  		index = @json.graphproperties.indexOf property
  		hasAllProperties = false if index is -1
  	hasAllProperties
  
  #returns the data properties
  getDataProperties: ->
    @json.dataproperties

  #checks if the given properties are present
  hasNodeProperties: (properties...) ->
  	hasAllProperties = true;
  	for property in properties
  		hasAllProperties = nodeProperties[nodes[0].id].hasOwnProperty property
  	hasAllProperties

  #checks if the given properties are present
  hasNodeProperties: (properties...) ->
  	hasAllProperties = true;
  	for property in properties
  		hasAllProperties = edgeProperties[edges[0].id].hasOwnProperty property
  	hasAllProperties

  #returns list of node objects of format: {id}
  getNodes: -> 
    nodes  
    
  #returns list of edge objects of format: {id, source, target}
  getEdges: ->
    edges

  #returns the properties of the node with id 'key' 
  getNodeProperties: (key) ->
    nodeProperties[key]

  #returns the property 'property' of the node with id 'key'
  getNodeProperty: (key, property) ->
    nodeProperties[key][property]

  #returns the properties of the edge with id 'key' 
  getEdgeProperties: (key) ->
    edgeProperties[key]

  #returns the property 'property' of the edge with id 'key'
  getEdgeProperty: (key, property) ->
    edgeProperties[key][property]

  #returns the graph as a matrix representation.
  #the indices of the matrix are the indices of the nodes in 
  # the list of nodes in this graph class.
  asMatrix: (valueProperty="PropertyEdgeAmount") ->
    matrix = []
    for nodeR in @json.nodes
      row = []
      for nodeC in @json.nodes
        amount = 0
        for edge in @json.edges
          if (edge.source is nodeR.id and edge.target is nodeC.id) or 
             (edge.source is nodeC.id and edge.target is nodeR.id)
              
              if valueProperty is "PropertyEdgeAmount"
                amount++
              else
                amount = edge.properties[valueProperty]
        row.push(amount)
      matrix.push(row)
    matrix
              
  asJson: -> 
    @json