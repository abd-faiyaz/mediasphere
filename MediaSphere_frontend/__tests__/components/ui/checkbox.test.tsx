import { render, screen, fireEvent } from '@testing-library/react'
import { Checkbox } from '@/components/ui/checkbox'

describe('Checkbox Component', () => {
  it('renders with default classes', () => {
    render(<Checkbox data-testid="checkbox" />)
    const checkbox = screen.getByTestId('checkbox')
    expect(checkbox).toBeInTheDocument()
    expect(checkbox).toHaveClass('peer', 'h-4', 'w-4', 'shrink-0', 'rounded-sm', 'border', 'border-primary')
  })

  it('renders with custom className', () => {
    render(<Checkbox data-testid="checkbox" className="custom-class" />)
    const checkbox = screen.getByTestId('checkbox')
    expect(checkbox).toHaveClass('custom-class')
  })

  it('handles checked state', () => {
    render(<Checkbox data-testid="checkbox" checked={true} />)
    const checkbox = screen.getByTestId('checkbox')
    expect(checkbox).toBeChecked()
  })

  it('handles unchecked state', () => {
    render(<Checkbox data-testid="checkbox" checked={false} />)
    const checkbox = screen.getByTestId('checkbox')
    expect(checkbox).not.toBeChecked()
  })

  it('handles disabled state', () => {
    render(<Checkbox data-testid="checkbox" disabled />)
    const checkbox = screen.getByTestId('checkbox')
    expect(checkbox).toBeDisabled()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Checkbox data-testid="checkbox" onClick={handleClick} />)
    const checkbox = screen.getByTestId('checkbox')
    fireEvent.click(checkbox)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('handles onCheckedChange events', () => {
    const handleCheckedChange = jest.fn()
    render(<Checkbox data-testid="checkbox" onCheckedChange={handleCheckedChange} />)
    const checkbox = screen.getByTestId('checkbox')
    fireEvent.click(checkbox)
    expect(handleCheckedChange).toHaveBeenCalled()
  })

  it('forwards ref correctly', () => {
    const ref = jest.fn()
    render(<Checkbox ref={ref} data-testid="checkbox" />)
    expect(ref).toHaveBeenCalled()
  })

  it('renders with aria-label', () => {
    render(<Checkbox data-testid="checkbox" aria-label="Test checkbox" />)
    const checkbox = screen.getByTestId('checkbox')
    expect(checkbox).toHaveAttribute('aria-label', 'Test checkbox')
  })

  it('renders with required attribute', () => {
    render(<Checkbox data-testid="checkbox" required />)
    const checkbox = screen.getByTestId('checkbox')
    expect(checkbox).toHaveAttribute('required')
  })

  it('handles indeterminate state', () => {
    render(<Checkbox data-testid="checkbox" checked="indeterminate" />)
    const checkbox = screen.getByTestId('checkbox')
    expect(checkbox).toBeInTheDocument()
  })

  it('handles form values', () => {
    render(<Checkbox data-testid="checkbox" name="test-checkbox" value="test-value" />)
    const checkbox = screen.getByTestId('checkbox')
    expect(checkbox).toHaveAttribute('name', 'test-checkbox')
    expect(checkbox).toHaveAttribute('value', 'test-value')
  })

  it('renders check icon when checked', () => {
    const { container } = render(<Checkbox data-testid="checkbox" checked={true} />)
    // The check icon should be present in the DOM structure
    const checkIcon = container.querySelector('svg')
    expect(checkIcon).toBeInTheDocument()
  })

  it('has correct focus styles', () => {
    render(<Checkbox data-testid="checkbox" />)
    const checkbox = screen.getByTestId('checkbox')
    expect(checkbox).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-2', 'focus-visible:ring-ring')
  })

  it('has correct disabled styles', () => {
    render(<Checkbox data-testid="checkbox" disabled />)
    const checkbox = screen.getByTestId('checkbox')
    expect(checkbox).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50')
  })
})
