// Generated by CoffeeScript 1.9.3
(function() {
  var slice = [].slice;

  this.JsonGraph = (function() {
    var edgeObjects, edgeProperties, edges, nodeProperties, nodes;

    nodes = [];

    edges = [];

    edgeObjects = [];

    nodeProperties = {};

    edgeProperties = {};

    function JsonGraph(json) {
      var edge, i, j, len, len1, node, ref, ref1;
      this.json = json;
      ref = this.json.edges;
      for (i = 0, len = ref.length; i < len; i++) {
        edge = ref[i];
        edges.push({
          "id": edge.id,
          "source": edge.source,
          "target": edge.target
        });
        edgeProperties[edge.id] = edge.properties;
      }
      ref1 = this.json.nodes;
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        node = ref1[j];
        nodes.push({
          "id": node.id
        });
        nodeProperties[node.id] = node.properties;
      }
    }

    JsonGraph.prototype.getId = function() {
      return this.json.id;
    };

    JsonGraph.prototype.hasGraphProperties = function() {
      var hasAllProperties, i, index, len, properties, property;
      properties = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      hasAllProperties = true;
      for (i = 0, len = properties.length; i < len; i++) {
        property = properties[i];
        index = this.json.graphproperties.indexOf(property);
        if (index === -1) {
          hasAllProperties = false;
        }
        if (hasAllProperties === false) {
          return false;
        }
      }
      return hasAllProperties;
    };

    JsonGraph.prototype.getDataProperties = function() {
      return this.json.dataproperties;
    };

    JsonGraph.prototype.hasNodeProperties = function() {
      var hasAllProperties, i, len, properties, property;
      properties = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      hasAllProperties = true;
      for (i = 0, len = properties.length; i < len; i++) {
        property = properties[i];
        hasAllProperties = nodeProperties[nodes[0].id].hasOwnProperty(property);
        if (hasAllProperties === false) {
          return false;
        }
      }
      return hasAllProperties;
    };

    JsonGraph.prototype.hasEdgeProperties = function() {
      var hasAllProperties, i, len, properties, property;
      properties = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      hasAllProperties = true;
      for (i = 0, len = properties.length; i < len; i++) {
        property = properties[i];
        hasAllProperties = edgeProperties[edges[0].id].hasOwnProperty(property);
        if (hasAllProperties === false) {
          return false;
        }
      }
      return hasAllProperties;
    };

    JsonGraph.prototype.getNodes = function() {
      return nodes;
    };

    JsonGraph.prototype.getEdges = function() {
      return edges;
    };

    JsonGraph.prototype.getNodeProperties = function(key) {
      return nodeProperties[key];
    };

    JsonGraph.prototype.getNodeProperty = function(key, property) {
      return nodeProperties[key][property];
    };

    JsonGraph.prototype.getEdgeProperties = function(key) {
      return edgeProperties[key];
    };

    JsonGraph.prototype.getEdgeProperty = function(key, property) {
      return edgeProperties[key][property];
    };

    JsonGraph.prototype.asMatrix = function(valueProperty) {
      var amount, edge, i, j, k, len, len1, len2, matrix, nodeC, nodeR, ref, ref1, ref2, row;
      if (valueProperty == null) {
        valueProperty = "PropertyEdgeAmount";
      }
      matrix = [];
      ref = this.json.nodes;
      for (i = 0, len = ref.length; i < len; i++) {
        nodeR = ref[i];
        row = [];
        ref1 = this.json.nodes;
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          nodeC = ref1[j];
          amount = 0;
          ref2 = this.json.edges;
          for (k = 0, len2 = ref2.length; k < len2; k++) {
            edge = ref2[k];
            if ((edge.source === nodeR.id && edge.target === nodeC.id) || (edge.source === nodeC.id && edge.target === nodeR.id)) {
              if (valueProperty === "PropertyEdgeAmount") {
                amount++;
              } else {
                amount = edge.properties[valueProperty];
              }
            }
          }
          row.push(amount);
        }
        matrix.push(row);
      }
      return matrix;
    };

    JsonGraph.prototype.asJson = function() {
      return this.json;
    };

    return JsonGraph;

  })();

}).call(this);
