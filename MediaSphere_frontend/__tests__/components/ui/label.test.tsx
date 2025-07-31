import { render, screen } from '@testing-library/react'
import { Label } from '@/components/ui/label'

describe('Label Component', () => {
  it('renders label', () => {
    render(<Label data-testid="label">Test Label</Label>)
    const label = screen.getByTestId('label')
    expect(label).toBeInTheDocument()
    expect(label).toHaveTextContent('Test Label')
  })

  it('renders with custom className', () => {
    render(<Label data-testid="label" className="custom-class">Custom Label</Label>)
    const label = screen.getByTestId('label')
    expect(label).toHaveClass('custom-class')
  })

  it('renders with htmlFor attribute', () => {
    render(<Label data-testid="label" htmlFor="input-id">Input Label</Label>)
    const label = screen.getByTestId('label')
    expect(label).toHaveAttribute('for', 'input-id')
  })

  it('renders children', () => {
    render(
      <Label data-testid="label">
        <span>Required</span> Field
      </Label>
    )
    const label = screen.getByTestId('label')
    expect(label).toBeInTheDocument()
    expect(screen.getByText('Required')).toBeInTheDocument()
    expect(screen.getByText('Field')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Label data-testid="label" onClick={handleClick}>Clickable Label</Label>)
    const label = screen.getByTestId('label')
    label.click()
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
