import * as React from "react";

const Root = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { 
    type?: "single" | "multiple";
    collapsible?: boolean;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
  }
>(({ children, type, collapsible, value, defaultValue, onValueChange, ...props }, ref) => {
  return (
    <div ref={ref} data-type={type} {...props}>
      {children}
    </div>
  );
});

const Item = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value: string;
    disabled?: boolean;
  }
>(({ children, value, disabled, ...props }, ref) => {
  return (
    <div ref={ref} data-value={value} data-disabled={disabled} {...props}>
      {children}
    </div>
  );
});

const Trigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, ...props }, ref) => {
  return (
    <button 
      type="button" 
      ref={ref} 
      data-state="closed" 
      {...props}
    >
      {children}
    </button>
  );
});

const Header = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => {
  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  );
});

const Content = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => {
  return (
    <div 
      ref={ref} 
      data-state="closed"
      {...props}
    >
      {children}
    </div>
  );
});

Root.displayName = "Accordion";
Item.displayName = "AccordionItem";
Trigger.displayName = "AccordionTrigger";
Header.displayName = "AccordionHeader";
Content.displayName = "AccordionContent";

export { Root, Item, Trigger, Header, Content };
