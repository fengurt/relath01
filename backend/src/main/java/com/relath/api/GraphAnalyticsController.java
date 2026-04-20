package com.relath.api;

import com.relath.graph.GraphAnalyticsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/public/graph")
public class GraphAnalyticsController {

    private final GraphAnalyticsService graphAnalyticsService;

    public GraphAnalyticsController(GraphAnalyticsService graphAnalyticsService) {
        this.graphAnalyticsService = graphAnalyticsService;
    }

    @GetMapping("/summary")
    public Map<String, Object> summary() {
        return graphAnalyticsService.coreLabelCounts();
    }

    @GetMapping("/orders/{orderId}")
    public Map<String, Object> orderSnapshot(@PathVariable String orderId) {
        return graphAnalyticsService.orderSnapshot(orderId);
    }

    @GetMapping("/consumers/{consumerId}/introducer-paths")
    public Map<String, Object> introducerPaths(
            @PathVariable String consumerId,
            @RequestParam(name = "maxDepth", required = false) Integer maxDepth,
            @RequestParam(name = "limit", required = false) Integer limit
    ) {
        return graphAnalyticsService.introduceUpstreamPaths(consumerId, maxDepth, limit);
    }
}
