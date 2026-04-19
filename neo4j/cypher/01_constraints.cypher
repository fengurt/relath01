// relath01 — uniqueness constraints (Neo4j 5.x)
// Run after database is empty or use IF NOT EXISTS patterns per deployment policy.

CREATE CONSTRAINT consumer_id_unique IF NOT EXISTS
FOR (n:Consumer) REQUIRE n.consumerId IS UNIQUE;

CREATE CONSTRAINT merchant_id_unique IF NOT EXISTS
FOR (n:Merchant) REQUIRE n.merchantId IS UNIQUE;

CREATE CONSTRAINT employee_id_unique IF NOT EXISTS
FOR (n:Employee) REQUIRE n.employeeId IS UNIQUE;

CREATE CONSTRAINT partner_id_unique IF NOT EXISTS
FOR (n:Partner) REQUIRE n.partnerId IS UNIQUE;

CREATE CONSTRAINT order_id_unique IF NOT EXISTS
FOR (n:Order) REQUIRE n.orderId IS UNIQUE;

CREATE CONSTRAINT settle_id_unique IF NOT EXISTS
FOR (n:Settle) REQUIRE n.settleId IS UNIQUE;
