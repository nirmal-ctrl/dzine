"use client"

import * as React from "react"
import type { Node } from "reactflow"
import type { NodeData } from "../types/workflow.types"
import { getStaticNodeFields } from "../engine/graph.utils"

// Context to share nodes globally for autocomplete
export const WorkflowNodesContext = React.createContext<Node<NodeData>[]>([])

// ─── Rich ContentEditable Editor for True Visual Chips ───────────────────────

function parseValueToHtml(val: string, nodes: Node<NodeData>[]) {
  if (!val) return "";
  // Escape HTML entities first so user text can never inject markup into innerHTML.
  const ENT_AMP = "&" + "amp;", ENT_LT = "&" + "lt;", ENT_GT = "&" + "gt;";
  let escaped = val.replace(/&/g, ENT_AMP).replace(/</g, ENT_LT).replace(/>/g, ENT_GT);
  escaped = escaped.replace(/\n/g, "<br>");

  return escaped.replace(/\{\{\s*(.*?)\s*\}\}/g, (match, inner) => {
    let label = inner;
    const nodeMatch = inner.match(/\$node\["([^"]+)"\]\.json\.?(.*)/);
    if (nodeMatch) {
      const nodeId = nodeMatch[1];
      const field = nodeMatch[2];
      const node = nodes.find(n => n.id === nodeId);
      label = node ? `${node.data.label}${field ? ` → ${field}` : ''}` : inner;
    } else if (inner.startsWith("$json.")) {
      label = `Trigger → ${inner.substring(6)}`;
    } else if (inner === "$json") {
      label = `Trigger Output`;
    }

    // The zero-width spaces (&#8203;) allow the cursor to snap cleanly around the uneditable block in standard contentEditable
    return `&#8203;<span class="inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded text-[10px] font-bold bg-primary text-primary-foreground shadow-sm select-none align-middle" contenteditable="false" data-raw="${encodeURIComponent(match)}">${label}</span>&#8203;`;
  });
}

function parseHtmlToValue(html: string) {
  const temp = document.createElement("div");
  temp.innerHTML = html;

  let val = "";
  function walk(node: ChildNode) {
    if (node.nodeType === globalThis.Node.TEXT_NODE) {
      // Remove zero-width spaces used for cursor placement
      val += (node.textContent || "").replace(/\u200B/g, '');
    } else if (node.nodeType === globalThis.Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      if (el.nodeName === "BR") {
        val += "\n";
      } else if (el.hasAttribute("data-raw")) {
        val += decodeURIComponent(el.getAttribute("data-raw") || "");
      } else {
        el.childNodes.forEach(walk);
      }
    }
  }
  temp.childNodes.forEach(walk);
  return val;
}

function AutocompletePopup({ popover, onSelect }: { popover: any, onSelect: (name: string) => void }) {
  if (!popover.show) return null
  return (
    <div
      className="absolute z-50 min-w-[200px] max-h-[160px] overflow-y-auto bg-card border border-primary/20 shadow-xl rounded-md p-1 flex flex-col"
      style={{ top: popover.top, left: popover.left }}
    >
      <div className="px-2 py-1 text-[9px] font-bold text-muted-foreground uppercase tracking-widest border-b mb-1">
        Available Fields
      </div>
      {popover.options.map((opt: any, idx: number) => (
        <button
          key={opt.name}
          type="button"
          onMouseDown={(e) => {
            e.preventDefault() // prevent blur
            onSelect(opt.name)
          }}
          className={`flex flex-col text-left px-2 py-1.5 rounded-sm transition-colors ${idx === popover.activeIndex ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"
            }`}
        >
          <div className="flex justify-between items-center gap-2">
            <span className="font-mono text-xs font-bold truncate">{opt.name}</span>
            <span className={`text-[9px] uppercase tracking-wide opacity-70 ${idx === popover.activeIndex ? "" : "text-primary"}`}>{opt.type}</span>
          </div>
          {opt.description && (
            <span className="text-[10px] opacity-70 truncate max-w-full">{opt.description}</span>
          )}
        </button>
      ))}
    </div>
  )
}

function getCaretCharacterOffsetWithin(element: HTMLElement) {
  let caretOffset = 0;
  const doc = element.ownerDocument;
  const win = doc.defaultView;
  let sel;
  if (win && (sel = win.getSelection()) && sel.rangeCount > 0) {
    const range = sel.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    const tempHtml = document.createElement("div");
    tempHtml.appendChild(preCaretRange.cloneContents());
    caretOffset = parseHtmlToValue(tempHtml.innerHTML).length;
  }
  return caretOffset;
}

// A unified rich input component for true visual chips
export interface RichInputProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: string;
  onChange?: (e: { target: { value: string }; currentTarget: { value: string } }) => void;
  placeholder?: string;
  multiline?: boolean;
  type?: string; // accepted but ignored, for API compat
}

