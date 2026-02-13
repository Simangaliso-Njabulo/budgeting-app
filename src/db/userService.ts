import bcrypt from 'bcryptjs';
import { db, type DbUser } from './database';
import { seedUserData } from './seedData';

const CURRENT_USER_KEY = 'currentUserId';

function setCurrentUserId(id: string | null) {
  if (id) {
    localStorage.setItem(CURRENT_USER_KEY, id);
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

export function getCurrentUserId(): string | null {
  return localStorage.getItem(CURRENT_USER_KEY);
}

export const userService = {
  /**
   * Register a new user. Hashes the password and seeds default data.
   */
  async register(name: string, email: string, password: string): Promise<DbUser> {
    // Check if email already exists
    const existing = await db.users.where('email').equals(email).first();
    if (existing) {
      throw new Error('An account with this email already exists');
    }

    const now = new Date();
    const passwordHash = await bcrypt.hash(password, 10);

    const user: DbUser = {
      id: crypto.randomUUID(),
      email,
      passwordHash,
      name,
      currency: 'ZAR',
      theme: 'dark',
      accentColor: 'purple',
      monthlyIncome: 20000,
      savingsTarget: 5000,
      payDate: 1,
      createdAt: now,
      updatedAt: now,
    };

    await db.users.add(user);

    // Seed default categories, buckets, and monthly income
    await seedUserData(user.id);

    return user;
  },

  /**
   * Login with email and password. Returns the user on success.
   */
  async login(email: string, password: string): Promise<DbUser> {
    const user = await db.users.where('email').equals(email).first();
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new Error('Invalid email or password');
    }

    setCurrentUserId(user.id);
    return user;
  },

  /**
   * Reset password for a given email.
   */
  async resetPassword(email: string, newPassword: string): Promise<void> {
    const user = await db.users.where('email').equals(email).first();
    if (!user) {
      throw new Error('No account found with this email');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db.users.update(user.id, {
      passwordHash,
      updatedAt: new Date(),
    });
  },

  /**
   * Get the current logged-in user.
   */
  async getMe(): Promise<DbUser> {
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const user = await db.users.get(userId);
    if (!user) {
      setCurrentUserId(null);
      throw new Error('User not found');
    }

    return user;
  },

  /**
   * Update user profile / settings.
   */
  async update(
    userId: string,
    data: Partial<Omit<DbUser, 'id' | 'email' | 'passwordHash' | 'createdAt'>>
  ): Promise<DbUser> {
    await db.users.update(userId, {
      ...data,
      updatedAt: new Date(),
    });

    const user = await db.users.get(userId);
    if (!user) throw new Error('User not found');
    return user;
  },

  /**
   * Logout the current user.
   */
  logout(): void {
    setCurrentUserId(null);
  },
};
