// Fetch complete or sub-filtered Property Graph representation
MATCH (n)
OPTIONAL MATCH (n)-[r]->(m)
RETURN collect(DISTINCT {
  id: coalesce(n.name, n.title),
  label: head(labels(n)),
  properties: properties(n)
}) AS nodes,
collect(DISTINCT {
  id: id(r),
  source: coalesce(startNode(r).name, startNode(r).title),
  target: coalesce(endNode(r).name, endNode(r).title),
  type: type(r),
  properties: properties(r)
}) AS relationships;
