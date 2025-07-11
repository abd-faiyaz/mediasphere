import * as React from "react";

const Root = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value?: number }
>(({ className, value, ...props }, ref) => {
  // Ensure value is properly handled for aria-valuenow
  const ariaValueNow = React.useMemo(() => {
    return value !== undefined ? Math.round(value) : undefined;
  }, [value]);

  return (
    <div
      ref={ref}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={ariaValueNow}
      className={className}
      {...props}
    >
      <div 
        className="h-full w-full flex-1 bg-primary transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </div>
  );
});

const Indicator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return <div ref={ref} className={className} {...props} />;
});

Root.displayName = "Progress";
Indicator.displayName = "ProgressIndicator";

export { Root, Indicator };
