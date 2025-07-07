import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CreateThreadModal from '@/components/CreateThreadModal'

// Mock the auth service
jest.mock('@/lib/auth-service', () => ({
  authService: {
    getCurrentUser: jest.fn(() => Promise.resolve({ id: '1', name: 'Test User' })),
    createThread: jest.fn(),
    getToken: jest.fn(() => 'mock-token'),
  },
}))

// Mock the toast hook
jest.mock('@/hooks/use-toast', () => ({
  toast: jest.fn(),
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    button: ({ children, onClick, ...props }: any) => (
      <button onClick={onClick} {...props}>
        {children}
      </button>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

// Mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  X: () => <span data-testid="x-icon">X</span>,
  Send: () => <span data-testid="send-icon">Send</span>,
  Loader2: () => <span data-testid="loader-icon">Loading</span>,
  Eye: () => <span data-testid="eye-icon">Eye</span>,
  EyeOff: () => <span data-testid="eye-off-icon">EyeOff</span>,
  Upload: () => <span data-testid="upload-icon">Upload</span>,
  Trash2: () => <span data-testid="trash-icon">Trash</span>,
  Image: () => <span data-testid="image-icon">Image</span>,
}))

// Mock global fetch
global.fetch = jest.fn()

describe('CreateThreadModal', () => {
  const mockProps = {
    isOpen: true,
    onClose: jest.fn(),
    clubId: 'test-club-id',
    clubName: 'Test Club',
    onThreadCreated: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders modal when isOpen is true', () => {
    render(<CreateThreadModal {...mockProps} />)
    expect(screen.getByText('Create New Thread')).toBeInTheDocument()
  })

  it('does not render modal when isOpen is false', () => {
    render(<CreateThreadModal {...mockProps} isOpen={false} />)
    expect(screen.queryByText('Create New Thread')).not.toBeInTheDocument()
  })

  it('shows club name in modal', () => {
    render(<CreateThreadModal {...mockProps} />)
    expect(screen.getByText('Test Club')).toBeInTheDocument()
  })

  it('renders title input field', () => {
    render(<CreateThreadModal {...mockProps} />)
    expect(screen.getByLabelText('Thread Title')).toBeInTheDocument()
  })

  it('renders content textarea', () => {
    render(<CreateThreadModal {...mockProps} />)
    expect(screen.getByLabelText('Thread Content')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    render(<CreateThreadModal {...mockProps} />)
    const closeButton = screen.getByTestId('x-icon').closest('button')
    fireEvent.click(closeButton!)
    expect(mockProps.onClose).toHaveBeenCalled()
  })

  it('allows typing in title input', () => {
    render(<CreateThreadModal {...mockProps} />)
    const titleInput = screen.getByLabelText('Thread Title') as HTMLInputElement
    fireEvent.change(titleInput, { target: { value: 'Test Thread Title' } })
    expect(titleInput.value).toBe('Test Thread Title')
  })

  it('allows typing in content textarea', () => {
    render(<CreateThreadModal {...mockProps} />)
    const contentTextarea = screen.getByLabelText('Thread Content') as HTMLTextAreaElement
    fireEvent.change(contentTextarea, { target: { value: 'Test thread content' } })
    expect(contentTextarea.value).toBe('Test thread content')
  })
})
