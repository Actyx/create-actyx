import { Starter } from "./types";

export const DEFAULT_STARTER = "quickstart";
export const STARTERS: { [name: string]: Starter } = {
  quickstart: {
    repo: "https://github.com/Actyx/quickstart.git",
    outDir: "quickstart",
  },
  "machine-demo": {
    repo: "https://github.com/Actyx/DemoMachineKit.git",
    outDir: "machine-demo",
  },
};
