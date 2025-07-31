import { render, screen, fireEvent } from '@testing-library/react'
import { Switch } from '@/components/ui/switch'

describe('Switch Component', () => {
  it('renders switch', () => {
    render(<Switch data-testid="switch" />)
    const switchElement = screen.getByTestId('switch')
    expect(switchElement).toBeInTheDocument()
  })

  it('renders with custom className', () => {
    render(<Switch data-testid="switch" className="custom-class" />)
    const switchElement = screen.getByTestId('switch')
    expect(switchElement).toHaveClass('custom-class')
  })

  it('handles checked state', () => {
    render(<Switch data-testid="switch" checked={true} />)
    const switchElement = screen.getByTestId('switch')
    expect(switchElement).toBeChecked()
  })

  it('handles unchecked state', () => {
    render(<Switch data-testid="switch" checked={false} />)
    const switchElement = screen.getByTestId('switch')
    expect(switchElement).not.toBeChecked()
  })

  it('handles disabled state', () => {
    render(<Switch data-testid="switch" disabled />)
    const switchElement = screen.getByTestId('switch')
    expect(switchElement).toBeDisabled()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Switch data-testid="switch" onClick={handleClick} />)
    const switchElement = screen.getByTestId('switch')
    fireEvent.click(switchElement)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('handles onCheckedChange events', () => {
    const handleCheckedChange = jest.fn()
    render(<Switch data-testid="switch" onCheckedChange={handleCheckedChange} />)
    const switchElement = screen.getByTestId('switch')
    fireEvent.click(switchElement)
    expect(handleCheckedChange).toHaveBeenCalled()
  })
})
