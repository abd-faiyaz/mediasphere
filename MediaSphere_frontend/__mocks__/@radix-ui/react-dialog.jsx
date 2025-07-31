// Mock implementation for @radix-ui/react-dialog
const React = require('react');

module.exports = {
  Root: ({ children, ...props }) => React.createElement('div', { 'data-testid': 'dialog-root', ...props }, children),
  Trigger: ({ children, ...props }) => React.createElement('button', { 'data-testid': 'dialog-trigger', ...props }, children),
  Portal: ({ children }) => React.createElement('div', { 'data-testid': 'dialog-portal' }, children),
  Overlay: ({ children, ...props }) => React.createElement('div', { 'data-testid': 'dialog-overlay', ...props }, children),
  Content: ({ children, ...props }) => React.createElement('div', { 'data-testid': 'dialog-content', ...props }, children),
  Close: ({ children, ...props }) => React.createElement('button', { 'data-testid': 'dialog-close', ...props }, children),
  Title: ({ children, ...props }) => React.createElement('h2', { 'data-testid': 'dialog-title', ...props }, children),
  Description: ({ children, ...props }) => React.createElement('p', { 'data-testid': 'dialog-description', ...props }, children),
}
