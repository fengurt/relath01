# relath01 — 可计算商业关系图谱（Neo4j）

Monorepo scaffold aligned with `cursor_project_rules` and `implementation-plan.mdc`.

## Layout

- `neo4j/cypher` — constraints, indexes, relationship rules (see `00_graph_model_reference.cypher`)
- `backend` — Spring Boot 3 API (`/api/v1/public/*` bootstrap: health, graph ping, **graph summary / order snapshot / introducer paths**)
- `web` — React 18 + Ant Design + Vite (G6 wired next)
- `h5` — React 18 + react-vant + Vite (ECharts graph next)
- `mcp-server` — MCP stdio: `relath_health`, `relath_graph_summary` (HTTP to backend)
- `docker-compose.yml` — Neo4j, MySQL, Redis, backend

## Local prerequisites

- JDK 17+ and Maven 3.9+ **or** Docker with BuildKit for `backend/Dockerfile`
- Node.js 20+ for frontends and MCP

## Quick start (API + Neo4j)

```bash
cp config/env.example config/.env   # optional; compose defaults match README
docker compose up -d neo4j redis mysql
cd backend && mvn -q spring-boot:run
```

Apply schema (with `cypher-shell` installed, or `docker compose exec neo4j cypher-shell ...`):

```bash
./scripts/apply-neo4j-schema.sh
```

## Public graph API (dev; lock behind RBAC later)

| Method | Path |
|--------|------|
| GET | `/api/v1/public/graph/summary` |
| GET | `/api/v1/public/graph/orders/{orderId}` |
| GET | `/api/v1/public/graph/consumers/{consumerId}/introducer-paths?maxDepth=&limit=` |

## MCP (stdio)

```bash
cd mcp-server && npm install && RELATH_API_BASE=http://127.0.0.1:8080 node src/index.js
```

## Repository

https://github.com/fengurt/relath01
