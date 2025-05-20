import { Request, Response } from 'express';
import { prisma } from '../types/prisma';
import { VehicleType } from '@prisma/client';

interface VehicleInput {
  plateNumber: string;
  type: VehicleType;
}

const createVehicle = async (req: Request, res: Response) => {
  try {
    const { plateNumber, type } = req.body as VehicleInput;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        plateNumber,
        type,
        ownerId: userId
      }
    });
    res.status(201).json(vehicle);
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'An error occurred'
    });
  }
};

const getVehicles = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const vehicles = await prisma.vehicle.findMany({
      where: {
        ownerId: userId
      }
    });
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'An error occurred'
    });
  }
};

const updateVehicle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { plateNumber, type } = req.body as Partial<VehicleInput>;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Check if vehicle belongs to user
    const existingVehicle = await prisma.vehicle.findFirst({
      where: {
        id,
        ownerId: userId
      }
    });

    if (!existingVehicle) {
      return res.status(404).json({ error: 'Vehicle not found or not owned by user' });
    }

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        plateNumber,
        type
      }
    });
    res.json(vehicle);
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'An error occurred'
    });
  }
};

const deleteVehicle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Check if vehicle belongs to user
    const existingVehicle = await prisma.vehicle.findFirst({
      where: {
        id,
        ownerId: userId
      }
    });

    if (!existingVehicle) {
      return res.status(404).json({ error: 'Vehicle not found or not owned by user' });
    }

    await prisma.vehicle.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'An error occurred'
    });
  }
};

export { createVehicle, getVehicles, updateVehicle, deleteVehicle };
