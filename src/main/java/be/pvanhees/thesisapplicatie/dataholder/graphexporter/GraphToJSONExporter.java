package be.pvanhees.thesisapplicatie.dataholder.graphexporter;

import java.util.Iterator;
import java.util.List;

import org.graphstream.graph.Edge;
import org.graphstream.graph.Element;
import org.graphstream.graph.Graph;
import org.graphstream.graph.Node;

public class GraphToJSONExporter implements GraphExporter<String>{

	@Override
	public String export(List<Graph> graphs) {
		StringBuilder json = new StringBuilder();
		json.append("{\"datasets\":[\n");
		for(int i = 0; i < graphs.size(); i++){
			Graph graph = graphs.get(i);
			json.append("\t{");
			json.append("\"id\":\"" + graph.getId() + "\",\n");
			json.append("\t\t\"dataproperties\":{");
			Iterator<String> properties =  graph.getAttributeKeyIterator();
			while(properties.hasNext()){
				String key = properties.next();
				if(key.equals("graphproperties")) continue;
				if(graph.getAttribute(key) instanceof Integer)
					json.append("\"" + key + "\":" + graph.getAttribute(key) + ""); 
				else
					json.append("\"" + key + "\":\"" + graph.getAttribute(key) + "\""); 
				if(properties.hasNext())
					json.append(",");
			}
			json.append("},\n");

			List<String> graphProperties = graph.getAttribute("graphproperties");
			json.append("\t\t\"graphproperties\":[");
			Iterator<String> graphIt = graphProperties.iterator();
			while(graphIt.hasNext()){
				json.append("\"" + graphIt.next() + "\""); 
				if(graphIt.hasNext())
					json.append(",");
			}
			json.append("],\n");

			// print all the nodes
			json.append("\t\t\"nodes\":[");
			Iterator<Node> nodeSet = graph.getNodeSet().iterator();
			while(nodeSet.hasNext()){
				Node n = nodeSet.next();
				json.append("\t\t\t{\"id\":\"" + n.getId() + "\", \"properties\":{");
				Iterator<String> it = n.getAttributeKeyIterator();
				// print all the attributes of one node
				exportProperties(json, n, it);

				if(nodeSet.hasNext())
					json.append("}},\n");
				else
					json.append("}}\n");
			}
			json.append("\t\t],");

			// print all the edges
			json.append("\t\t\"edges\":[");
			Iterator<Edge> edgeSet = graph.getEdgeSet().iterator();
			while(edgeSet.hasNext()){
				Edge e = edgeSet.next();
				json.append("\t\t\t{\"id\":\"" + e.getId() + "\", \"source\":\"" 
						+ e.getSourceNode().getId() + "\", \"target\":\"" + e.getTargetNode().getId() + "\", \"properties\":{");
				Iterator<String> it = e.getAttributeKeyIterator();
				// print all the attributes of one node
				exportProperties(json, e, it);

				if(edgeSet.hasNext())
					json.append("}},\n");
				else
					json.append("}}\n");
			}
			json.append("\t\t]");
			if(i >= (graphs.size() - 1))
				json.append("}]");
			else
				json.append("},");
		}
		json.append("}");

		return json.toString();
	}

	private void exportProperties(StringBuilder json, Element element, Iterator<String> iterator) {
		while(iterator.hasNext()){
			String key = iterator.next();
			if(element.getAttribute(key) instanceof Integer || element.getAttribute(key) instanceof Float || key.equals("sequenceIds")){
				json.append("\"" + key + "\":" + element.getAttribute(key) + ""); 
			}
			else
				json.append("\"" + key + "\":\"" + element.getAttribute(key) + "\""); 
			if(iterator.hasNext())
				json.append(",");
		}
	}


}
