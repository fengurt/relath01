package com.relath.graph.cypher;

/**
 * Parameterized Cypher only — callers must pass maps, never concatenate user text into queries.
 */
public final class CypherQueries {

    private CypherQueries() {
    }

    public static final String COUNT_BY_CORE_LABELS = """
            OPTIONAL MATCH (c:Consumer)
            WITH count(c) AS consumers
            OPTIONAL MATCH (m:Merchant)
            WITH consumers, count(m) AS merchants
            OPTIONAL MATCH (e:Employee)
            WITH consumers, merchants, count(e) AS employees
            OPTIONAL MATCH (p:Partner)
            WITH consumers, merchants, employees, count(p) AS partners
            OPTIONAL MATCH (o:Order)
            WITH consumers, merchants, employees, partners, count(o) AS orders
            OPTIONAL MATCH (s:Settle)
            RETURN consumers, merchants, employees, partners, orders, count(s) AS settles
            """;

    /**
     * Upstream introducers for a consumer: (introducer)-[:INTRODUCE]->(consumer).
     * Pattern uses a fixed upper bound; {@code $maxDepth} filters with {@code length(path)}.
     */
    public static final String INTRODUCERS_FOR_CONSUMER = """
            MATCH (consumer:Consumer {consumerId: $consumerId})
            MATCH path = (introducer)-[:INTRODUCE*1..20]->(consumer)
            WHERE length(path) <= $maxDepth
            WITH path
            ORDER BY length(path) ASC
            LIMIT $limit
            RETURN [n IN nodes(path) | {labels: labels(n), id: coalesce(n.consumerId, n.partnerId, n.merchantId, n.employeeId, n.orderId, n.settleId)}] AS nodes,
                   [r IN relationships(path) | type(r)] AS relationshipTypes
            """;

    /**
     * Pre-compute distributable pool for an order (placeholder for full commission engine).
     */
    public static final String ORDER_DISTRIBUTABLE_SNAPSHOT = """
            MATCH (o:Order {orderId: $orderId})
            RETURN o.orderId AS orderId,
                   o.merchantId AS merchantId,
                   o.consumerId AS consumerId,
                   o.distributableAmount AS distributableAmount,
                   o.payStatus AS payStatus,
                   o.profitShareStatus AS profitShareStatus
            """;

}
