// Reference-only documentation (do not execute as a batch blindly).
// Node labels: Consumer, Merchant, Employee, Partner, Order, Settle
//
// Consumer core props: consumerId, boundMerchantId, boundEmployeeId, lifecycleState,
//   memberNo, periodStats (map), profile (map), createdAt, updatedAt
//
// Merchant: merchantId, name, settlementCycle, commissionRules (map), taxRules (map),
//   operatingStatus, compliance (map), createdAt, updatedAt
//
// Employee: employeeId, merchantId, title, level, commissionProfile (map),
//   settlementProfile (map), employmentStatus, profile (map), createdAt, updatedAt
//
// Partner: partnerId, partnerKind, merchantScope (list), commissionProfile (map),
//   settlementProfile (map), validFrom, validTo, profile (map), createdAt, updatedAt
//
// Order: orderId, merchantId, consumerId, distributableAmount, payStatus,
//   profitShareStatus, consumedAt, lineItems (map/list), createdAt, updatedAt
//
// Settle: settleId, principalId, merchantId, settlementCycle, amountBreakdown (map),
//   settleStatus, payoutProof (map), createdAt, updatedAt
//
// Edges (store canonical ids on relationships for constraint + auditing):
// INTRODUCE introducerId, introducedId, weight, tierRules (map), userStateRates (map),
//   rewardRules (map), validFrom, validTo
// BELONG_TO subjectId, targetId, bindKind, weight, fallbackRules (map), kpiWeight (map)
// EMPLOY merchantId, employeeId, weight, rank, hiredAt, payrollRules (map), taxRules (map)
// COOPERATE merchantId, partnerId, weight, coopKind, validFrom, validTo, tierRules (map)
// CONSUME consumerId, orderId, weight, consumedAt, verification (map)
// GENERATE settleId, orderId, weight, allocation (map), reconcileStatus
// INVEST investorId, investeeId, weight, investedAmount, period (map), dividendRules (map), exitRules (map)
