import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { PaletteProvider } from "@/components/command/palette-context";
import { CommandPalette } from "@/components/command/CommandPalette";
import { VoiceWelcome } from "@/components/voice/VoiceWelcome";

/**
 * ORBIT's app shell — sidebar, top bar, and the global Cmd+K command
 * palette. No auth guard: ORBIT's tools are usable by anyone, so unlike
 * Z Hub's platform layout this never redirects.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <PaletteProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar />
          <main className="orbit-scrollbar flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
      <CommandPalette />
      <VoiceWelcome />
    </PaletteProvider>
  );
}
