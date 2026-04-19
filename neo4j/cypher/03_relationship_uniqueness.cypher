// Relationship uniqueness constraints require Neo4j 5.7+ and properties on each relationship instance.
// If migration fails, enforce pairs via MERGE patterns in the service layer instead.

CREATE CONSTRAINT introduce_pair_unique IF NOT EXISTS
FOR ()-[r:INTRODUCE]-() REQUIRE (r.introducerId, r.introducedId) IS UNIQUE;

CREATE CONSTRAINT belong_pair_unique IF NOT EXISTS
FOR ()-[r:BELONG_TO]-() REQUIRE (r.subjectId, r.targetId, r.bindKind) IS UNIQUE;

CREATE CONSTRAINT employ_pair_unique IF NOT EXISTS
FOR ()-[r:EMPLOY]-() REQUIRE (r.merchantId, r.employeeId) IS UNIQUE;

CREATE CONSTRAINT cooperate_pair_unique IF NOT EXISTS
FOR ()-[r:COOPERATE]-() REQUIRE (r.merchantId, r.partnerId) IS UNIQUE;

CREATE CONSTRAINT consume_pair_unique IF NOT EXISTS
FOR ()-[r:CONSUME]-() REQUIRE (r.consumerId, r.orderId) IS UNIQUE;

CREATE CONSTRAINT generate_pair_unique IF NOT EXISTS
FOR ()-[r:GENERATE]-() REQUIRE (r.settleId, r.orderId) IS UNIQUE;

CREATE CONSTRAINT invest_pair_unique IF NOT EXISTS
FOR ()-[r:INVEST]-() REQUIRE (r.investorId, r.investeeId) IS UNIQUE;
