import { render, screen } from '@testing-library/react'
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card'

// Mock the cn utility function
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}))

describe('Card Components', () => {
  describe('Card', () => {
    it('renders card with default classes', () => {
      render(<Card data-testid="card">Card content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toBeInTheDocument()
      expect(card).toHaveClass('rounded-lg', 'border', 'bg-card', 'text-card-foreground', 'shadow-sm')
    })

    it('applies custom className', () => {
      render(<Card className="custom-class" data-testid="card">Card content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('custom-class')
    })

    it('forwards ref correctly', () => {
      const ref = jest.fn()
      render(<Card ref={ref}>Card content</Card>)
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement))
    })

    it('passes through other props', () => {
      render(<Card data-testid="card" id="test-id">Card content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveAttribute('id', 'test-id')
    })
  })

  describe('CardHeader', () => {
    it('renders card header with default classes', () => {
      render(<CardHeader data-testid="card-header">Header content</CardHeader>)
      const header = screen.getByTestId('card-header')
      expect(header).toBeInTheDocument()
      expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6')
    })

    it('applies custom className', () => {
      render(<CardHeader className="custom-header" data-testid="card-header">Header</CardHeader>)
      const header = screen.getByTestId('card-header')
      expect(header).toHaveClass('custom-header')
    })

    it('forwards ref correctly', () => {
      const ref = jest.fn()
      render(<CardHeader ref={ref}>Header content</CardHeader>)
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement))
    })
  })

  describe('CardTitle', () => {
    it('renders card title with default classes', () => {
      render(<CardTitle data-testid="card-title">Title content</CardTitle>)
      const title = screen.getByTestId('card-title')
      expect(title).toBeInTheDocument()
      expect(title).toHaveClass('text-2xl', 'font-semibold', 'leading-none', 'tracking-tight')
    })

    it('applies custom className', () => {
      render(<CardTitle className="custom-title" data-testid="card-title">Title</CardTitle>)
      const title = screen.getByTestId('card-title')
      expect(title).toHaveClass('custom-title')
    })

    it('forwards ref correctly', () => {
      const ref = jest.fn()
      render(<CardTitle ref={ref}>Title content</CardTitle>)
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement))
    })
  })

  describe('CardDescription', () => {
    it('renders card description with default classes', () => {
      render(<CardDescription data-testid="card-description">Description content</CardDescription>)
      const description = screen.getByTestId('card-description')
      expect(description).toBeInTheDocument()
      expect(description).toHaveClass('text-sm', 'text-muted-foreground')
    })

    it('applies custom className', () => {
      render(<CardDescription className="custom-description" data-testid="card-description">Description</CardDescription>)
      const description = screen.getByTestId('card-description')
      expect(description).toHaveClass('custom-description')
    })

    it('forwards ref correctly', () => {
      const ref = jest.fn()
      render(<CardDescription ref={ref}>Description content</CardDescription>)
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement))
    })
  })

  describe('CardContent', () => {
    it('renders card content with default classes', () => {
      render(<CardContent data-testid="card-content">Content</CardContent>)
      const content = screen.getByTestId('card-content')
      expect(content).toBeInTheDocument()
      expect(content).toHaveClass('p-6', 'pt-0')
    })

    it('applies custom className', () => {
      render(<CardContent className="custom-content" data-testid="card-content">Content</CardContent>)
      const content = screen.getByTestId('card-content')
      expect(content).toHaveClass('custom-content')
    })

    it('forwards ref correctly', () => {
      const ref = jest.fn()
      render(<CardContent ref={ref}>Content</CardContent>)
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement))
    })
  })

  describe('CardFooter', () => {
    it('renders card footer with default classes', () => {
      render(<CardFooter data-testid="card-footer">Footer content</CardFooter>)
      const footer = screen.getByTestId('card-footer')
      expect(footer).toBeInTheDocument()
      expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0')
    })

    it('applies custom className', () => {
      render(<CardFooter className="custom-footer" data-testid="card-footer">Footer</CardFooter>)
      const footer = screen.getByTestId('card-footer')
      expect(footer).toHaveClass('custom-footer')
    })

    it('forwards ref correctly', () => {
      const ref = jest.fn()
      render(<CardFooter ref={ref}>Footer content</CardFooter>)
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement))
    })
  })

  describe('Full Card Structure', () => {
    it('renders complete card with all components', () => {
      render(
        <Card data-testid="full-card">
          <CardHeader>
            <CardTitle>Test Card Title</CardTitle>
            <CardDescription>Test card description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Test card content</p>
          </CardContent>
          <CardFooter>
            <button>Test Action</button>
          </CardFooter>
        </Card>
      )

      expect(screen.getByTestId('full-card')).toBeInTheDocument()
      expect(screen.getByText('Test Card Title')).toBeInTheDocument()
      expect(screen.getByText('Test card description')).toBeInTheDocument()
      expect(screen.getByText('Test card content')).toBeInTheDocument()
      expect(screen.getByText('Test Action')).toBeInTheDocument()
    })
  })
})
