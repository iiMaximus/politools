import type { ReactNode } from "react";
import { LAB_SIMS } from "../labs";
import { DistributionSim } from "./DistributionSim";

/** simKey -> renderer, referenced from authored lesson JSON.
 * Includes every interactive lab exercise (lab:<id>) plus the
 * distribution explorers used by the theory lessons. */
export const STATISTICS_SIMS: Record<string, () => ReactNode> = {
  ...LAB_SIMS,
  "dist-normal": () => <DistributionSim kind="normal" />,
  "dist-student": () => <DistributionSim kind="student" />,
  "dist-chisq": () => <DistributionSim kind="chisq" />,
  "dist-fisher": () => <DistributionSim kind="fisher" />,
};
