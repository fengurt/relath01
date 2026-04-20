# relath01 — project knowledge base

This folder is the authoritative context for the **可计算商业关系图谱系统（Neo4j版）**.

## Non-negotiables

- **Computability first**: business rules live as graph properties, weights, and parameterized Cypher — no ad-hoc hardcoded commission logic in application code.
- **Security**: RBAC + row/tenant isolation; audit all mutations; never pass unsanitized user text into Cypher (use parameters + allowlists).
- **MCP / Skills**: MCP tools wrap bounded Neo4j operations; Skills are atomic plugins with explicit inputs/outputs and versioning.
- **Deployment**: single-host Docker Compose by default; internal services not exposed except 80/443 via Nginx.

## Repository layout

| Path | Role |
|------|------|
| `neo4j/cypher/` | Constraints, indexes, optional seeds |
| `backend/` | Spring Boot 3 API, Neo4j access, RBAC hooks; use **`./mvnw`** (no system Maven required) |
| `scripts/relath-test.sh` | Local `clean test` |
| `scripts/relath-clean-restart.sh` | Stop compose + kill dev ports + `mvn clean` |
| `mcp-server/` | MCP stdio server (Node) calling backend secured tools |
| `web/` | Admin UI: React 18 + Ant Design + G6 |
| `h5/` | Mobile: React 18 + react-vant (Vant-style) + ECharts |
| `docker/` | Nginx and auxiliary images |
| `docs/` | Design and operations notes |

## Graph vocabulary (labels)

`Consumer`, `Merchant`, `Employee`, `Partner`, `Order`, `Settle`

## Relationship types

`INTRODUCE`, `BELONG_TO`, `EMPLOY`, `COOPERATE`, `CONSUME`, `GENERATE`, `INVEST`
