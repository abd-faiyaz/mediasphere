import { render, screen } from '@testing-library/react'
import { LoadingSpinner, PageLoader } from '@/components/ui/loading'

describe('Loading Components', () => {
  describe('LoadingSpinner', () => {
    it('renders with default size and no text', () => {
      render(<LoadingSpinner data-testid="loading-spinner" />)
      const spinner = screen.getByTestId('loading-spinner')
      expect(spinner).toBeInTheDocument()
      expect(spinner.querySelector('div')).toHaveClass('h-8', 'w-8')
    })

    it('renders with small size', () => {
      render(<LoadingSpinner size="sm" data-testid="loading-spinner" />)
      const spinner = screen.getByTestId('loading-spinner')
      expect(spinner.querySelector('div')).toHaveClass('h-4', 'w-4')
    })

    it('renders with medium size (default)', () => {
      render(<LoadingSpinner size="md" data-testid="loading-spinner" />)
      const spinner = screen.getByTestId('loading-spinner')
      expect(spinner.querySelector('div')).toHaveClass('h-8', 'w-8')
    })

    it('renders with large size', () => {
      render(<LoadingSpinner size="lg" data-testid="loading-spinner" />)
      const spinner = screen.getByTestId('loading-spinner')
      expect(spinner.querySelector('div')).toHaveClass('h-12', 'w-12')
    })

    it('renders with text', () => {
      render(<LoadingSpinner text="Loading data..." />)
      expect(screen.getByText('Loading data...')).toBeInTheDocument()
    })

    it('renders without text when not provided', () => {
      render(<LoadingSpinner />)
      expect(screen.queryByText(/Loading/)).not.toBeInTheDocument()
    })

    it('has correct structure and classes', () => {
      render(<LoadingSpinner text="Loading..." data-testid="loading-spinner" />)
      const container = screen.getByTestId('loading-spinner')
      expect(container).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center')
      
      const spinnerElement = container.querySelector('div')
      expect(spinnerElement).toHaveClass('animate-spin', 'rounded-full', 'border-b-2', 'border-blue-600')
      
      const text = screen.getByText('Loading...')
      expect(text).toHaveClass('mt-2', 'text-sm', 'text-gray-600')
    })
  })

  describe('PageLoader', () => {
    it('renders with default text', () => {
      render(<PageLoader data-testid="page-loader" />)
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('renders with custom text', () => {
      render(<PageLoader text="Please wait while we load your data" />)
      expect(screen.getByText('Please wait while we load your data')).toBeInTheDocument()
    })

    it('has correct page loader structure', () => {
      render(<PageLoader data-testid="page-loader" />)
      const container = screen.getByTestId('page-loader')
      expect(container).toHaveClass('min-h-screen', 'bg-gray-50', 'flex', 'items-center', 'justify-center')
    })

    it('renders text in LoadingSpinner', () => {
      render(<PageLoader text="Initializing..." />)
      expect(screen.getByText('Initializing...')).toBeInTheDocument()
    })
  })

  describe('Integration Tests', () => {
    it('LoadingSpinner with all size variants', () => {
      const { rerender } = render(<LoadingSpinner size="sm" text="Small" />)
      expect(screen.getByText('Small')).toBeInTheDocument()
      
      rerender(<LoadingSpinner size="md" text="Medium" />)
      expect(screen.getByText('Medium')).toBeInTheDocument()
      
      rerender(<LoadingSpinner size="lg" text="Large" />)
      expect(screen.getByText('Large')).toBeInTheDocument()
    })

    it('PageLoader with different text values', () => {
      const { rerender } = render(<PageLoader text="Loading..." />)
      expect(screen.getByText('Loading...')).toBeInTheDocument()
      
      rerender(<PageLoader text="Authenticating..." />)
      expect(screen.getByText('Authenticating...')).toBeInTheDocument()
      
      rerender(<PageLoader text="Fetching data..." />)
      expect(screen.getByText('Fetching data...')).toBeInTheDocument()
    })
  })
})
