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

async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await db.insert(schema.users).values({
      id: 'admin',
      email: 'admin@zema.com',
      firstName: 'Admin',
      lastName: 'User',
      passwordHash: hashedPassword,
      subscriptionPlan: 'enterprise',
      subscriptionStatus: 'active',
      emailLimitPerMonth: 100000,
      isBlocked: false,
      emailVerified: true,
      mfaEnabled: false
    }).onConflictDoUpdate({
      target: schema.users.id,
      set: {
        passwordHash: hashedPassword,
        subscriptionPlan: 'enterprise',
        subscriptionStatus: 'active',
        emailLimitPerMonth: 100000,
        isBlocked: false,
        updatedAt: new Date()
      }
    });
    
    console.log('Admin user created successfully!');
    console.log('Email: admin@zema.com');
    console.log('Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();