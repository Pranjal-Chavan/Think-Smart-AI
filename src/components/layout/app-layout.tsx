import type { ReactNode } from "react";
import Link from "next/link";
import { BrainCircuit } from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { SidebarNav } from "./sidebar-nav";
import { UserMenu } from "./user-menu";
import { useAuth } from "@/hooks/use-auth-provider";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <BrainCircuit className="h-12 w-12 animate-pulse text-primary" />
      </div>
    );
  }

  if (!user) {
    // This is a guest user
    return (
       <div className="flex min-h-screen flex-col">
        <header className="flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <BrainCircuit className="h-7 w-7 text-primary" />
            <h1 className="text-lg font-bold">
              ThinkSmart AI
            </h1>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.push('/login')}>Login</Button>
            <Button onClick={() => router.push('/signup')}>Sign Up</Button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
        <footer className="border-t bg-background p-4 text-center text-sm text-muted-foreground">
          You are browsing as a guest. <Link href="/signup" className="underline">Create an account</Link> to save your history.
        </footer>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <BrainCircuit className="h-7 w-7 text-primary" />
              <h1 className="text-lg font-bold text-sidebar-foreground">
                ThinkSmart AI
              </h1>
            </Link>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter>
          <UserMenu />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="ml-auto">
             <UserMenu />
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
