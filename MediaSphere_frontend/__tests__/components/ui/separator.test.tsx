import { render, screen } from '@testing-library/react'
import { Separator } from '@/components/ui/separator'

describe('Separator Component', () => {
  it('renders separator', () => {
    render(<Separator data-testid="separator" />)
    const separator = screen.getByTestId('separator')
    expect(separator).toBeInTheDocument()
  })

  it('renders with horizontal orientation by default', () => {
    render(<Separator data-testid="separator" />)
    const separator = screen.getByTestId('separator')
    expect(separator).toHaveAttribute('aria-orientation', 'horizontal')
  })

  it('renders with vertical orientation', () => {
    render(<Separator data-testid="separator" orientation="vertical" />)
    const separator = screen.getByTestId('separator')
    expect(separator).toHaveAttribute('aria-orientation', 'vertical')
  })

  it('renders with custom className', () => {
    render(<Separator data-testid="separator" className="custom-class" />)
    const separator = screen.getByTestId('separator')
    expect(separator).toHaveClass('custom-class')
  })

  it('renders as decorative by default', () => {
    render(<Separator data-testid="separator" />)
    const separator = screen.getByTestId('separator')
    expect(separator).toHaveAttribute('role', 'none')
  })

  it('renders as non-decorative when specified', () => {
    render(<Separator data-testid="separator" decorative={false} />)
    const separator = screen.getByTestId('separator')
    expect(separator).toHaveAttribute('role', 'separator')
  })
})
