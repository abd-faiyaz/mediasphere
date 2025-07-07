import { render, screen } from '@testing-library/react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

describe('Avatar Components', () => {
  describe('Avatar', () => {
    it('renders with default classes', () => {
      render(<Avatar data-testid="avatar" />)
      const avatar = screen.getByTestId('avatar')
      expect(avatar).toBeInTheDocument()
      expect(avatar).toHaveClass('relative', 'flex', 'h-10', 'w-10', 'shrink-0', 'overflow-hidden', 'rounded-full')
    })

    it('renders with custom className', () => {
      render(<Avatar data-testid="avatar" className="custom-class" />)
      const avatar = screen.getByTestId('avatar')
      expect(avatar).toHaveClass('custom-class')
    })

    it('forwards ref correctly', () => {
      const ref = jest.fn()
      render(<Avatar ref={ref} data-testid="avatar" />)
      expect(ref).toHaveBeenCalled()
    })
  })

  describe('AvatarImage', () => {
    it('renders with default classes', () => {
      render(<AvatarImage data-testid="avatar-image" src="/test-image.jpg" alt="Test" />)
      const avatarImage = screen.getByTestId('avatar-image')
      expect(avatarImage).toBeInTheDocument()
      expect(avatarImage).toHaveClass('aspect-square', 'h-full', 'w-full')
    })

    it('renders with custom className', () => {
      render(<AvatarImage data-testid="avatar-image" className="custom-image" src="/test.jpg" alt="Test" />)
      const avatarImage = screen.getByTestId('avatar-image')
      expect(avatarImage).toHaveClass('custom-image')
    })

    it('renders with src and alt attributes', () => {
      render(<AvatarImage src="/test-image.jpg" alt="Test Avatar" />)
      const avatarImage = screen.getByAltText('Test Avatar')
      expect(avatarImage).toHaveAttribute('src', '/test-image.jpg')
    })

    it('forwards ref correctly', () => {
      const ref = jest.fn()
      render(<AvatarImage ref={ref} data-testid="avatar-image" src="/test.jpg" alt="Test" />)
      expect(ref).toHaveBeenCalled()
    })
  })

  describe('AvatarFallback', () => {
    it('renders with default classes', () => {
      render(<AvatarFallback data-testid="avatar-fallback">JD</AvatarFallback>)
      const avatarFallback = screen.getByTestId('avatar-fallback')
      expect(avatarFallback).toBeInTheDocument()
      expect(avatarFallback).toHaveClass('flex', 'h-full', 'w-full', 'items-center', 'justify-center', 'rounded-full', 'bg-muted')
    })

    it('renders with custom className', () => {
      render(<AvatarFallback data-testid="avatar-fallback" className="custom-fallback">JD</AvatarFallback>)
      const avatarFallback = screen.getByTestId('avatar-fallback')
      expect(avatarFallback).toHaveClass('custom-fallback')
    })

    it('renders children correctly', () => {
      render(<AvatarFallback>John Doe</AvatarFallback>)
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = jest.fn()
      render(<AvatarFallback ref={ref} data-testid="avatar-fallback">JD</AvatarFallback>)
      expect(ref).toHaveBeenCalled()
    })
  })

  describe('Integration Tests', () => {
    it('renders complete avatar with image and fallback', () => {
      render(
        <Avatar data-testid="avatar">
          <AvatarImage src="/test-image.jpg" alt="Test User" />
          <AvatarFallback>TU</AvatarFallback>
        </Avatar>
      )
      
      const avatar = screen.getByTestId('avatar')
      expect(avatar).toBeInTheDocument()
      expect(screen.getByAltText('Test User')).toBeInTheDocument()
      expect(screen.getByText('TU')).toBeInTheDocument()
    })

    it('renders avatar with only fallback', () => {
      render(
        <Avatar data-testid="avatar">
          <AvatarFallback>FB</AvatarFallback>
        </Avatar>
      )
      
      const avatar = screen.getByTestId('avatar')
      expect(avatar).toBeInTheDocument()
      expect(screen.getByText('FB')).toBeInTheDocument()
    })
  })
})
