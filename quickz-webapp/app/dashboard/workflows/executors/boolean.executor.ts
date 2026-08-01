// ─── Boolean Executor ─────────────────────────────────────────────────────────
import type { Node } from "reactflow"
import type { INodeExecutor, ExecutionContext } from "./base.executor"
import type { NodeData } from "../types/workflow.types"

export class BooleanExecutor implements INodeExecutor {
  readonly nodeType = "boolean"

  async execute(
    node: Node<NodeData>,
    ctx: ExecutionContext
  ): Promise<unknown> {
    const { resolvedParams } = ctx
    const toBool = (v: unknown): boolean => {
      if (typeof v === "boolean") return v
      const s = String(v ?? "")
        .trim()
        .toLowerCase()
      return !(
        s === "" ||
        s === "false" ||
        s === "0" ||
        s === "null" ||
        s === "undefined" ||
        s === "nan"
      )
    }

    const op1 = toBool(resolvedParams.operand1)
    const op2 = toBool(resolvedParams.operand2)
    const operator = resolvedParams.operator || "AND"
    const result =
      operator === "NOT" ? !op1 : operator === "OR" ? op1 || op2 : op1 && op2

    return {
      result,
      operator,
      operand1: op1,
      ...(operator === "NOT" ? {} : { operand2: op2 }),
    }
  }
}
