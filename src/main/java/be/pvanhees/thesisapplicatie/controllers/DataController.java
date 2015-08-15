package be.pvanhees.thesisapplicatie.controllers;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.graphstream.graph.Graph;

import com.sun.jersey.core.header.FormDataContentDisposition;
import com.sun.jersey.multipart.FormDataParam;

import be.pvanhees.thesisapplicatie.dataholder.graphexporter.GraphExporter;
import be.pvanhees.thesisapplicatie.dataholder.graphexporter.GraphToJSONExporter;
import be.pvanhees.thesisapplicatie.datareader.DataReader;
import be.pvanhees.thesisapplicatie.datareader.IDataReader;

@Path("graph/")
public class DataController {

	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Path("/defaultgraph")
	public String getDefaultGraph(){
		IDataReader builder = new DataReader();

		File panelB = new File("/tmp/panelb.txt");
		InputStream in = this.getClass().getClassLoader().getResourceAsStream("panel-b.txt");
		try {
			Files.copy(in, Paths.get(panelB.getAbsolutePath()));
		} catch (IOException e2) {
			e2.printStackTrace();
		}

		File panelC = new File("/tmp/panelc.txt");
		in = this.getClass().getClassLoader().getResourceAsStream("panel-c.txt");
		try {
			Files.copy(in, Paths.get(panelC.getAbsolutePath()));
		} catch (IOException e1) {
			e1.printStackTrace();
		}

		List<Graph> graphs = new ArrayList<>();
		graphs.add(builder.createGraphFrom(panelB,"0"));
		graphs.add(builder.createGraphFrom(panelC,"0"));
		GraphExporter<String> exporter = new GraphToJSONExporter();
		return exporter.export(graphs);
	}
	
	@POST
	@Consumes(MediaType.MULTIPART_FORM_DATA)
	@Produces(MediaType.APPLICATION_JSON)
	@Path("/singleupload")
	public String convertFastaFileToJSON(@FormDataParam("file") InputStream input, @FormDataParam("file") FormDataContentDisposition fileDetails){
		IDataReader reader = new DataReader();
		List<Graph> graphs = new ArrayList<>();
		graphs.add(reader.createGraphFrom(input, "0"));
		GraphExporter<String> exporter = new GraphToJSONExporter();
		return exporter.export(graphs);
	}

}
