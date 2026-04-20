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

- **JDK 17 or 21** (macOS: `brew install openjdk@17`, then add `$(brew --prefix openjdk@17)/bin` to `PATH`, or rely on `/usr/libexec/java_home`)
- **No global Maven required** — the repo includes **`backend/mvnw`** (Maven Wrapper)
- Node.js 20+ for frontends and MCP
- Docker optional for Neo4j/MySQL/Redis and production-like runs

## Scripts

**Do not use a fake path.** The repo root is wherever you cloned it (for example `~/cpro01/ksamint999/relath01` on your machine). In the terminal, `cd` to that folder first, or stay in `backend/` and use the right column below.

Paths like `./scripts/...` only work from the **repository root**, not from `backend/`. From **`backend/`**, use the wrappers in the second column:


| From repo root | From `backend/` | Purpose |
|------------------|-----------------|---------|
| `./scripts/relath-test.sh` | `./relath-test.sh` | `mvn clean test` via wrapper |
| `./scripts/relath-clean-restart.sh` | `./relath-clean-restart.sh` | `docker compose down`, kill **8080 / 5173 / 5174**, `mvn clean` |
| `RELATH_PRUNE_VOLUMES=1 ./scripts/relath-clean-restart.sh` | `RELATH_PRUNE_VOLUMES=1 ./relath-clean-restart.sh` | same + `docker compose down -v` |
| `./scripts/relath-run-backend.sh` | `./relath-run-backend.sh` | API on **:8080** |

## Quick start (API + Neo4j)

```bash
cp config/env.example config/.env   # optional; compose defaults match README
docker compose up -d neo4j redis mysql
./scripts/relath-run-backend.sh
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
