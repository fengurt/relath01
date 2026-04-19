package com.relath.api;

import com.relath.graph.GraphCatalogService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/public")
public class GraphPingController {

    private final GraphCatalogService graphCatalogService;

    public GraphPingController(GraphCatalogService graphCatalogService) {
        this.graphCatalogService = graphCatalogService;
    }

    @GetMapping("/graph/ping")
    public Map<String, Object> ping() {
        return graphCatalogService.ping();
    }
}
