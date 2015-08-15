package be.pvanhees.thesisapplicatie.datareader;

import java.io.File;
import java.io.InputStream;

import org.graphstream.graph.Graph;

public interface IDataReader {

	public Graph createGraphFrom(File file, String id);

	public Graph createGraphFrom(InputStream input, String graphId);
}
