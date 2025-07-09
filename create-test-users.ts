import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "./shared/schema";
import bcrypt from 'bcrypt';

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema });

async function createTestUsers() {
  try {
    console.log('Creating test users...');
    
    const testUsers = [
      {
        id: 'user1',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        subscriptionPlan: 'pro',
        subscriptionStatus: 'active',
        emailLimitPerMonth: 5000
      },
      {
        id: 'user2',
        email: 'jane.smith@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        subscriptionPlan: 'free',
        subscriptionStatus: 'trial',
        emailLimitPerMonth: 500
      },
      {
        id: 'user3',
        email: 'bob.wilson@company.com',
        firstName: 'Bob',
        lastName: 'Wilson',
        subscriptionPlan: 'enterprise',
        subscriptionStatus: 'active',
        emailLimitPerMonth: 50000
      }
    ];
    
    for (const userData of testUsers) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      await db.insert(schema.users).values({
        ...userData,
        passwordHash: hashedPassword,
        isBlocked: false,
        emailVerified: true,
        mfaEnabled: false,
        emailsProcessedThisMonth: Math.floor(Math.random() * 100)
      }).onConflictDoUpdate({
        target: schema.users.id,
        set: {
          ...userData,
          passwordHash: hashedPassword,
          updatedAt: new Date()
        }
      });
      
      console.log(`Created user: ${userData.email}`);
    }
    
    console.log('Test users created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating test users:', error);
    process.exit(1);
  }
}

createTestUsers();