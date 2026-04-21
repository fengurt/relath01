package com.relath.graph.ingest;

import org.neo4j.driver.Driver;
import org.neo4j.driver.SessionConfig;
import org.neo4j.driver.TransactionContext;
import org.neo4j.driver.Values;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Ingests the JSON batch format from {@code data/samples/} (allowlisted labels/rel types only).
 */
@Service
public class GraphBatchIngestService {

    public static final Set<String> NODE_LABELS = Set.of(
            "Merchant", "Employee", "Partner", "Consumer", "Order", "Settle"
    );

    public static final Set<String> RELATIONSHIP_TYPES = Set.of(
            "INTRODUCE", "BELONG_TO", "EMPLOY", "COOPERATE", "CONSUME", "GENERATE", "INVEST"
    );

    private static final Map<String, String> ID_FIELD = Map.of(
            "Merchant", "merchantId",
            "Employee", "employeeId",
            "Partner", "partnerId",
            "Consumer", "consumerId",
            "Order", "orderId",
            "Settle", "settleId"
    );

    private final Driver neo4jDriver;

    public GraphBatchIngestService(Driver neo4jDriver) {
        this.neo4jDriver = neo4jDriver;
    }

    public Map<String, Object> ingestBatch(Map<String, Object> body) {
        List<String> errors = new ArrayList<>();
        int[] nodeUpserts = {0};
        int[] relUpserts = {0};

        Map<String, Object> nodesPayload = body == null ? Map.of() : castMap(body.get("nodes"));
        List<Map<String, Object>> relPayload = extractRelationships(body);

        try (var session = neo4jDriver.session(SessionConfig.defaultConfig())) {
            session.executeWrite(tx -> {
                nodesPayload.forEach((labelRaw, rowsObj) -> {
                    try {
                        String label = verifyLabel(labelRaw);
                        List<Map<String, Object>> rows = castList(rowsObj);
                        String idField = ID_FIELD.get(label);
                        for (Map<String, Object> row : rows) {
                            if (row == null || row.isEmpty()) {
                                continue;
                            }
                            Object id = row.get(idField);
                            if (id == null) {
                                errors.add("Missing " + idField + " on label " + label);
                                continue;
                            }
                            String cypher = "MERGE (n:`" + label + "` {`"
                                    + idField + "`: $id}) SET n += $props";
                            tx.run(cypher, Values.parameters("id", id, "props", row));
                            nodeUpserts[0]++;
                        }
                    } catch (IllegalArgumentException ex) {
                        errors.add(ex.getMessage());
                    }
                });

                for (Map<String, Object> rel : relPayload) {
                    try {
                        ingestOneRelationship(tx, rel);
                        relUpserts[0]++;
                    } catch (IllegalArgumentException ex) {
                        errors.add(ex.getMessage());
                    }
                }
                return null;
            });
        } catch (Exception ex) {
            Map<String, Object> outErr = new LinkedHashMap<>();
            outErr.put("status", "error");
            outErr.put("message", ex.getMessage());
            outErr.put("errors", errors);
            outErr.put("nodesImported", 0);
            outErr.put("relationshipsImported", 0);
            return outErr;
        }

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("status", errors.isEmpty() ? "ok" : "partial");
        out.put("nodesImported", nodeUpserts[0]);
        out.put("relationshipsImported", relUpserts[0]);
        out.put("errors", errors);
        return out;
    }

    private static List<Map<String, Object>> extractRelationships(Map<String, Object> body) {
        if (body == null || body.get("relationships") == null) {
            return List.of();
        }
        Object raw = body.get("relationships");
        if (!(raw instanceof List<?> list)) {
            return List.of();
        }
        List<Map<String, Object>> out = new ArrayList<>();
        for (Object item : list) {
            if (item instanceof Map<?, ?> map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> cast = (Map<String, Object>) map;
                out.add(cast);
            }
        }
        return out;
    }

    private static void ingestOneRelationship(TransactionContext tx, Map<String, Object> rel) {
        Object typeRaw = rel.get("type");
        String type = typeRaw == null ? "" : String.valueOf(typeRaw).trim();
        if (!RELATIONSHIP_TYPES.contains(type)) {
            throw new IllegalArgumentException("relationship type not allowlisted: " + type);
        }

        Map<String, Object> source = castMap(rel.get("source"));
        Map<String, Object> target = castMap(rel.get("target"));
        Map<String, Object> props = castMap(rel.get("properties"));

        String sl = verifyLabel(String.valueOf(source.get("label")));
        String sk = String.valueOf(source.get("key"));
        Object sv = source.get("value");
        String tl = verifyLabel(String.valueOf(target.get("label")));
        String tk = String.valueOf(target.get("key"));
        Object tv = target.get("value");

        if (sv == null || tv == null) {
            throw new IllegalArgumentException("relationship endpoint value missing for type " + type);
        }

        String cypher = "MATCH (a:`" + sl + "` {`" + sk + "`: $sid}) "
                + "MATCH (b:`" + tl + "` {`" + tk + "`: $tid}) "
                + "MERGE (a)-[r:`" + type + "`]->(b) "
                + "SET r += $props";
        tx.run(cypher, Values.parameters("sid", sv, "tid", tv, "props", props == null ? Map.of() : props));
    }

    private static String verifyLabel(String label) {
        if (label == null || label.isBlank() || "null".equals(label)) {
            throw new IllegalArgumentException("label missing or invalid");
        }
        String trimmed = label.trim();
        if (!NODE_LABELS.contains(trimmed)) {
            throw new IllegalArgumentException("label not allowlisted: " + trimmed);
        }
        return trimmed;
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> castMap(Object o) {
        if (o instanceof Map<?, ?> map) {
            return (Map<String, Object>) map;
        }
        return new LinkedHashMap<>();
    }

    @SuppressWarnings("unchecked")
    private static List<Map<String, Object>> castList(Object o) {
        if (!(o instanceof List<?> list)) {
            return List.of();
        }
        List<Map<String, Object>> out = new ArrayList<>();
        for (Object item : list) {
            if (item instanceof Map<?, ?> map) {
                out.add((Map<String, Object>) map);
            }
        }
        return out;
    }
}
