const edges = [
  { source: "node-3", target: "node-4" },
  { source: "node-4", target: "node-5" }
];

function getUpstreamNodeIds(edges, nodeId) {
  const upstream = new Set()
  const queue = [nodeId]
  while (queue.length > 0) {
    const current = queue.shift()
    for (const e of edges) {
      if (e.target === current && !upstream.has(e.source)) {
        upstream.add(e.source)
        queue.push(e.source)
      }
    }
  }
  return Array.from(upstream)
}

const registry = {
  "node-4": { text: "THIS IS THE LLM TEXT OUTPUT" }
};

function resolveTemplate(text, registry, loopCtx, currentNodeId, edges) {
  if (typeof text !== "string") return String(text);
  
  return text.replace(/\{\{\s*([\s\S]+?)\s*\}\}/g, (_match, rawPath) => {
    const path = rawPath.trim().replace(/\\/g, "")
    
    if (path.startsWith("$json")) {
      let baseVal = undefined;
      
      if (currentNodeId && edges) {
        const upstreamIds = getUpstreamNodeIds(edges, currentNodeId)
        console.log("Upstream IDs:", upstreamIds);
        if (upstreamIds.length > 0) {
          baseVal = registry[upstreamIds[0]]
        }
      }
      console.log("baseVal:", baseVal);

      if (path === "$json") {
        return typeof baseVal === "string" ? baseVal : JSON.stringify(baseVal)
      }
      
      const fieldPath = path.substring(6) // remove "$json."
      const parts = fieldPath.split(".")
      let val = baseVal
      for (const p of parts) {
        if (val == null) return `{{ ${path} }}`
        val = val[p]
      }
      return val == null ? `{{ ${path} }}` : String(val)
    }
    return `{{${path}}}`;
  });
}

console.log("RESULT:", resolveTemplate("{{ $json.text }}", registry, null, "node-5", edges));
