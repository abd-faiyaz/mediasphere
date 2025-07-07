import { render, screen } from '@testing-library/react'
import { Badge } from '@/components/ui/badge'

// Mock the cn utility function
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}))

// Mock class-variance-authority
jest.mock('class-variance-authority', () => ({
  cva: (base: string, config: any) => {
    return (props: any) => {
      const variant = props?.variant || config.defaultVariants?.variant || 'default'
      const baseClasses = base.split(' ')
      const variantClasses = config.variants?.variant?.[variant]?.split(' ') || []
      return [...baseClasses, ...variantClasses].join(' ')
    }
  }
}))

describe('Badge Component', () => {
  it('renders badge with default variant', () => {
    render(<Badge data-testid="badge">Default Badge</Badge>)
    const badge = screen.getByTestId('badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('Default Badge')
  })

  it('renders badge with secondary variant', () => {
    render(<Badge variant="secondary" data-testid="badge">Secondary Badge</Badge>)
    const badge = screen.getByTestId('badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('Secondary Badge')
  })

  it('renders badge with destructive variant', () => {
    render(<Badge variant="destructive" data-testid="badge">Destructive Badge</Badge>)
    const badge = screen.getByTestId('badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('Destructive Badge')
  })

  it('renders badge with outline variant', () => {
    render(<Badge variant="outline" data-testid="badge">Outline Badge</Badge>)
    const badge = screen.getByTestId('badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('Outline Badge')
  })

  it('applies custom className', () => {
    render(<Badge className="custom-class" data-testid="badge">Custom Badge</Badge>)
    const badge = screen.getByTestId('badge')
    expect(badge).toHaveClass('custom-class')
  })

  it('passes through other props', () => {
    render(<Badge data-testid="badge" id="test-id" role="status">Badge with props</Badge>)
    const badge = screen.getByTestId('badge')
    expect(badge).toHaveAttribute('id', 'test-id')
    expect(badge).toHaveAttribute('role', 'status')
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Badge onClick={handleClick} data-testid="badge">Clickable Badge</Badge>)
    const badge = screen.getByTestId('badge')
    badge.click()
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('renders with children elements', () => {
    render(
      <Badge data-testid="badge">
        <span>Badge with</span> <strong>children</strong>
      </Badge>
    )
    const badge = screen.getByTestId('badge')
    expect(badge).toBeInTheDocument()
    expect(screen.getByText('Badge with')).toBeInTheDocument()
    expect(screen.getByText('children')).toBeInTheDocument()
  })

  it('renders empty badge', () => {
    render(<Badge data-testid="badge" />)
    const badge = screen.getByTestId('badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toBeEmptyDOMElement()
  })

  it('handles different HTML attributes', () => {
    render(
      <Badge 
        data-testid="badge" 
        aria-label="Test badge"
        title="Badge tooltip"
        style={{ color: 'red' }}
      >
        Attributed Badge
      </Badge>
    )
    const badge = screen.getByTestId('badge')
    expect(badge).toHaveAttribute('aria-label', 'Test badge')
    expect(badge).toHaveAttribute('title', 'Badge tooltip')
    expect(badge).toHaveStyle('color: red')
  })
})
