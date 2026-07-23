import { auth } from "@/auth"

/**
 * Get current user ID from server-side auth
 * Use in API routes and Server Components
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await auth()
  return session?.user?.id ?? null
}

/**
 * Require authenticated user or throw 401
 * Use in API routes that need authentication
 */
export async function requireAuth(): Promise<string> {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('Unauthorized')
  }
  return userId
}
