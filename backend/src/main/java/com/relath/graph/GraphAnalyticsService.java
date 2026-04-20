package com.relath.graph;

import com.relath.graph.cypher.CypherQueries;
import org.neo4j.driver.Driver;
import org.neo4j.driver.SessionConfig;
import org.neo4j.driver.Value;
import org.neo4j.driver.Values;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class GraphAnalyticsService {

    private static final int DEFAULT_CHAIN_LIMIT = 50;
    private static final int MAX_DEPTH_CAP = 20;

    private final Driver neo4jDriver;

    public GraphAnalyticsService(Driver neo4jDriver) {
        this.neo4jDriver = neo4jDriver;
    }

    public Map<String, Object> coreLabelCounts() {
        Map<String, Object> out = new LinkedHashMap<>();
        try (var session = neo4jDriver.session(SessionConfig.defaultConfig())) {
            var record = session.run(CypherQueries.COUNT_BY_CORE_LABELS).single();
            out.put("consumers", record.get("consumers").asLong());
            out.put("merchants", record.get("merchants").asLong());
            out.put("employees", record.get("employees").asLong());
            out.put("partners", record.get("partners").asLong());
            out.put("orders", record.get("orders").asLong());
            out.put("settles", record.get("settles").asLong());
            out.put("status", "ok");
        } catch (Exception ex) {
            out.put("status", "error");
            out.put("message", ex.getMessage());
        }
        return out;
    }

    public Map<String, Object> orderSnapshot(String orderId) {
        Map<String, Object> out = new LinkedHashMap<>();
        try (var session = neo4jDriver.session(SessionConfig.defaultConfig())) {
            var result = session.run(
                    CypherQueries.ORDER_DISTRIBUTABLE_SNAPSHOT,
                    Values.parameters("orderId", orderId)
            );
            if (!result.hasNext()) {
                out.put("found", false);
                return out;
            }
            var record = result.single();
            out.put("found", true);
            out.put("orderId", neoToJava(record.get("orderId")));
            out.put("merchantId", neoToJava(record.get("merchantId")));
            out.put("consumerId", neoToJava(record.get("consumerId")));
            out.put("distributableAmount", neoToJava(record.get("distributableAmount")));
            out.put("payStatus", neoToJava(record.get("payStatus")));
            out.put("profitShareStatus", neoToJava(record.get("profitShareStatus")));
        } catch (Exception ex) {
            out.put("status", "error");
            out.put("message", ex.getMessage());
        }
        return out;
    }

    public Map<String, Object> introduceUpstreamPaths(String consumerId, Integer maxDepth, Integer limit) {
        Map<String, Object> out = new LinkedHashMap<>();
        int depth = maxDepth == null ? 5 : Math.min(Math.max(1, maxDepth), MAX_DEPTH_CAP);
        int lim = limit == null ? DEFAULT_CHAIN_LIMIT : Math.min(Math.max(1, limit), 200);
        try (var session = neo4jDriver.session(SessionConfig.defaultConfig())) {
            var result = session.run(
                    CypherQueries.INTRODUCERS_FOR_CONSUMER,
                    Values.parameters("consumerId", consumerId, "maxDepth", depth, "limit", lim)
            );
            List<Map<String, Object>> paths = new ArrayList<>();
            while (result.hasNext()) {
                var record = result.next();
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("nodes", record.get("nodes").asList(v -> v.asMap()));
                row.put("relationshipTypes", record.get("relationshipTypes").asList(org.neo4j.driver.Value::asString));
                paths.add(row);
            }
            out.put("paths", paths);
            out.put("status", "ok");
        } catch (Exception ex) {
            out.put("status", "error");
            out.put("message", ex.getMessage());
        }
        return out;
    }

    private static Object neoToJava(Value value) {
        return value.isNull() ? null : value.asObject();
    }
}
