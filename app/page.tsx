import { redirect } from "next/navigation";

/**
 * Root — ORBIT has no auth gate, so this always lands on the Command
 * Center rather than branching on session state.
 */
export default function Home() {
  redirect("/command");
}
