package com.relath.api;

import com.relath.graph.ingest.GraphBatchIngestService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/public/graph")
public class GraphBatchIngestController {

    private final GraphBatchIngestService graphBatchIngestService;

    public GraphBatchIngestController(GraphBatchIngestService graphBatchIngestService) {
        this.graphBatchIngestService = graphBatchIngestService;
    }

    /**
     * Applies a batch JSON payload (same shape as {@code data/samples/*.json}). Intended for local/dev seeding — protect in production.
     */
    @PostMapping("/batch-ingest")
    public Map<String, Object> batchIngest(@RequestBody Map<String, Object> body) {
        return graphBatchIngestService.ingestBatch(body);
    }
}