export const DroppableRichInput = React.forwardRef<HTMLDivElement, RichInputProps>(({ value, onChange, placeholder, className, multiline, type, ...props }, ref) => {
  const divRef = React.useRef<HTMLDivElement>(null)
  React.useImperativeHandle(ref, () => divRef.current as HTMLDivElement)
  const nodes = React.useContext(WorkflowNodesContext)

  const [popover, setPopover] = React.useState<{ show: boolean, top: number, left: number, options: any[], activeIndex: number, matchStart: number }>({
    show: false, top: 0, left: 0, options: [], activeIndex: 0, matchStart: -1
  })

  const [isFocused, setIsFocused] = React.useState(false);

  React.useEffect(() => {
    if (divRef.current && !isFocused) {
      const html = parseValueToHtml(value || "", nodes);
      if (divRef.current.innerHTML !== html) {
        divRef.current.innerHTML = html;
      }
    }
  }, [value, isFocused, nodes]);

  const triggerChange = (newVal: string) => {
    if (onChange) {
      onChange({ target: { value: newVal }, currentTarget: { value: newVal } });
    }
  }

  const handleInput = () => {
    if (!divRef.current) return;
    const currentHtml = divRef.current.innerHTML;
    const newVal = parseHtmlToValue(currentHtml);
    triggerChange(newVal);

    const cursor = getCaretCharacterOffsetWithin(divRef.current);
    const textBeforeCursor = newVal.substring(0, cursor);

    const match = textBeforeCursor.match(/\{\{\s*\$node\["([^"]+)"\]\.json\.([\w]*)$/);
    if (match) {
      const nodeId = match[1];
      const partialField = match[2].toLowerCase();
      const fields = getStaticNodeFields(nodeId, nodes);
      const filtered = partialField
        ? fields.filter(f => f.name.toLowerCase().startsWith(partialField))
        : fields;

      if (filtered.length > 0) {
        const rect = divRef.current.getBoundingClientRect();
        setPopover({
          show: true,
          top: rect.height + 2,
          left: 0,
          options: filtered,
          activeIndex: 0,
          matchStart: cursor - partialField.length
        });
        return;
      }
    }
    setPopover(p => p.show ? { ...p, show: false } : p);
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("text/plain");
    if (data && divRef.current) {
      const newVal = parseHtmlToValue(divRef.current.innerHTML) + data;
      triggerChange(newVal);
      setTimeout(() => {
        if (divRef.current) {
          divRef.current.innerHTML = parseValueToHtml(newVal, nodes);
          divRef.current.focus();
        }
      }, 0);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !multiline) {
      e.preventDefault();
    }

    if (popover.show) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setPopover(p => ({ ...p, activeIndex: (p.activeIndex + 1) % p.options.length }));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setPopover(p => ({ ...p, activeIndex: (p.activeIndex - 1 + p.options.length) % p.options.length }));
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        const selected = popover.options[popover.activeIndex];
        if (selected && divRef.current) {
          const currentVal = parseHtmlToValue(divRef.current.innerHTML);
          const startStr = currentVal.substring(0, popover.matchStart);
          const cursor = getCaretCharacterOffsetWithin(divRef.current);
          const endStr = currentVal.substring(cursor);
          const newVal = startStr + selected.name + " }}" + endStr;

          triggerChange(newVal);
          setPopover(p => ({ ...p, show: false }));

          setTimeout(() => {
            if (divRef.current) {
              divRef.current.innerHTML = parseValueToHtml(newVal, nodes);
              divRef.current.focus();
            }
          }, 0);
        }
      } else if (e.key === "Escape") {
        setPopover(p => ({ ...p, show: false }));
      }
    }
  }

  return (
    <div className={`relative group w-full ${className}`}>
      <div
        ref={divRef}
        contentEditable
        suppressContentEditableWarning
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          setPopover(p => ({ ...p, show: false }));
        }}
        onInput={handleInput}
        onClick={handleInput}
        onKeyDown={handleKeyDown}
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
        className={`w-full h-full font-mono text-xs bg-background border border-input rounded-md px-3 py-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground overflow-y-auto overflow-x-hidden break-words whitespace-pre-wrap leading-relaxed min-h-[36px] ${!value ? 'empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50' : ''
          }`}
        data-placeholder={placeholder}
      />
      <AutocompletePopup popover={popover} onSelect={(name) => {
        if (!divRef.current) return;
        const currentVal = parseHtmlToValue(divRef.current.innerHTML);
        const startStr = currentVal.substring(0, popover.matchStart);
        const cursor = getCaretCharacterOffsetWithin(divRef.current);
        const endStr = currentVal.substring(cursor);
        const newVal = startStr + name + " }}" + endStr;
        triggerChange(newVal);
        setPopover(p => ({ ...p, show: false }));
        setTimeout(() => {
          if (divRef.current) {
            divRef.current.innerHTML = parseValueToHtml(newVal, nodes);
            divRef.current.focus();
          }
        }, 0);
      }} />
    </div>
  )
})
DroppableRichInput.displayName = "DroppableRichInput"

export const DroppableInput = React.forwardRef<HTMLDivElement, RichInputProps>((props, ref) => <DroppableRichInput {...props} ref={ref} />);
DroppableInput.displayName = "DroppableInput";

export const DroppableTextarea = React.forwardRef<HTMLDivElement, RichInputProps>((props, ref) => <DroppableRichInput multiline {...props} ref={ref} />);
DroppableTextarea.displayName = "DroppableTextarea";
