#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NEO4J_URI="${NEO4J_URI:-bolt://localhost:7687}"
NEO4J_USER="${NEO4J_USER:-neo4j}"
NEO4J_PASSWORD="${NEO4J_PASSWORD:-relath_dev_password}"

if ! command -v cypher-shell >/dev/null 2>&1; then
  echo "cypher-shell not found. Run from Neo4j container, e.g.:"
  echo "  docker compose exec neo4j cypher-shell -u ${NEO4J_USER} -p \"\$NEO4J_PASSWORD\" < neo4j/cypher/01_constraints.cypher"
  exit 1
fi

for f in 01_constraints.cypher 02_indexes.cypher 03_relationship_uniqueness.cypher; do
  echo "Applying ${f}..."
  cypher-shell -a "${NEO4J_URI}" -u "${NEO4J_USER}" -p "${NEO4J_PASSWORD}" < "${ROOT}/neo4j/cypher/${f}"
done
