// Supporting indexes for hot filters (add more after profiling).

CREATE INDEX consumer_merchant IF NOT EXISTS FOR (n:Consumer) ON (n.boundMerchantId);
CREATE INDEX consumer_sales IF NOT EXISTS FOR (n:Consumer) ON (n.boundEmployeeId);
CREATE INDEX order_merchant IF NOT EXISTS FOR (n:Order) ON (n.merchantId);
CREATE INDEX order_consumer IF NOT EXISTS FOR (n:Order) ON (n.consumerId);
CREATE INDEX order_time IF NOT EXISTS FOR (n:Order) ON (n.consumedAt);
CREATE INDEX settle_merchant_cycle IF NOT EXISTS FOR (n:Settle) ON (n.merchantId, n.settlementCycle);
