import { render, screen } from '@testing-library/react'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'

// Mock the cn utility function
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}))

// Mock class-variance-authority
jest.mock('class-variance-authority', () => ({
  cva: (base: string, config: any) => {
    return (props: any) => {
      const variant = props?.variant || config.defaultVariants?.variant || 'default'
      const baseClasses = base.split(' ')
      const variantClasses = config.variants?.variant?.[variant]?.split(' ') || []
      return [...baseClasses, ...variantClasses].join(' ')
    }
  }
}))

describe('Alert Components', () => {
  describe('Alert', () => {
    it('renders alert with default variant', () => {
      render(<Alert data-testid="alert">Alert content</Alert>)
      const alert = screen.getByTestId('alert')
      expect(alert).toBeInTheDocument()
      expect(alert).toHaveAttribute('role', 'alert')
      expect(alert).toHaveTextContent('Alert content')
    })

    it('renders alert with destructive variant', () => {
      render(<Alert variant="destructive" data-testid="alert">Error message</Alert>)
      const alert = screen.getByTestId('alert')
      expect(alert).toBeInTheDocument()
      expect(alert).toHaveAttribute('role', 'alert')
      expect(alert).toHaveTextContent('Error message')
    })

    it('applies custom className', () => {
      render(<Alert className="custom-class" data-testid="alert">Custom alert</Alert>)
      const alert = screen.getByTestId('alert')
      expect(alert).toHaveClass('custom-class')
    })

    it('forwards ref correctly', () => {
      const ref = jest.fn()
      render(<Alert ref={ref}>Alert content</Alert>)
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement))
    })

    it('passes through other props', () => {
      render(<Alert data-testid="alert" id="test-id" aria-describedby="description">Alert content</Alert>)
      const alert = screen.getByTestId('alert')
      expect(alert).toHaveAttribute('id', 'test-id')
      expect(alert).toHaveAttribute('aria-describedby', 'description')
    })

    it('handles click events', () => {
      const handleClick = jest.fn()
      render(<Alert onClick={handleClick} data-testid="alert">Clickable alert</Alert>)
      const alert = screen.getByTestId('alert')
      alert.click()
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('AlertTitle', () => {
    it('renders alert title', () => {
      render(<AlertTitle data-testid="alert-title">Alert Title</AlertTitle>)
      const title = screen.getByTestId('alert-title')
      expect(title).toBeInTheDocument()
      expect(title.tagName).toBe('H5')
      expect(title).toHaveTextContent('Alert Title')
    })

    it('applies default classes', () => {
      render(<AlertTitle data-testid="alert-title">Title</AlertTitle>)
      const title = screen.getByTestId('alert-title')
      expect(title).toHaveClass('mb-1', 'font-medium', 'leading-none', 'tracking-tight')
    })

    it('applies custom className', () => {
      render(<AlertTitle className="custom-title" data-testid="alert-title">Title</AlertTitle>)
      const title = screen.getByTestId('alert-title')
      expect(title).toHaveClass('custom-title')
    })

    it('forwards ref correctly', () => {
      const ref = jest.fn()
      render(<AlertTitle ref={ref}>Title</AlertTitle>)
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLHeadingElement))
    })

    it('passes through other props', () => {
      render(<AlertTitle data-testid="alert-title" id="title-id">Title</AlertTitle>)
      const title = screen.getByTestId('alert-title')
      expect(title).toHaveAttribute('id', 'title-id')
    })
  })

  describe('AlertDescription', () => {
    it('renders alert description', () => {
      render(<AlertDescription data-testid="alert-description">Alert description</AlertDescription>)
      const description = screen.getByTestId('alert-description')
      expect(description).toBeInTheDocument()
      expect(description.tagName).toBe('DIV')
      expect(description).toHaveTextContent('Alert description')
    })

    it('applies default classes', () => {
      render(<AlertDescription data-testid="alert-description">Description</AlertDescription>)
      const description = screen.getByTestId('alert-description')
      expect(description).toHaveClass('text-sm', '[&_p]:leading-relaxed')
    })

    it('applies custom className', () => {
      render(<AlertDescription className="custom-description" data-testid="alert-description">Description</AlertDescription>)
      const description = screen.getByTestId('alert-description')
      expect(description).toHaveClass('custom-description')
    })

    it('forwards ref correctly', () => {
      const ref = jest.fn()
      render(<AlertDescription ref={ref}>Description</AlertDescription>)
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement))
    })

    it('passes through other props', () => {
      render(<AlertDescription data-testid="alert-description" id="desc-id">Description</AlertDescription>)
      const description = screen.getByTestId('alert-description')
      expect(description).toHaveAttribute('id', 'desc-id')
    })

    it('renders with paragraph elements', () => {
      render(
        <AlertDescription data-testid="alert-description">
          <p>First paragraph</p>
          <p>Second paragraph</p>
        </AlertDescription>
      )
      const description = screen.getByTestId('alert-description')
      expect(description).toBeInTheDocument()
      expect(screen.getByText('First paragraph')).toBeInTheDocument()
      expect(screen.getByText('Second paragraph')).toBeInTheDocument()
    })
  })

  describe('Complete Alert Structure', () => {
    it('renders complete alert with title and description', () => {
      render(
        <Alert data-testid="complete-alert">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Something went wrong. Please try again.</AlertDescription>
        </Alert>
      )

      const alert = screen.getByTestId('complete-alert')
      expect(alert).toBeInTheDocument()
      expect(alert).toHaveAttribute('role', 'alert')
      expect(screen.getByText('Error')).toBeInTheDocument()
      expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument()
    })

    it('renders destructive alert with title and description', () => {
      render(
        <Alert variant="destructive" data-testid="destructive-alert">
          <AlertTitle>Critical Error</AlertTitle>
          <AlertDescription>This is a critical error that needs immediate attention.</AlertDescription>
        </Alert>
      )

      const alert = screen.getByTestId('destructive-alert')
      expect(alert).toBeInTheDocument()
      expect(screen.getByText('Critical Error')).toBeInTheDocument()
      expect(screen.getByText('This is a critical error that needs immediate attention.')).toBeInTheDocument()
    })

    it('renders alert with only title', () => {
      render(
        <Alert data-testid="title-only-alert">
          <AlertTitle>Info</AlertTitle>
        </Alert>
      )

      const alert = screen.getByTestId('title-only-alert')
      expect(alert).toBeInTheDocument()
      expect(screen.getByText('Info')).toBeInTheDocument()
    })

    it('renders alert with only description', () => {
      render(
        <Alert data-testid="description-only-alert">
          <AlertDescription>This is an informational message.</AlertDescription>
        </Alert>
      )

      const alert = screen.getByTestId('description-only-alert')
      expect(alert).toBeInTheDocument()
      expect(screen.getByText('This is an informational message.')).toBeInTheDocument()
    })

    it('renders alert with custom content', () => {
      render(
        <Alert data-testid="custom-alert">
          <div className="flex items-center">
            <span>Custom content</span>
            <button>Action</button>
          </div>
        </Alert>
      )

      const alert = screen.getByTestId('custom-alert')
      expect(alert).toBeInTheDocument()
      expect(screen.getByText('Custom content')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument()
    })

    it('handles accessibility attributes', () => {
      render(
        <Alert 
          data-testid="accessible-alert" 
          aria-live="polite" 
          aria-atomic="true"
        >
          <AlertTitle>Notification</AlertTitle>
          <AlertDescription>Your changes have been saved.</AlertDescription>
        </Alert>
      )

      const alert = screen.getByTestId('accessible-alert')
      expect(alert).toHaveAttribute('aria-live', 'polite')
      expect(alert).toHaveAttribute('aria-atomic', 'true')
      expect(alert).toHaveAttribute('role', 'alert')
    })
  })
})
