"use client";

import { AuthProvider } from "@/lib/auth/context";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 pl-64">
            <Topbar />
            <main className="p-6">{children}</main>
          </div>
        </div>
      </ProtectedRoute>
    </AuthProvider>
  );
}
