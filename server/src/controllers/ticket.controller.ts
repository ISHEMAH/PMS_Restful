import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const createTicketSchema = z.object({
    vehicleId: z.string(),
    parkingId: z.string(),
});

const updateTicketSchema = z.object({
    exitTime: z.date(),
});

export const createTicket = async (req: Request, res: Response) => {
    try {
        const data = createTicketSchema.parse(req.body);
        const { vehicleId, parkingId } = data;

        // Get parking details
        const parking = await prisma.parking.findUnique({
            where: { id: parkingId },
        });

        if (!parking) {
            return res.status(404).json({ error: 'Parking not found' });
        }

        // Check if parking has available spaces
        if (parking.availableSpaces <= 0) {
            return res.status(400).json({ error: 'No available spaces in this parking' });
        }

        // Generate ticket number
        const ticketNumber = `TKT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Create ticket
        const ticket = await prisma.ticket.create({
            data: {
                ticketNumber,
                vehicleId,
                parkingId,
                entryTime: new Date(),
            },
        });

        // Update parking available spaces
        await prisma.parking.update({
            where: { id: parkingId },
            data: {
                availableSpaces: parking.availableSpaces - 1,
            },
        });

        res.status(201).json(ticket);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateTicket = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = updateTicketSchema.parse(req.body);

        // Get ticket details
        const ticket = await prisma.ticket.findUnique({
            where: { id },
            include: {
                parking: true,
            },
        });

        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        if (ticket.status === 'COMPLETED') {
            return res.status(400).json({ error: 'Ticket already completed' });
        }

        // Calculate duration and amount
        const entryTime = new Date(ticket.entryTime);
        const exitTime = new Date(data.exitTime);
        const durationHours = (exitTime.getTime() - entryTime.getTime()) / (1000 * 60 * 60);
        const amount = durationHours * ticket.parking.chargingFeePerHour;

        // Update ticket
        const updatedTicket = await prisma.ticket.update({
            where: { id },
            data: {
                exitTime: exitTime,
                amount,
                status: 'COMPLETED',
            },
        });

        // Update parking available spaces
        await prisma.parking.update({
            where: { id: ticket.parkingId },
            data: {
                availableSpaces: ticket.parking.availableSpaces + 1,
            },
        });

        res.json(updatedTicket);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getTickets = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate } = req.query;

        const where = {
            ...(startDate && endDate && {
                entryTime: {
                    gte: new Date(startDate as string),
                    lte: new Date(endDate as string),
                },
            }),
        };

        const tickets = await prisma.ticket.findMany({
            where,
            include: {
                vehicle: true,
                parking: true,
            },
        });

        res.json(tickets);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getTicketById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const ticket = await prisma.ticket.findUnique({
            where: { id },
            include: {
                vehicle: true,
                parking: true,
            },
        });

        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        res.json(ticket);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}; 