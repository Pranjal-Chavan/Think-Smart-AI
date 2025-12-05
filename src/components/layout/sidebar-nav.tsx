"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  BookOpen,
  PenSquare,
  Sigma,
} from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/chat", label: "AI Chat Tutor", icon: MessageSquare },
  { href: "/flashcards", label: "Flashcards", icon: BookOpen },
  { href: "/quiz-evaluator", label: "Quiz Evaluator", icon: PenSquare },
  { href: "/math-solver", label: "Math Solver", icon: Sigma },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {links.map((link) => (
        <SidebarMenuItem key={link.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === link.href}
            tooltip={{ children: link.label, side: "right" }}
          >
            <Link href={link.href}>
              <link.icon className="h-5 w-5" />
              <span>{link.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
