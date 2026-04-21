export type HealthResponse = {
  status: string;
  service?: string;
};

export type GraphPingResponse = {
  neo4j: string;
  ok?: number;
  message?: string;
};

export type GraphSummaryResponse = {
  status?: string;
  consumers?: number;
  merchants?: number;
  employees?: number;
  partners?: number;
  orders?: number;
  settles?: number;
  message?: string;
};

export type OrderSnapshotResponse = {
  found?: boolean;
  status?: string;
  orderId?: unknown;
  merchantId?: unknown;
  consumerId?: unknown;
  distributableAmount?: unknown;
  payStatus?: unknown;
  profitShareStatus?: unknown;
  message?: string;
};

export type IntroPathRow = {
  nodes: Array<{ labels?: unknown; id?: unknown }>;
  relationshipTypes: string[];
};

export type IntroPathsResponse = {
  status?: string;
  paths?: IntroPathRow[];
  message?: string;
};

export type BatchIngestResponse = {
  status?: string;
  nodesImported?: number;
  relationshipsImported?: number;
  message?: string;
  errors?: string[];
};
