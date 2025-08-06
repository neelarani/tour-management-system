"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingService = void 0;
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const payment_interface_1 = require("../payment/payment.interface");
const payment_model_1 = require("../payment/payment.model");
const sslCommerz_service_1 = require("../sslCommerz/sslCommerz.service");
const tour_model_1 = require("../tour/tour.model");
const user_model_1 = require("../user/user.model");
const booking_interface_1 = require("./booking.interface");
const booking_model_1 = require("./booking.model");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const getTransactionId = () => {
    return `tran_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
};
const createBooking = (payload, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const transactionId = getTransactionId();
    const session = yield booking_model_1.Booking.startSession();
    session.startTransaction();
    try {
        const user = yield user_model_1.User.findById(userId);
        if (!(user === null || user === void 0 ? void 0 : user.phone) || !(user === null || user === void 0 ? void 0 : user.address)) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'Please Update Your Profile to Book a Tour.');
        }
        const tour = yield tour_model_1.Tour.findById(payload.tour).select('costFrom');
        if (!(tour === null || tour === void 0 ? void 0 : tour.costFrom)) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'No Tour Cost Found!');
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const amount = Number(tour.costFrom) * Number(payload.guestCount);
        const booking = yield booking_model_1.Booking.create([
            Object.assign({ user: userId, status: booking_interface_1.BOOKING_STATUS.PENDING }, payload),
        ], { session });
        const payment = yield payment_model_1.Payment.create([
            {
                booking: booking[0]._id,
                status: payment_interface_1.PAYMENT_STATUS.UNPAID,
                transactionId: transactionId,
                amount: amount,
            },
        ], { session });
        const updatedBooking = yield booking_model_1.Booking.findByIdAndUpdate(booking[0]._id, { payment: payment[0]._id }, { new: true, runValidators: true, session })
            .populate('user', 'name email phone address')
            .populate('tour', 'title costFrom')
            .populate('payment');
        const userAddress = (updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.user).address;
        const userEmail = (updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.user).email;
        const userPhoneNumber = (updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.user).phone;
        const userName = (updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.user).name;
        const sslPayload = {
            address: userAddress,
            email: userEmail,
            phoneNumber: userPhoneNumber,
            name: userName,
            amount: amount,
            transactionId: transactionId,
        };
        const sslPayment = yield sslCommerz_service_1.SSLService.sslPaymentInit(sslPayload);
        console.log(sslPayment);
        yield session.commitTransaction(); //transaction
        session.endSession();
        return {
            paymentUrl: sslPayment.GatewayPageURL,
            booking: updatedBooking,
        };
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
const getUserBookings = () => __awaiter(void 0, void 0, void 0, function* () {
    return {};
});
const getBookingById = () => __awaiter(void 0, void 0, void 0, function* () {
    return {};
});
const updateBookingStatus = () => __awaiter(void 0, void 0, void 0, function* () {
    return {};
});
const getAllBookings = () => __awaiter(void 0, void 0, void 0, function* () {
    return {};
});
exports.BookingService = {
    createBooking,
    getUserBookings,
    getBookingById,
    updateBookingStatus,
    getAllBookings,
};
