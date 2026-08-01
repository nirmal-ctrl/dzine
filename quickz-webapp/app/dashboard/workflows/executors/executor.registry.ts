// ─── Executor Registry ────────────────────────────────────────────────────────
// Maps NodeType → INodeExecutor.  Open/Closed: adding a new node type means
// creating a new executor file and calling registerExecutor() here.

import type { INodeExecutor } from "./base.executor"
import type { NodeType } from "../types/workflow.types"

// Individual executor imports
import { TriggerExecutor } from "./trigger.executor"
import { DelayExecutor } from "./delay.executor"
import { LlmExecutor } from "./llm.executor"
import { ImageGenExecutor } from "./image-gen.executor"
import { HttpRequestExecutor } from "./http-request.executor"
import { ScriptExecutor } from "./script.executor"
import { RouterExecutor } from "./router.executor"
import { ClassifierExecutor } from "./classifier.executor"
import { MergeExecutor } from "./merge.executor"
import { BooleanExecutor } from "./boolean.executor"
import { TransformExecutor } from "./transform.executor"
import { FilterExecutor } from "./filter.executor"
import { LoopExecutor } from "./loop.executor"
import { OutputExecutor } from "./output.executor"

const registry = new Map<string, INodeExecutor>()

function registerExecutor(executor: INodeExecutor): void {
  registry.set(executor.nodeType, executor)
}

export function getExecutor(type: NodeType | string): INodeExecutor | undefined {
  return registry.get(type)
}

// ── Bootstrap all built-in executors ──────────────────────────────────────────
registerExecutor(new TriggerExecutor())
registerExecutor(new DelayExecutor())
registerExecutor(new LlmExecutor())
registerExecutor(new ImageGenExecutor())
registerExecutor(new HttpRequestExecutor())
registerExecutor(new ScriptExecutor())
registerExecutor(new RouterExecutor())
registerExecutor(new ClassifierExecutor())
registerExecutor(new MergeExecutor())
registerExecutor(new BooleanExecutor())
registerExecutor(new TransformExecutor())
registerExecutor(new FilterExecutor())
registerExecutor(new LoopExecutor())
registerExecutor(new OutputExecutor())

/** Re-export for external registration of custom node types at runtime. */
export { registerExecutor }
