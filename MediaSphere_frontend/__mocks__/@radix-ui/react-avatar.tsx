import * as React from "react";

const Root = React.forwardRef(({ children, className, ...props }: any, ref: any) => (
  <div data-testid="avatar-root" className={className} ref={ref} {...props}>
    {children}
  </div>
));
Root.displayName = "Avatar.Root";

const Image = React.forwardRef(({ className, src, alt, ...props }: any, ref: any) => (
  <img 
    data-testid="avatar-image"
    className={className} 
    src={src} 
    alt={alt} 
    ref={ref} 
    {...props} 
  />
));
Image.displayName = "Avatar.Image";

const Fallback = React.forwardRef(({ children, className, ...props }: any, ref: any) => (
  <div data-testid="avatar-fallback" className={className} ref={ref} {...props}>
    {children}
  </div>
));
Fallback.displayName = "Avatar.Fallback";

export { Root, Image, Fallback };
