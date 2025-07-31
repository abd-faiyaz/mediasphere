import * as React from "react";

const Root = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
  }
>(({ children, open, defaultOpen, onOpenChange, ...props }, ref) => {
  return (
    <div ref={ref} data-state={open ? "open" : "closed"} {...props}>
      {children}
    </div>
  );
});

const Trigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, ...props }, ref) => {
  return (
    <button type="button" ref={ref} {...props}>
      {children}
    </button>
  );
});

const Portal = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    container?: HTMLElement;
    forceMount?: boolean;
  }
>(({ children, container, forceMount, ...props }, ref) => {
  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  );
});

const Overlay = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    forceMount?: boolean;
  }
>(({ children, forceMount, ...props }, ref) => {
  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  );
});

const Content = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    forceMount?: boolean;
    onOpenAutoFocus?: (event: Event) => void;
    onCloseAutoFocus?: (event: Event) => void;
    onEscapeKeyDown?: (event: KeyboardEvent) => void;
    onPointerDownOutside?: (event: PointerEvent) => void;
    onInteractOutside?: (event: React.MouseEvent | React.TouchEvent) => void;
  }
>(({ children, forceMount, ...props }, ref) => {
  return (
    <div role="dialog" ref={ref} data-state="open" {...props}>
      {children}
    </div>
  );
});

const Close = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, ...props }, ref) => {
  return (
    <button type="button" ref={ref} {...props}>
      {children}
    </button>
  );
});

const Title = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ children, ...props }, ref) => {
  return (
    <h2 ref={ref} {...props}>
      {children}
    </h2>
  );
});

const Description = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ children, ...props }, ref) => {
  return (
    <p ref={ref} {...props}>
      {children}
    </p>
  );
});

Root.displayName = "Dialog";
Trigger.displayName = "DialogTrigger";
Portal.displayName = "DialogPortal";
Overlay.displayName = "DialogOverlay";
Content.displayName = "DialogContent";
Close.displayName = "DialogClose";
Title.displayName = "DialogTitle";
Description.displayName = "DialogDescription";

export {
  Root,
  Trigger,
  Portal,
  Overlay,
  Content,
  Close,
  Title,
  Description
};
