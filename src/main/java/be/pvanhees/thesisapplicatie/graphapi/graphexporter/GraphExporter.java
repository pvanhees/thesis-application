package be.pvanhees.thesisapplicatie.graphapi.graphexporter;

import java.util.List;

import org.graphstream.graph.Graph;

public interface GraphExporter<T> {

	public T export(List<Graph> graphs);
}
