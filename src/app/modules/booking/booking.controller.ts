import { JwtPayload } from 'jsonwebtoken';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { BookingService } from './booking.service';

const createBooking = catchAsync(async (req, res) => {
  const decodeToken = req.user as JwtPayload;
  const booking = await BookingService.createBooking(
    req.body,
    decodeToken.userId
  );

  sendResponse(res, {
    status: 201,
    success: true,
    message: 'Booking created successfully',
    data: booking,
  });
});

const getUserBookings = catchAsync(async (req, res) => {
  const bookings = await BookingService.getUserBookings();
  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Bookings retrieved successfully',
    data: bookings,
  });
});

const getSingleBooking = catchAsync(async (req, res) => {
  const booking = await BookingService.getBookingById();

  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Booking retrieved successfully',
    data: booking,
  });
});

const getAllBookings = catchAsync(async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const bookings = await BookingService.getAllBookings();
  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Bookings retrieved successfully',
    data: {},
    // meta: {},
  });
});

const updateBookingStatus = catchAsync(async (req, res) => {
  const updated = await BookingService.updateBookingStatus();
  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Booking Status Updated Successfully',
    data: updated,
  });
});

export const BookingController = {
  createBooking,
  getAllBookings,
  getSingleBooking,
  getUserBookings,
  updateBookingStatus,
};
