import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
    
        if (credentials?.email) {
          return {
            id: "6a3b6f1782db9028f59c5157", 
            name: "Test User",
            email: credentials.email,
          };
        }
        return null;
      }
    })
  ],
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    }
  },
  pages: {
    signIn: "/signin", // আপনার কাস্টম সাইন-ইন পেজের পাথ
  }
});

export { handler as GET, handler as POST };