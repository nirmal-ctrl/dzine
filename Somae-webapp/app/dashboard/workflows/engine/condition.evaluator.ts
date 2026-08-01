// ─── Condition Evaluator ───────────────────────────────────────────────────────
// Pure utility for evaluating router / boolean / filter conditions.
// No side‑effects – respects Open/Closed Principle (new operators can be added here).

export function evaluateCondition(condition: string): boolean {
  const expr = (condition || "").trim()
  if (!expr) return false
  if (/^true$/i.test(expr)) return true
  if (/^false$/i.test(expr)) return false

  // Detect unresolved placeholders – throw to surface an error early.
  if (/\{\{[^{}]*\}\}/.test(expr)) {
    throw new Error(`Condition contains unresolved variable placeholders: "${expr}". Please check your variable names and upstream node data.`)
  }

  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function(`"use strict"; return (${expr});`)
    return Boolean(fn())
  } catch {
    // Fallback to simple left‑operator‑right parsing.
  }

  const match = expr.match(/^(.*?)\s*(===|!==|==|!=|>=|<=|>|<)\s*(.*)$/)
  if (match) {
    const left = parseLiteral(match[1])
    const right = parseLiteral(match[3])
    switch (match[2]) {
      case "===":
        return left === right
      case "!==":
        return left !== right
      case "==":
        // eslint-disable-next-line eqeqeq
        return left == right
      case "!=":
        // eslint-disable-next-line eqeqeq
        return left != right
      case ">":
        return Number(left) > Number(right)
      case "<":
        return Number(left) < Number(right)
      case ">=":
        return Number(left) >= Number(right)
      case "<=":
        return Number(left) <= Number(right)
    }
  }

  // Truthiness fallback – treat any non‑zero / non‑false string as true.
  const lower = expr.toLowerCase()
  return lower !== "0" && lower !== "false" && lower !== "null" && lower !== "undefined" && lower !== "nan"
}

function parseLiteral(raw: string): unknown {
  const s = raw.trim()
  if (/^true$/i.test(s)) return true
  if (/^false$/i.test(s)) return false
  if (/^null$/i.test(s)) return null
  if ((s.startsWith("'") && s.endsWith("'")) || (s.startsWith('"') && s.endsWith('"')))
    return s.slice(1, -1)
  if (s !== "" && !isNaN(Number(s))) return Number(s)
  return s
}
