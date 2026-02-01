"use client";

import * as React from "react";
import type { ToastProps } from "@radix-ui/react-toast";

import { ToastAction } from "@/components/ui/toast";

type ToastState = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactElement<typeof ToastAction>;
};

type Toast = Omit<ToastState, "id">;

type ToastContextType = {
  toasts: ToastState[];
  toast: (toast: Toast) => void;
  dismiss: (toastId?: string) => void;
};

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

function toastReducer(state: ToastState[], action: any) {
  switch (action.type) {
    case "ADD":
      return [...state, action.toast];
    case "DISMISS":
      return state.filter((toast) => toast.id !== action.toastId);
    default:
      return state;
  }
}

export function ToastStateProvider({ children }: { children: React.ReactNode }) {
  const [toasts, dispatch] = React.useReducer(toastReducer, [] as ToastState[]);

  const toast = React.useCallback((toast: Toast) => {
    const id = crypto.randomUUID();
    dispatch({ type: "ADD", toast: { ...toast, id } });
    return id;
  }, []);

  const dismiss = React.useCallback((toastId?: string) => {
    if (!toastId && toasts.length) {
      dispatch({ type: "DISMISS", toastId: toasts[0].id });
      return;
    }
    if (toastId) {
      dispatch({ type: "DISMISS", toastId });
    }
  }, [toasts]);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
