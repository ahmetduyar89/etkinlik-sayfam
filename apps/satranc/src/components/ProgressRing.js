import { el } from "../utils/dom.js";

export function ProgressRing(value, label) {
  return el("div", { className: "progress-ring", style: `--value:${value}` }, [
    el("div", { className: "ring-value", text: `%${value}` }),
    el("span", { text: label })
  ]);
}
