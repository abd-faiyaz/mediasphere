import { clerkMiddleware } from '@clerk/nextjs/server';

// Validate Clerk environment variables
export function validateClerkKeys() {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const secretKey = process.env.CLERK_SECRET_KEY;

  if (!publishableKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY environment variable'
    );
  }

  if (!secretKey) {
    throw new Error('Missing CLERK_SECRET_KEY environment variable');
  }

  return { publishableKey, secretKey };
}

// Export clerk middleware with proper configuration
export const authMiddleware = clerkMiddleware();

export default authMiddleware;
