import { db } from './server/db.js';
import { users } from './shared/schema.js';
import { eq } from 'drizzle-orm';

async function deleteUserByEmail(email: string): Promise<void> {
  try {
    console.log(`Looking for user with email: ${email}`);
    
    // First, find the user by email
    const [user] = await db.select().from(users).where(eq(users.email, email));
    
    if (!user) {
      console.log(`User with email ${email} not found.`);
      return;
    }
    
    console.log(`Found user: ${user.email} (ID: ${user.id})`);
    
    // Delete the user
    await db.delete(users).where(eq(users.id, user.id));
    
    console.log(`✓ User ${email} has been successfully deleted.`);
  } catch (error) {
    console.error('Error deleting user:', error);
  }
}

// Delete the specified user
await deleteUserByEmail('clunardini@hotmail.com');
process.exit(0);