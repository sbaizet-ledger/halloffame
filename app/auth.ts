import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

export const { handlers, signIn, signOut, auth } = NextAuth({
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
