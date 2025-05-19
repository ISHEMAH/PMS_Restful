import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { VehicleType } from '.prisma/client';

interface VehicleInput {
  plateNumber: string;
  type: VehicleType;
  ownerId: string;
}

const createVehicle = async (req: Request, res: Response) => {
  try {
    const { plateNumber, type, ownerId } = req.body as VehicleInput;
    const vehicle = await prisma.vehicle.create({
      data: {
        plateNumber,
        type,
        ownerId,
        slotId: null,
        checkIn: null,
        checkOut: null,
        paid: false
      }
    });
    res.status(201).json(vehicle);
  } catch (error) {
    res.status(400).json({ 
      error: error instanceof Error ? error.message : 'An error occurred',
      details: error instanceof Error ? error.stack : undefined
    });
  }
};

const getVehicles = async (req: Request, res: Response) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        owner: true,
        slot: true
      }
    });
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'An error occurred',
      details: error instanceof Error ? error.stack : undefined
    });
  }
};

const updateVehicle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { plateNumber, type } = req.body as Partial<VehicleInput>;
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
      error: error instanceof Error ? error.message : 'An error occurred',
      details: error instanceof Error ? error.stack : undefined
    });
  }
};

const deleteVehicle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.vehicle.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ 
      error: error instanceof Error ? error.message : 'An error occurred',
      details: error instanceof Error ? error.stack : undefined
    });
  }
};

export { createVehicle, getVehicles, updateVehicle, deleteVehicle };
