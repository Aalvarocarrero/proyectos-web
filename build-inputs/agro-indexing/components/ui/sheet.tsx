"use client"

import * as React from "react"
import { XIcon } from "lucide-react"
import { Dialog as SheetPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { OfflineAccountLockPanel, useOfflineAccountBlocked } from "@/components/offline-account-boundary"

type SheetFocusRegistry = { hasTrigger: () => boolean; registerTrigger: () => () => void }
const SheetFocusContext = React.createContext<SheetFocusRegistry | null>(null)

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  const triggersRef = React.useRef(0)
  const focusRegistry = React.useMemo(() => ({ hasTrigger: () => triggersRef.current > 0, registerTrigger: () => { triggersRef.current++; return () => { triggersRef.current-- } } }), [])
  return <SheetFocusContext.Provider value={focusRegistry}><SheetPrimitive.Root data-slot="sheet" {...props} /></SheetFocusContext.Provider>
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  const focusRegistry = React.useContext(SheetFocusContext)
  React.useEffect(() => focusRegistry?.registerTrigger(), [focusRegistry])
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  )
}

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  onOpenAutoFocus,
  onCloseAutoFocus,
  onEscapeKeyDown,
  onInteractOutside,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left"
  showCloseButton?: boolean
}) {
  const accountBlocked = useOfflineAccountBlocked()
  const opener = React.useRef<HTMLElement | null>(null)
  const focusRegistry = React.useContext(SheetFocusContext)
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "fixed z-50 flex flex-col gap-4 bg-background shadow-lg transition ease-in-out data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:animate-in data-[state=open]:duration-500",
          side === "right" &&
            "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
          side === "left" &&
            "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
          side === "top" &&
            "inset-x-0 top-0 h-auto border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
          side === "bottom" &&
            "inset-x-0 bottom-0 h-auto border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
          className
        )}
        {...props}
        aria-label={accountBlocked ? "Verificar la cuenta original" : props["aria-label"]}
        {...(accountBlocked ? { "aria-labelledby": undefined, "aria-describedby": undefined } : {})}
        onEscapeKeyDown={(event) => { if (accountBlocked) event.preventDefault(); else onEscapeKeyDown?.(event) }}
        onInteractOutside={(event) => { if (accountBlocked) event.preventDefault(); else onInteractOutside?.(event) }}
        onOpenAutoFocus={(event) => {
          opener.current = document.activeElement instanceof HTMLElement && document.activeElement !== document.body ? document.activeElement : null
          onOpenAutoFocus?.(event)
        }}
        onCloseAutoFocus={(event) => {
          onCloseAutoFocus?.(event)
          if (!event.defaultPrevented && focusRegistry && !focusRegistry.hasTrigger() && opener.current?.isConnected) {
            event.preventDefault()
            opener.current.focus({ preventScroll: true })
          }
        }}
      >
        {accountBlocked && <OfflineAccountLockPanel withinModal />}
        <div hidden={accountBlocked} inert={accountBlocked} aria-hidden={accountBlocked || undefined} style={{ display: accountBlocked ? "none" : "contents" }} data-account-modal-draft="">
        {showCloseButton && (
          <div data-slot="sheet-close-rail" className="sticky top-0 z-40 -mb-11 flex h-11 shrink-0 justify-end px-2 pt-2 pointer-events-none">
            <SheetPrimitive.Close data-slot="sheet-close" aria-label="Cerrar" className="pointer-events-auto relative flex size-11 shrink-0 items-center justify-center rounded-full border border-[#3e2a19]/30 bg-[#fffdf8] text-[#3e2a19] opacity-100 shadow-md hover:bg-[#f3ebdd] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4c6b3a] disabled:pointer-events-none">
              <XIcon className="size-5" strokeWidth={2.5}/><span className="sr-only">Cerrar</span>
            </SheetPrimitive.Close>
          </div>
        )}
        {children}
        </div>
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("font-semibold text-foreground", className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
