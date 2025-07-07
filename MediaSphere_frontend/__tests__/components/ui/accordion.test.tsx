import { render, screen } from '@testing-library/react'
import { 
  Accordion, 
  AccordionItem, 
  AccordionTrigger, 
  AccordionContent 
} from '@/components/ui/accordion'

describe('Accordion Components', () => {
  const AccordionExample = () => (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1" data-testid="accordion-item">
        <AccordionTrigger data-testid="accordion-trigger">
          Accordion Item 1
        </AccordionTrigger>
        <AccordionContent data-testid="accordion-content">
          Content for item 1
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Accordion Item 2</AccordionTrigger>
        <AccordionContent>Content for item 2</AccordionContent>
      </AccordionItem>
    </Accordion>
  )

  it('renders accordion', () => {
    render(<AccordionExample />)
    const item = screen.getByTestId('accordion-item')
    expect(item).toBeInTheDocument()
  })

  it('renders accordion trigger', () => {
    render(<AccordionExample />)
    const trigger = screen.getByTestId('accordion-trigger')
    expect(trigger).toBeInTheDocument()
    expect(trigger).toHaveTextContent('Accordion Item 1')
  })

  it('renders accordion content', () => {
    render(<AccordionExample />)
    const content = screen.getByTestId('accordion-content')
    expect(content).toBeInTheDocument()
    expect(content).toHaveTextContent('Content for item 1')
  })

  it('renders with custom className', () => {
    render(
      <Accordion type="single">
        <AccordionItem value="item-1" className="custom-item">
          <AccordionTrigger className="custom-trigger">
            Custom Item
          </AccordionTrigger>
          <AccordionContent className="custom-content">
            Custom Content
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    )
    
    const item = screen.getByRole('button').closest('[data-state]')
    expect(item).toHaveClass('custom-item')
  })

  it('renders multiple accordion items', () => {
    render(<AccordionExample />)
    const triggers = screen.getAllByRole('button')
    expect(triggers).toHaveLength(2)
    expect(triggers[0]).toHaveTextContent('Accordion Item 1')
    expect(triggers[1]).toHaveTextContent('Accordion Item 2')
  })
})
