import bcrypt from "bcryptjs";

/**
 * Hash a password using bcrypt with async/await
 * @param password - Plain text password
 * @param saltRounds - Number of salt rounds (default 10)
 * @returns Hashed password
 */
export async function hashPassword(password: string, saltRounds = 10): Promise<string> {
  try {
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    throw new Error("Failed to hash password");
  }
}

/**
 * Compare a plain text password with a hash
 * @param password - Plain text password
 * @param hash - Hashed password
 * @returns True if password matches hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    throw new Error("Failed to compare passwords");
  }
}
