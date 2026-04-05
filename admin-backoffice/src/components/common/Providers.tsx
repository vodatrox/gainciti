"use client";

import { ToastContainer } from "./Toast";
import { ConfirmModalContainer } from "./ConfirmModal";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ToastContainer />
      <ConfirmModalContainer />
    </>
  );
}
