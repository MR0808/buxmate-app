import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopBar } from "@/components/layout/app-top-bar";

type AppShellProps = {
  children: React.ReactNode;
  userName: string;
  userEmail: string;
};

export function AppShell({ children, userName, userEmail }: AppShellProps) {
  return (
    <div className="flex min-h-full">
      <div className="hidden w-64 shrink-0 border-r border-border/60 bg-card/30 lg:block">
        <AppSidebar className="sticky top-0 h-screen" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopBar userName={userName} userEmail={userEmail} />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
