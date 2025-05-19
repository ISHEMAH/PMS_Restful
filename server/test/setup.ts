import { PrismaClient } from '@prisma/client';
import app from '../src/server';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { describe, before, after, it } from 'mocha';

const prisma = new PrismaClient();

// Clear database before tests
before(async () => {
  await prisma.$executeRaw`TRUNCATE TABLE "User" CASCADE;`;
  await prisma.$executeRaw`TRUNCATE TABLE "Vehicle" CASCADE;`;
  await prisma.$executeRaw`TRUNCATE TABLE "Slot" CASCADE;`;
  await prisma.$executeRaw`TRUNCATE TABLE "Booking" CASCADE;`;
});

// Close database connection after tests
after(async () => {
  await prisma.$disconnect();
});

export const testRequest = request(app);

// Test data
export const testData = {
  user: {
    name: 'Test User',
    email: `user@${uuidv4()}.com`,
    password: 'User@123',
    role: 'user'
  },
  admin: {
    name: 'Test Admin',
    email: `admin@${uuidv4()}.com`,
    password: 'Admin@123',
    role: 'admin'
  },
  vehicle: {
    licensePlate: `TEST-${uuidv4().substring(0, 6)}`,
    type: 'car',
    color: 'blue'
  },
  slot: {
    number: `SLOT-${uuidv4().substring(0, 4)}`,
    type: 'car',
    status: 'available'
  },
  booking: {
    slotId: 1,
    vehicleId: '12345678-1234-1234-1234-123456789012',
    userId: '12345678-1234-1234-1234-123456789012',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
  }
};

// Clean up function
export async function cleanup() {
  await prisma.booking.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();
  await prisma.slot.deleteMany();
  await prisma.analytics.deleteMany();
}
