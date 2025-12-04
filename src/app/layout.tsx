import type { Metadata } from "next";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackClientApp } from "../stack/client";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hackathon Planner",
  description: "Plan and organize your hackathon with todos, budget tracking, and hardware management",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <StackProvider app={stackClientApp}><StackTheme>
        {children}
        </StackTheme></StackProvider>
      </body>
    </html>
  );
}
