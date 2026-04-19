// Examples for idempotent writes — parameterize in application code.

// MERGE (m:Merchant {merchantId: $merchantId})
// ON CREATE SET m.createdAt = datetime()
// SET m += $merchantProps

// MATCH (a:Partner {partnerId: $introducerId}), (b:Consumer {consumerId: $introducedId})
// MERGE (a)-[r:INTRODUCE]->(b)
// ON CREATE SET r.introducerId = $introducerId, r.introducedId = $introducedId, r.weight = $weight
// SET r += $introduceProps
