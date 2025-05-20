import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const createParkingSchema = z.object({
    code: z.string(),
    name: z.string(),
    location: z.string(),
    totalSpaces: z.number().positive(),
    chargingFeePerHour: z.number().positive(),
});

const updateParkingSchema = createParkingSchema.partial();

export const createParking = async (req: Request, res: Response) => {
    try {
        const adminId = req.user.id; // From auth middleware
        const data = createParkingSchema.parse(req.body);

        const parking = await prisma.parking.create({
            data: {
                ...data,
                availableSpaces: data.totalSpaces,
                adminId,
            },
        });

        // Create slots for the parking
        const slots = Array.from({ length: data.totalSpaces }, (_, i) => ({
            number: i + 1,
            parkingCode: data.code,
            type: 'CAR',
            parkingId: parking.id,
        }));

        await prisma.slot.createMany({
            data: slots,
        });

        res.status(201).json(parking);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getParkings = async (req: Request, res: Response) => {
    try {
        const parkings = await prisma.parking.findMany({
            include: {
                slots: true,
            },
        });
        res.json(parkings);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getParkingById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const parking = await prisma.parking.findUnique({
            where: { id },
            include: {
                slots: true,
            },
        });

        if (!parking) {
            return res.status(404).json({ error: 'Parking not found' });
        }

        res.json(parking);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateParking = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = updateParkingSchema.parse(req.body);

        const parking = await prisma.parking.update({
            where: { id },
            data,
        });

        res.json(parking);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteParking = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // First, delete all associated tickets
        await prisma.ticket.deleteMany({
            where: { parkingId: id }
        });

        // Then delete all associated slots
        await prisma.slot.deleteMany({
            where: { parkingId: id }
        });

        // Finally delete the parking record
        await prisma.parking.delete({
            where: { id }
        });

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting parking:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}; 