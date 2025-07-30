import { render, screen } from '@testing-library/react'
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogFooter, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog'

// Mock Radix UI Dialog components
jest.mock('@radix-ui/react-dialog')

describe('Dialog Components', () => {
  const DialogExample = () => (
    <Dialog>
      <DialogTrigger>Open Dialog</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>
            This is a dialog description.
          </DialogDescription>
        </DialogHeader>
        <div>Dialog body content</div>
        <DialogFooter>
          <button>Cancel</button>
          <button>OK</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  it('renders dialog header', () => {
    render(
      <DialogHeader data-testid="dialog-header">
        <DialogTitle>Test Title</DialogTitle>
      </DialogHeader>
    )
    const header = screen.getByTestId('dialog-header')
    expect(header).toBeInTheDocument()
  })

  it('renders dialog footer', () => {
    render(
      <DialogFooter data-testid="dialog-footer">
        <button>Footer Button</button>
      </DialogFooter>
    )
    const footer = screen.getByTestId('dialog-footer')
    expect(footer).toBeInTheDocument()
  })

  it('renders dialog title', () => {
    render(<DialogTitle data-testid="dialog-title">Test Title</DialogTitle>)
    const title = screen.getByTestId('dialog-title')
    expect(title).toBeInTheDocument()
    expect(title).toHaveTextContent('Test Title')
  })

  it('renders dialog description', () => {
    render(<DialogDescription data-testid="dialog-description">Test Description</DialogDescription>)
    const description = screen.getByTestId('dialog-description')
    expect(description).toBeInTheDocument()
    expect(description).toHaveTextContent('Test Description')
  })

})
