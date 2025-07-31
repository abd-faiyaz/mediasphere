import { render, screen, waitFor } from '@testing-library/react'
import { AuthGuard } from '@/components/auth-guard'

// Mock Clerk's useUser hook
const mockPush = jest.fn()
jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn(),
}))

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock PageLoader component
jest.mock('@/components/ui/loading', () => ({
  PageLoader: ({ text }: { text: string }) => (
    <div data-testid="page-loader">{text}</div>
  ),
}))

import { useUser } from '@clerk/nextjs'

const mockUseUser = useUser as jest.MockedFunction<typeof useUser>

describe('AuthGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows loading state when authentication is not loaded', () => {
    mockUseUser.mockReturnValue({
      isSignedIn: false,
      isLoaded: false,
    } as any)

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    )

    expect(screen.getByTestId('page-loader')).toBeInTheDocument()
    expect(screen.getByText('Checking authentication...')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('shows protected content when user is signed in', () => {
    mockUseUser.mockReturnValue({
      isSignedIn: true,
      isLoaded: true,
    } as any)

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
    expect(screen.queryByTestId('page-loader')).not.toBeInTheDocument()
  })

  it('redirects to sign-in when user is not signed in', async () => {
    mockUseUser.mockReturnValue({
      isSignedIn: false,
      isLoaded: true,
    } as any)

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    )

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/sign-in')
    })

    expect(screen.getByTestId('page-loader')).toBeInTheDocument()
    expect(screen.getByText('Redirecting to sign in...')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('shows fallback component when provided and user is not signed in', () => {
    mockUseUser.mockReturnValue({
      isSignedIn: false,
      isLoaded: true,
    } as any)

    render(
      <AuthGuard fallback={<div>Custom Fallback</div>}>
        <div>Protected Content</div>
      </AuthGuard>
    )

    expect(screen.getByText('Custom Fallback')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    expect(screen.queryByText('Redirecting to sign in...')).not.toBeInTheDocument()
  })

  it('handles authentication state changes', async () => {
    // Start with not loaded state
    mockUseUser.mockReturnValue({
      isSignedIn: false,
      isLoaded: false,
    } as any)

    const { rerender } = render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    )

    expect(screen.getByText('Checking authentication...')).toBeInTheDocument()

    // Simulate authentication loaded and user signed in
    mockUseUser.mockReturnValue({
      isSignedIn: true,
      isLoaded: true,
    } as any)

    rerender(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
    expect(screen.queryByTestId('page-loader')).not.toBeInTheDocument()
  })

  it('handles multiple children', () => {
    mockUseUser.mockReturnValue({
      isSignedIn: true,
      isLoaded: true,
    } as any)

    render(
      <AuthGuard>
        <div>First Child</div>
        <div>Second Child</div>
        <span>Third Child</span>
      </AuthGuard>
    )

    expect(screen.getByText('First Child')).toBeInTheDocument()
    expect(screen.getByText('Second Child')).toBeInTheDocument()
    expect(screen.getByText('Third Child')).toBeInTheDocument()
  })

  it('redirects when user becomes unauthenticated', async () => {
    // Start with authenticated user
    mockUseUser.mockReturnValue({
      isSignedIn: true,
      isLoaded: true,
    } as any)

    const { rerender } = render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()

    // Simulate user becoming unauthenticated
    mockUseUser.mockReturnValue({
      isSignedIn: false,
      isLoaded: true,
    } as any)

    rerender(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    )

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/sign-in')
    })
  })
})
