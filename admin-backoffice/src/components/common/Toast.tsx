"use client";

import { useCallback, useEffect, useState } from "react";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastItem {
  id: number;
  type: ToastType;
  title: string;
  message?: string;
}

let addToastFn: ((toast: Omit<ToastItem, "id">) => void) | null = null;
let nextId = 0;

export function toast(type: ToastType, title: string, message?: string) {
  addToastFn?.({ type, title, message });
}

toast.success = (title: string, message?: string) => toast("success", title, message);
toast.error = (title: string, message?: string) => toast("error", title, message);
toast.warning = (title: string, message?: string) => toast("warning", title, message);
toast.info = (title: string, message?: string) => toast("info", title, message);

const icons: Record<ToastType, string> = {
  success: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  error: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
  warning: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z",
  info: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
};

const colors: Record<ToastType, { bg: string; icon: string; border: string }> = {
  success: { bg: "bg-green-50", icon: "text-green-500", border: "border-green-200" },
  error: { bg: "bg-red-50", icon: "text-red-500", border: "border-red-200" },
  warning: { bg: "bg-amber-50", icon: "text-amber-500", border: "border-amber-200" },
  info: { bg: "bg-blue-50", icon: "text-blue-500", border: "border-blue-200" },
};

function ToastEntry({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const [exiting, setExiting] = useState(false);
  const c = colors[item.type];

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(onDismiss, 300);
    }, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={`pointer-events-auto flex w-80 items-start gap-3 rounded-xl border ${c.border} ${c.bg} px-4 py-3 shadow-lg transition-all duration-300 ${
        exiting ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"
      }`}
    >
      <svg className={`mt-0.5 h-5 w-5 shrink-0 ${c.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d={icons[item.type]} />
      </svg>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">{item.title}</p>
        {item.message && <p className="mt-0.5 text-xs text-gray-600">{item.message}</p>}
      </div>
      <button onClick={() => { setExiting(true); setTimeout(onDismiss, 300); }} className="shrink-0 text-gray-400 hover:text-gray-600">
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((t: Omit<ToastItem, "id">) => {
    setToasts((prev) => [...prev, { ...t, id: nextId++ }]);
  }, []);

  useEffect(() => {
    addToastFn = addToast;
    return () => { addToastFn = null; };
  }, [addToast]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[9999] flex flex-col gap-2">
      {toasts.map((t) => (
        <ToastEntry key={t.id} item={t} onDismiss={() => dismiss(t.id)} />
      ))}
    </div>
  );
}
