import * as React from "react";

const Root = ({ className, defaultValue, value, children, onValueChange, ...props }: any) => {
  const [activeTab, setActiveTab] = React.useState(value || defaultValue);
  
  const handleValueChange = (newValue: string) => {
    setActiveTab(newValue);
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  return (
    <div className={className} {...props}>
      {React.Children.map(children, child => {
        if (!child) return child;
        
        if (child.type === List || child.type.displayName === 'TabsList' || 
            child.type === Content || child.type.displayName === 'TabsContent') {
          return React.cloneElement(child, {
            activeTab,
            onValueChange: handleValueChange,
          });
        }
        return child;
      })}
    </div>
  );
};

const List = React.forwardRef(({ className, children, activeTab, onValueChange, ...props }: any, ref: any) => {
  return (
    <div role="tablist" className={className} ref={ref} {...props}>
      {React.Children.map(children, child => {
        if (!child) return child;
        
        if (child.type === Trigger || child.type.displayName === 'TabsTrigger') {
          return React.cloneElement(child, {
            activeTab,
            onValueChange,
          });
        }
        return child;
      })}
    </div>
  );
});

const Trigger = React.forwardRef(({ className, children, value, activeTab, onValueChange, ...props }: any, ref: any) => {
  const isActive = activeTab === value;
  
  return (
    <button
      role="tab"
      aria-selected={isActive}
      className={className}
      ref={ref}
      onClick={() => onValueChange?.(value)}
      data-state={isActive ? 'active' : 'inactive'}
      {...props}
    >
      {children}
    </button>
  );
});

const Content = React.forwardRef(({ className, children, value, activeTab, forceMount, ...props }: any, ref: any) => {
  const isActive = activeTab === value;
  
  if (!isActive && !forceMount) {
    return null;
  }
  
  return (
    <div
      role="tabpanel"
      className={className}
      ref={ref}
      data-state={isActive ? 'active' : 'inactive'}
      {...props}
    >
      {children}
    </div>
  );
});

Root.displayName = 'Tabs';
List.displayName = 'TabsList';
Trigger.displayName = 'TabsTrigger';
Content.displayName = 'TabsContent';

export { Root, List, Trigger, Content };
