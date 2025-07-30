import { render, screen } from '@testing-library/react'
import { Progress } from '@/components/ui/progress'

describe('Progress Component', () => {
  it('renders progress bar', () => {
    render(<Progress data-testid="progress" value={50} />)
    const progress = screen.getByTestId('progress')
    expect(progress).toBeInTheDocument()
  })

  it('renders with custom className', () => {
    render(<Progress data-testid="progress" className="custom-class" value={30} />)
    const progress = screen.getByTestId('progress')
    expect(progress).toHaveClass('custom-class')
  })

  it('renders without value', () => {
    render(<Progress data-testid="progress" />)
    const progress = screen.getByTestId('progress')
    expect(progress).toBeInTheDocument()
  })
})
