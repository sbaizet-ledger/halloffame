This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Authentication Setup

This application uses JWT-based session authentication with httpOnly cookies.

### Initial Setup

1. **Generate a secure JWT secret:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

2. **Configure environment variables:**
   
   Create `app/.env.local`:
   ```bash
   ADMIN_PASSWORD=your_admin_password
   JWT_SECRET=<paste_generated_secret_from_step_1>
   ```

3. **Security notes:**
   - Never commit `.env.local` to version control
   - Each deployment should use a unique `JWT_SECRET`
   - Regenerate secret if compromised

### How It Works

- **Login:** Enter admin password once
- **Session:** Valid for 24 hours
- **Persistence:** Session survives page refresh
- **Logout:** Manual logout or automatic after 24h

### For Open Source Users

When deploying your own instance:
1. Generate your own `JWT_SECRET` (never use example values)
2. Set your own `ADMIN_PASSWORD`
3. Keep `.env.local` private and secure

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
