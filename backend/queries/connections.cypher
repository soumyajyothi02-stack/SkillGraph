// Multi-hop Graph Traversal: Find connected paths from a Source Node (e.g. Skill) to a Target Node (e.g. Company or Role)
MATCH path = (source {name: $sourceName})-[*1..4]-(target {name: $targetName})
RETURN [n IN nodes(path) | {id: coalesce(n.name, n.title), label: head(labels(n)), properties: properties(n)}] AS pathNodes,
       [r IN relationships(path) | {type: type(r), source: coalesce(startNode(r).name, startNode(r).title), target: coalesce(endNode(r).name, endNode(r).title)}] AS pathRelationships,
       length(path) AS hopCount
ORDER BY length(path) ASC
LIMIT 10;
