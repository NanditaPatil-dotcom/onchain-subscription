'use client'

import * as React from 'react'

export type ToastActionElement = React.ReactElement | null

type ToastProps = {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  duration?: number
  variant?: 'default' | 'destructive'
}

type ToastState = ToastProps & { open: boolean }

const ToastContext = React.createContext<{
  toasts: ToastState[]
  addToast: (toast: Omit<ToastProps, 'id'>) => void
  dismissToast: (id: string) => void
} | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastState[]>([])

  const addToast = React.useCallback((toast: Omit<ToastProps, 'id'>) => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { ...toast, id, open: true }])
  }, [])

  const dismissToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const value = React.useMemo(
    () => ({ toasts, addToast, dismissToast }),
    [toasts, addToast, dismissToast],
  )

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = React.useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
