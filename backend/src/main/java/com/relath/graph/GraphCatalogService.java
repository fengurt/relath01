package com.relath.graph;

import org.neo4j.driver.Driver;
import org.neo4j.driver.SessionConfig;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class GraphCatalogService {

    private final Driver neo4jDriver;

    public GraphCatalogService(Driver neo4jDriver) {
        this.neo4jDriver = neo4jDriver;
    }

    public Map<String, Object> ping() {
        Map<String, Object> body = new LinkedHashMap<>();
        try (var session = neo4jDriver.session(SessionConfig.defaultConfig())) {
            var result = session.run("RETURN 1 AS ok").single();
            body.put("neo4j", "reachable");
            body.put("ok", result.get("ok").asInt());
        } catch (Exception ex) {
            body.put("neo4j", "error");
            body.put("message", ex.getMessage());
        }
        return body;
    }
}
