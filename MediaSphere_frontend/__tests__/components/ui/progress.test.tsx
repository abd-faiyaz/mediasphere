import { render, screen } from '@testing-library/react'
import { Progress } from '@/components/ui/progress'

describe('Progress Component', () => {
  it('renders progress bar', () => {
    render(<Progress data-testid="progress" value={50} />)
    const progress = screen.getByTestId('progress')
    expect(progress).toBeInTheDocument()
  })

  it('shows progress value', () => {
    render(<Progress data-testid="progress" value={75} />)
    const progress = screen.getByTestId('progress')
    expect(progress).toHaveAttribute('aria-valuenow', '75')
  })

  it('renders with custom className', () => {
    render(<Progress data-testid="progress" className="custom-class" value={30} />)
    const progress = screen.getByTestId('progress')
    expect(progress).toHaveClass('custom-class')
  })

  it('renders with zero value', () => {
    render(<Progress data-testid="progress" value={0} />)
    const progress = screen.getByTestId('progress')
    expect(progress).toHaveAttribute('aria-valuenow', '0')
  })

  it('renders with max value', () => {
    render(<Progress data-testid="progress" value={100} />)
    const progress = screen.getByTestId('progress')
    expect(progress).toHaveAttribute('aria-valuenow', '100')
  })

  it('renders without value', () => {
    render(<Progress data-testid="progress" />)
    const progress = screen.getByTestId('progress')
    expect(progress).toBeInTheDocument()
  })
})
