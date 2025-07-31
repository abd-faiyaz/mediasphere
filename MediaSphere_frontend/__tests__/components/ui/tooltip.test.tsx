import { render, screen } from '@testing-library/react'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'

describe('Tooltip Components', () => {
  const TooltipExample = () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger data-testid="tooltip-trigger">Hover me</TooltipTrigger>
        <TooltipContent data-testid="tooltip-content">
          <p>Tooltip content</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )

  it('renders tooltip provider', () => {
    render(
      <TooltipProvider data-testid="tooltip-provider">
        <div>Provider content</div>
      </TooltipProvider>
    )
    expect(screen.getByText('Provider content')).toBeInTheDocument()
  })

  it('renders tooltip trigger', () => {
    render(<TooltipExample />)
    const trigger = screen.getByTestId('tooltip-trigger')
    expect(trigger).toBeInTheDocument()
    expect(trigger).toHaveTextContent('Hover me')
  })

  it('renders tooltip with custom className', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent className="custom-tooltip">Custom content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
    expect(screen.getByText('Trigger')).toBeInTheDocument()
  })

  it('renders tooltip content with custom sideOffset', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent sideOffset={8}>Content with custom offset</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
    expect(screen.getByText('Trigger')).toBeInTheDocument()
  })

  it('renders nested tooltip content', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent>
            <div>
              <span>Nested</span> content
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
    expect(screen.getByText('Trigger')).toBeInTheDocument()
  })
})
