import { render, screen, fireEvent } from '@testing-library/react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

describe('Tabs Components', () => {
  const TabsExample = () => (
    <Tabs defaultValue="tab1" data-testid="tabs">
      <TabsList data-testid="tabs-list">
        <TabsTrigger value="tab1" data-testid="tab1-trigger">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2" data-testid="tab2-trigger">Tab 2</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1" data-testid="tab1-content">Content 1</TabsContent>
      <TabsContent value="tab2" data-testid="tab2-content">Content 2</TabsContent>
    </Tabs>
  )

  it('renders tabs', () => {
    render(<TabsExample />)
    const tabs = screen.getByTestId('tabs')
    expect(tabs).toBeInTheDocument()
  })

  it('renders tabs list', () => {
    render(<TabsExample />)
    const tabsList = screen.getByTestId('tabs-list')
    expect(tabsList).toBeInTheDocument()
  })

  it('renders tab triggers', () => {
    render(<TabsExample />)
    const tab1Trigger = screen.getByTestId('tab1-trigger')
    const tab2Trigger = screen.getByTestId('tab2-trigger')
    expect(tab1Trigger).toBeInTheDocument()
    expect(tab2Trigger).toBeInTheDocument()
  })

  it('renders tab content', () => {
    render(<TabsExample />)
    const tab1Content = screen.getByTestId('tab1-content')
    expect(tab1Content).toBeInTheDocument()
    expect(tab1Content).toHaveTextContent('Content 1')
  })

  it('switches tabs when clicked', () => {
    render(<TabsExample />)
    const tab2Trigger = screen.getByTestId('tab2-trigger')
    fireEvent.click(tab2Trigger)
    
    const tab2Content = screen.getByTestId('tab2-content')
    expect(tab2Content).toHaveTextContent('Content 2')
  })

  it('renders with custom className', () => {
    render(
      <Tabs defaultValue="tab1" className="custom-tabs">
        <TabsList className="custom-list">
          <TabsTrigger value="tab1" className="custom-trigger">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1" className="custom-content">Content 1</TabsContent>
      </Tabs>
    )
    
    const tabs = screen.getByRole('tablist').parentElement
    expect(tabs).toHaveClass('custom-tabs')
  })
})
