/** 与 public/samples/sample-batch-01-full-venue.json 中主键一致。 */
export const SAMPLE_REF = {
  merchantId: "M-VENUE-001",
  orderId: "ORD-20260418-001",
  orderIdSecond: "ORD-20260419-002",
  /** Has INTRODUCE chain from P-INTRO-3001 */
  consumerIdForIntroPath: "C-GUEST-50001",
  consumerIdOther: "C-GUEST-50002",
  settleId: "STL-M-VENUE-001-202604",
} as const;

export const SAMPLE_FILES = [
  {
    key: "batch01",
    title: "批次一 · 全量门店与关系",
    description: "商户、员工、合伙人、消费者、订单、结算及 7 类边（含 INVEST）",
    fileName: "sample-batch-01-full-venue.json",
  },
  {
    key: "batch02",
    title: "批次二 · 增量更新",
    description: "订单/消费者状态、新员工配置、追加订单与 GENERATE（需先导入批次一）",
    fileName: "sample-batch-02-order-and-life-cycle-delta.json",
  },
] as const;
