import { render, screen } from '@testing-library/react'
import { Skeleton } from '@/components/ui/skeleton'

describe('Skeleton Component', () => {
  it('renders skeleton', () => {
    render(<Skeleton data-testid="skeleton" />)
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toBeInTheDocument()
  })

  it('has animation class', () => {
    render(<Skeleton data-testid="skeleton" />)
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toHaveClass('animate-pulse')
  })

  it('renders with custom className', () => {
    render(<Skeleton data-testid="skeleton" className="custom-class" />)
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toHaveClass('custom-class')
  })

  it('renders with custom styles', () => {
    render(<Skeleton data-testid="skeleton" style={{ width: '100px', height: '20px' }} />)
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toHaveStyle({ width: '100px', height: '20px' })
  })

  it('renders children', () => {
    render(<Skeleton data-testid="skeleton">Loading content...</Skeleton>)
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toHaveTextContent('Loading content...')
  })
})
