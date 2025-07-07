import * as React from "react";

const Root = React.forwardRef(({ className, orientation = "horizontal", decorative = true, ...props }: any, ref: any) => {
  const role = decorative ? "none" : "separator";
  
  return (
    <div
      ref={ref}
      role={role}
      aria-orientation={orientation}
      className={className}
      {...props}
    />
  );
});

Root.displayName = "Separator";

export { Root };

export { Root };
