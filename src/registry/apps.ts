import { publicEnv } from "@/config/env";

/**
 * The Zero Degree app registry — every product in the family that ORBIT's
 * app switcher can link to. A URL comes only from its environment
 * variable; ORBIT never hardcodes a sibling product's address, so an
 * unconfigured app renders as "not connected" instead of a dead link.
 */

export interface ZeroDegreeApp {
  id: string;
  name: string;
  tagline: string;
  url: string | undefined;
  self?: boolean;
}

export function getZeroDegreeApps(): ZeroDegreeApp[] {
  return [
    {
      id: "orbit",
      name: "ORBIT",
      tagline: "Command Center, search, and utility tools.",
      url: publicEnv.NEXT_PUBLIC_APP_URL,
      self: true,
    },
    {
      id: "zhub",
      name: "Z Hub",
      tagline: "Campus OS — market, print, spaces, connect.",
      url: publicEnv.NEXT_PUBLIC_ZHUB_URL,
    },
    {
      id: "loop",
      name: "LOOP",
      tagline: "Zero Degree's workflow & automation product.",
      url: publicEnv.NEXT_PUBLIC_LOOP_URL,
    },
    {
      id: "civi",
      name: "CIVI",
      tagline: "Zero Degree's civic/community product.",
      url: publicEnv.NEXT_PUBLIC_CIVI_URL,
    },
  ];
}
