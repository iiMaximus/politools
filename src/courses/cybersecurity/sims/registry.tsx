import type { ReactNode } from "react";
import { CaesarCipherSim } from "./CaesarCipherSim";

/** simKey -> renderer, referenced from authored Cyber lesson JSON. */
export const CYBER_SIMS: Record<string, () => ReactNode> = {
  caesar: () => <CaesarCipherSim />,
};
