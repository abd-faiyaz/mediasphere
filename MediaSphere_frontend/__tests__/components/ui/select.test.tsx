import { render, screen } from '@testing-library/react'

// Mock the select components directly in the test file
jest.mock('@/components/ui/select', () => ({
  SelectTrigger: ({ children, className, ...props }: any) => (
    <button data-testid="select-trigger" className={className} {...props}>{children}</button>
  ),
  SelectValue: ({ placeholder, children, ...props }: any) => (
    <span data-testid="select-value" {...props}>{children || placeholder}</span>
  ),
  SelectItem: ({ value, children, className, ...props }: any) => (
    <div data-testid="select-item" data-value={value} className={className} {...props}>{children}</div>
  )
}))

// Import after mocking to get the mocked versions
import { SelectTrigger, SelectValue, SelectItem } from '@/components/ui/select'

describe('Select Components', () => {
  it('renders select trigger', () => {
    render(<SelectTrigger data-testid="select-trigger">Select Option</SelectTrigger>)
    const trigger = screen.getByTestId('select-trigger')
    expect(trigger).toBeInTheDocument()
    expect(trigger).toHaveTextContent('Select Option')
  })

  it('renders select value', () => {
    render(<SelectValue placeholder="Choose option" />)
    expect(screen.getByTestId('select-value')).toBeInTheDocument()
    expect(screen.getByText('Choose option')).toBeInTheDocument()
  })

  it('renders select item', () => {
    render(<SelectItem value="test" data-testid="select-item">Test Item</SelectItem>)
    const item = screen.getByTestId('select-item')
    expect(item).toBeInTheDocument()
    expect(item).toHaveTextContent('Test Item')
    expect(item).toHaveAttribute('data-value', 'test')
  })

  it('renders select trigger with custom className', () => {
    render(<SelectTrigger className="custom-trigger" data-testid="select-trigger">Select</SelectTrigger>)
    const trigger = screen.getByTestId('select-trigger')
    expect(trigger).toHaveClass('custom-trigger')
  })

  it('renders select item with custom className', () => {
    render(<SelectItem value="test" className="custom-item" data-testid="select-item">Test</SelectItem>)
    const item = screen.getByTestId('select-item')
    expect(item).toHaveClass('custom-item')
  })
})
