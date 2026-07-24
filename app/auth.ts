import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

/**
 * Parse AUTH_TRUST_HOST environment variable
 * 
 * Supports three formats:
 * - Not set or 'false': false (default - strict host checking)
 * - 'true': true (trust all hosts - use with reverse proxies like Cloudflare Tunnel)
 * - 'host1,host2': Treated as 'true' for compatibility (NextAuth v5 only supports boolean)
 * 
 * Note: NextAuth v5's trustHost only accepts boolean values. If specific hosts are needed,
 * they should be validated in a custom authorized callback instead.
 * 
 * @returns boolean - NextAuth trustHost configuration
 */
function getTrustHostConfig(): boolean {
  const trustHost = process.env.AUTH_TRUST_HOST;
  
  if (!trustHost || trustHost === 'false') {
    return false; // Default: strict host checking
  }
  
  // Any other value (including 'true' or comma-separated hosts) enables trust
  return true;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: getTrustHostConfig(),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    })
  ],
  pages: {
    signIn: '/auth/signin',  // Custom sign-in page
  },
  callbacks: {
    // Preserve Google's stable user ID across sessions
    jwt({ token, account, profile }) {
      // On first sign-in, use Google's sub as the stable user ID
      if (account && profile?.sub) {
        token.sub = profile.sub  // Google's stable user ID (never changes)
      }
      return token
    },
    session({ session, token }) {
      // Add user ID to session
      if (token.sub) {
        session.user.id = token.sub
      }
      return session
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isProtectedRoute = nextUrl.pathname.startsWith('/profile')
      
      if (isProtectedRoute && !isLoggedIn) {
        return false
      }
      
      return true
    }
  }
})
