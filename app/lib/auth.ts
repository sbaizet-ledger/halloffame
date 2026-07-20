/**
 * Verify admin password
 */
export function verifyPassword(password: string): boolean {
  return password === process.env.ADMIN_PASSWORD;
}
