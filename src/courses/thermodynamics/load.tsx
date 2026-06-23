import { loadTopic as generic } from "../../lib/loadTopic";
import type { LoadedTopic, TopicMeta } from "../../lib/loadTopic";
import { THERMO_SIMS } from "./sims/registry";

export type { LoadedTopic, TopicMeta } from "../../lib/loadTopic";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function loadTopic(raw: any, slug: string, meta: TopicMeta): LoadedTopic {
  return generic(raw, slug, meta, THERMO_SIMS);
}
