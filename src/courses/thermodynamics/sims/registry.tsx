import type { ReactNode } from "react";
import { PistonProcessSim } from "./PistonProcessSim";
import { CarnotSim } from "./CarnotSim";
import { RankineSim } from "./RankineSim";
import { RefrigerationSim } from "./RefrigerationSim";
import { GasCycleSim } from "./GasCycleSim";
import { PsychrometricSim } from "./PsychrometricSim";
import { ConductionWallSim } from "./ConductionWallSim";
import { FinSim } from "./FinSim";
import { ConvectionSim } from "./ConvectionSim";
import { HeatExchangerSim } from "./HeatExchangerSim";
import { RadiationSim } from "./RadiationSim";

/** simKey -> renderer, referenced from authored lesson JSON. */
export const THERMO_SIMS: Record<string, () => ReactNode> = {
  "pv-process": () => <PistonProcessSim />,
  carnot: () => <CarnotSim />,
  rankine: () => <RankineSim />,
  refrigeration: () => <RefrigerationSim />,
  "gas-cycle": () => <GasCycleSim />,
  psychrometric: () => <PsychrometricSim />,
  "conduction-wall": () => <ConductionWallSim />,
  fin: () => <FinSim />,
  convection: () => <ConvectionSim />,
  "heat-exchanger": () => <HeatExchangerSim />,
  radiation: () => <RadiationSim />,
};
