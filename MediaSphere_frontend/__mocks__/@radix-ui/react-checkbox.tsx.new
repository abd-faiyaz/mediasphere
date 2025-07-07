import * as React from "react";
import { Check } from "lucide-react";

// Define data attributes for TypeScript
interface DataAttributes {
  'data-testid'?: string;
  'data-state'?: string;
}

// This is the main component that needs to be exported
const Root = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & 
  DataAttributes & {
    onCheckedChange?: (checked: boolean | "indeterminate") => void;
    checked?: boolean | "indeterminate";
    defaultChecked?: boolean;
    name?: string;
    value?: string;
  }
>(({ className, checked, defaultChecked, onCheckedChange, name, value, children, ...props }, ref) => {
  const [isChecked, setIsChecked] = React.useState<boolean>(
    checked === true || defaultChecked === true
  );

  React.useEffect(() => {
    if (checked !== undefined) {
      setIsChecked(checked === true);
    }
  }, [checked]);

  const handleClick = () => {
    if (checked === undefined) {
      setIsChecked((prev) => !prev);
    }
    
    if (onCheckedChange) {
      onCheckedChange(!isChecked);
    }
  };

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={isChecked}
      data-state={isChecked ? "checked" : "unchecked"}
      ref={ref}
      className={className}
      onClick={handleClick}
      name={name}
      value={value}
      {...props}
    >
      {isChecked && (
        <div className="flex items-center justify-center text-current">
          <Check className="h-4 w-4" />
        </div>
      )}
      {children}
    </button>
  );
});

// This is the Indicator component that's used inside the Root
const Indicator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & 
  DataAttributes & { 
    forceMount?: boolean 
  }
>(({ className, children, forceMount, ...props }, ref) => {
  return (
    <div 
      ref={ref}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
});

Root.displayName = "Checkbox";
Indicator.displayName = "CheckboxIndicator";

export { Root, Indicator };
