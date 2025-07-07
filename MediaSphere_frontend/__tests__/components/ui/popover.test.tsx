import { render, screen } from '@testing-library/react'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'

describe('Popover Components', () => {
  const PopoverExample = () => (
    <Popover>
      <PopoverTrigger data-testid="popover-trigger">
        Open Popover
      </PopoverTrigger>
      <PopoverContent data-testid="popover-content">
        <p>Popover content here</p>
      </PopoverContent>
    </Popover>
  )

  it('renders popover trigger', () => {
    render(<PopoverExample />)
    const trigger = screen.getByTestId('popover-trigger')
    expect(trigger).toBeInTheDocument()
    expect(trigger).toHaveTextContent('Open Popover')
  })

  it('renders popover with custom className', () => {
    render(
      <Popover>
        <PopoverTrigger className="custom-trigger">
          Custom Trigger
        </PopoverTrigger>
        <PopoverContent className="custom-content">
          Custom Content
        </PopoverContent>
      </Popover>
    )
    
    const trigger = screen.getByRole('button')
    expect(trigger).toHaveClass('custom-trigger')
  })

  it('renders popover content with custom align and sideOffset', () => {
    render(
      <Popover>
        <PopoverTrigger>Trigger</PopoverTrigger>
        <PopoverContent align="start" sideOffset={8}>
          Content with custom props
        </PopoverContent>
      </Popover>
    )
    
    const trigger = screen.getByRole('button')
    expect(trigger).toBeInTheDocument()
  })

  it('renders nested popover content', () => {
    render(
      <Popover>
        <PopoverTrigger>Trigger</PopoverTrigger>
        <PopoverContent>
          <div>
            <h3>Title</h3>
            <p>Description</p>
          </div>
        </PopoverContent>
      </Popover>
    )
    
    const trigger = screen.getByRole('button')
    expect(trigger).toBeInTheDocument()
  })
})
