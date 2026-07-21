/**
 * Verify admin password
 * Used only for initial login - JWT authentication used for subsequent requests
 */
export function verifyPassword(password: string): boolean {
  return password === process.env.ADMIN_PASSWORD;
}
