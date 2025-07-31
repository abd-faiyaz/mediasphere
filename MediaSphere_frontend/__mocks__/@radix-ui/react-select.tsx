// Mock for @radix-ui/react-select
const Root = ({ children, ...props }: any) => (
  <div data-testid="select-root" {...props}>{children}</div>
)

const Group = ({ children, ...props }: any) => (
  <div data-testid="select-group" {...props}>{children}</div>
)

const Value = ({ children, placeholder, ...props }: any) => (
  <div data-testid="select-value" {...props}>
    {children || placeholder}
  </div>
)

const Trigger = ({ children, ...props }: any) => (
  <button 
    data-testid="select-trigger" 
    role="combobox" 
    {...props}
  >
    {children}
  </button>
)

const Content = ({ children, ...props }: any) => (
  <div data-testid="select-content" {...props}>{children}</div>
)

const Item = ({ children, value, ...props }: any) => (
  <div 
    data-testid="select-item" 
    role="option" 
    data-value={value} 
    {...props}
  >
    {children}
  </div>
)

const ItemText = ({ children, ...props }: any) => (
  <span data-testid="select-item-text" {...props}>{children}</span>
)

const ItemIndicator = ({ children, ...props }: any) => (
  <span data-testid="select-item-indicator" {...props}>{children}</span>
)

const ScrollUpButton = ({ children, ...props }: any) => (
  <div data-testid="select-scroll-up-button" {...props}>{children}</div>
)

const ScrollDownButton = ({ children, ...props }: any) => (
  <div data-testid="select-scroll-down-button" {...props}>{children}</div>
)

const Portal = ({ children, ...props }: any) => (
  <div data-testid="select-portal" {...props}>{children}</div>
)

const Viewport = ({ children, ...props }: any) => (
  <div data-testid="select-viewport" {...props}>{children}</div>
)

const Label = ({ children, ...props }: any) => (
  <div data-testid="select-label" {...props}>{children}</div>
)

const Separator = ({ children, ...props }: any) => (
  <div data-testid="select-separator" {...props}>{children}</div>
)

const Arrow = ({ children, ...props }: any) => (
  <div data-testid="select-arrow" {...props}>{children}</div>
)

// Need to export both default and named exports to match the actual module
export {
  Root,
  Group,
  Value,
  Trigger,
  Content,
  Item,
  ItemText,
  ItemIndicator,
  ScrollUpButton,
  ScrollDownButton,
  Portal,
  Viewport,
  Label,
  Separator,
  Arrow
}

// Default export for the Root component
export default Root
