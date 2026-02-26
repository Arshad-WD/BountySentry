
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
dotenv.config();

async function main() {
  console.log('--- Prisma Initialization Test ---');
  console.log('DATABASE_URL present:', !!process.env.DATABASE_URL);
  
  try {
    console.log('Attempting new PrismaClient()...');
    const prisma1 = new PrismaClient();
    console.log('Success: new PrismaClient()');
  } catch (e) {
    console.log('Failed: new PrismaClient():', e.message);
  }

  try {
    console.log('Attempting new PrismaClient({ datasourceUrl: ... })...');
    const prisma2 = new PrismaClient({
      datasourceUrl: process.env.DATABASE_URL
    });
    console.log('Success: new PrismaClient({ datasourceUrl: ... })');
  } catch (e) {
    console.log('Failed: new PrismaClient({ datasourceUrl: ... }):', e.message);
  }

  try {
    console.log('Attempting new PrismaClient({ datasources: { db: { url: ... } } })...');
    const prisma3 = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });
    console.log('Success: new PrismaClient({ datasources: { db: { url: ... } } })');
  } catch (e) {
    console.log('Failed: new PrismaClient({ datasources: { db: { url: ... } } }):', e.message);
  }
}

main();
