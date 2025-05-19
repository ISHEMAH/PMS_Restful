import { Router } from "express";
import {
  bookSlot,
  getAllBookings,
  approveBooking,
  declineBooking,
} from "../controllers/booking.controller";
import protect from "../middleware/auth";

const router = Router();

router.post("/book", protect, bookSlot);
router.get("/admin/bookings", protect, getAllBookings);
router.put("/admin/bookings/:bookingId/approve", protect, approveBooking);
router.put("/admin/bookings/:bookingId/decline", protect, declineBooking);

export default router;
