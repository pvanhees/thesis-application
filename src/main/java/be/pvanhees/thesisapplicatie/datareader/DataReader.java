package be.pvanhees.thesisapplicatie.datareader;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.graphstream.graph.Edge;
import org.graphstream.graph.Graph;
import org.graphstream.graph.Node;
import org.graphstream.graph.implementations.AdjacencyListGraph;

public class DataReader implements IDataReader{

	@Override
	public Graph createGraphFrom(File file, String graphId) {
		List<String> lines = fileToLines(file);
		return createGraphFromLines(graphId, lines);
	}
	
	@Override
	public Graph createGraphFrom(InputStream input, String graphId){
		List<String> lines = inputStreamToLines(input);
		return createGraphFromLines(graphId, lines);
	}

	@SuppressWarnings("unchecked")
	private AdjacencyListGraph createGraphFromLines(String graphId, List<String> lines) {
		Map<String, Integer> sequenceIds = new HashMap<>();
		int newestId = 0;

		AdjacencyListGraph graph = new AdjacencyListGraph(graphId);
		graph.addAttribute("datasize", lines.size());
		List<String> graphTypes = new ArrayList<>();
		graphTypes.add("weighted");
		graphTypes.add("directed");
		graph.addAttribute("graphproperties", graphTypes);
		for(String line : lines){

			if(!sequenceIds.containsKey(line)){
				sequenceIds.put(line, newestId++);
			}

			Node prevN = null;
			for(int j = 0; j < line.length(); j++){
				String id = graphId + "-" + j + "" + line.charAt(j);
				Node n = graph.getNode(id);
				if(n == null){
					n = graph.addNode(id);
					n.addAttribute("weight", 1);
					n.addAttribute("category", line.charAt(j));
					n.addAttribute("x", j);
					n.addAttribute("group", graphId);
					//				} else n.setAttribute("weight", (int)n.getAttribute("weight") + 1);
				}
				Edge e = null;
				if(prevN != null){
					id = graphId + "-" + prevN.getId() + j + "" + line.charAt(j) + "";
					e = graph.getEdge(id);
					if(e == null){
						e = graph.addEdge(id, prevN, n, true);
						e.addAttribute("direction", "right");
						ArrayList<String> sequences = new ArrayList<String>();
						sequences.add(line);
						e.addAttribute("sequences", sequences );
						e.addAttribute("group", graphId);
						//					} else e.setAttribute("weight", (int)e.getAttribute("weight") + 1);
					} else {
						List<String> sequences = (List<String>) e.getAttribute("sequences");
						sequences.add(line);
						e.setAttribute("sequences", sequences);
					}
				}
				prevN = n;
			}
		}

		for(Edge e : graph.getEdgeSet()){
			List<String> sequences = (List<String>)e.getAttribute("sequences");
			Set<Integer> seqIds = new HashSet<>();
			for(String sequence : sequences){
				seqIds.add(sequenceIds.get(sequence));
			}
			e.addAttribute("sequenceIds", seqIds);

			float weight = (float)sequences.size() / (float)lines.size();
			//System.out.println(weight);
			e.addAttribute("weight", new Float(weight * (float)10));
			e.removeAttribute("sequences");
		}

		for(Node n : graph.getNodeSet()){
			Edge biggestEdge = null;
			for(Edge e : n.getEdgeSet()){
				if(biggestEdge == null)
					biggestEdge = e;
				else if((float)biggestEdge.getAttribute("weight") < (float)e.getAttribute("weight"))
					biggestEdge = e;
			}
			if(biggestEdge != null)
				n.addAttribute("weight", biggestEdge.getAttribute("weight"));
			else
				n.addAttribute("weight", 1);
		}
		return graph;
	}

	private List<String> fileToLines(File file) {
		List<String> lines = new ArrayList<>();
		BufferedReader reader = null;
		try {
			reader = new BufferedReader(new FileReader(file));
			for(String line = reader.readLine();line != null; line = reader.readLine()){
				lines.add(line);
			}
		} catch (IOException e) {
			e.printStackTrace();
		} finally{
			try {
				reader.close();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
		return lines;
	}

	private List<String> inputStreamToLines(InputStream input) {
		List<String> lines = new ArrayList<>();
		BufferedReader reader = null;
		try {
			reader = new BufferedReader(new InputStreamReader(input));
			for(String line = reader.readLine();line != null; line = reader.readLine()){
				lines.add(line);
			}
		} catch (IOException e) {
			e.printStackTrace();
		} finally{
			try {
				reader.close();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
		return lines;
	}
}
