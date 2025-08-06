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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsService = void 0;
const booking_model_1 = require("../booking/booking.model");
const payment_interface_1 = require("../payment/payment.interface");
const payment_model_1 = require("../payment/payment.model");
const tour_model_1 = require("../tour/tour.model");
const user_interface_1 = require("../user/user.interface");
const user_model_1 = require("../user/user.model");
const now = new Date();
const sevenDaysAgo = new Date(now).setDate(now.getDate() - 7);
const thirtyDaysAgo = new Date(now).setDate(now.getDate() - 30);
const getUserStats = () => __awaiter(void 0, void 0, void 0, function* () {
    const totalUsersPromise = yield user_model_1.User.countDocuments();
    const totalActiveUsersPromise = yield user_model_1.User.countDocuments({
        isActive: user_interface_1.IsActive.ACTIVE,
    });
    const totalInActiveUsersPromise = yield user_model_1.User.countDocuments({
        isActive: user_interface_1.IsActive.INACTIVE,
    });
    const totalBlockedUsersPromise = yield user_model_1.User.countDocuments({
        isActive: user_interface_1.IsActive.BLOCKED,
    });
    const newUsersInLast7DaysPromise = user_model_1.User.countDocuments({
        createdAt: { $gte: sevenDaysAgo },
    });
    const newUsersInLast30DaysPromise = user_model_1.User.countDocuments({
        createdAt: { $gte: thirtyDaysAgo },
    });
    const usersByRolePromise = user_model_1.User.aggregate([
        // stage-1: Grouping users by role and count total users in each role
        {
            $group: {
                _id: '$role',
                count: { $sum: 1 },
            },
        },
    ]);
    const [totalUsers, totalActiveUsers, totalInActiveUsers, totalBlockedUsers, newUsersInLast7Days, newUsersInLast30Days, usersByRole,] = yield Promise.all([
        totalUsersPromise,
        totalActiveUsersPromise,
        totalInActiveUsersPromise,
        totalBlockedUsersPromise,
        newUsersInLast7DaysPromise,
        newUsersInLast30DaysPromise,
        usersByRolePromise,
    ]);
    return {
        totalUsers,
        totalActiveUsers,
        totalInActiveUsers,
        totalBlockedUsers,
        newUsersInLast7Days,
        newUsersInLast30Days,
        usersByRole,
    };
});
const getTourStats = () => __awaiter(void 0, void 0, void 0, function* () {
    const totalTourPromise = tour_model_1.Tour.countDocuments();
    const totalTourByTourTypePromise = tour_model_1.Tour.aggregate([
        // stage-1 : connect Tour Type model - lookup stage
        {
            $lookup: {
                from: 'tourtypes',
                localField: 'tourType',
                foreignField: '_id',
                as: 'type',
            },
        },
        // stage -2 : unwind the array to object
        {
            $unwind: '$type',
        },
        // stage-3: grouping tour type
        {
            $group: {
                _id: '$type.name',
                count: { $sum: 1 },
            },
        },
    ]);
    const avgTourCostPromise = tour_model_1.Tour.aggregate([
        //  stage-1: group the cost from and average the sum
        {
            $group: {
                _id: null,
                avgCostFrom: { $avg: '$costFrom' },
            },
        },
    ]);
    const totalTourByDivisionPromise = tour_model_1.Tour.aggregate([
        // stage-1 : connect Division model - lookup stage
        {
            $lookup: {
                from: 'divisions',
                localField: 'division',
                foreignField: '_id',
                as: 'division',
            },
        },
        //stage - 2 : unwind the array to object
        {
            $unwind: '$division',
        },
        //stage - 3 : grouping tour type
        {
            $group: {
                _id: '$division.name',
                count: { $sum: 1 },
            },
        },
    ]);
    const totalHighestBookedTourPromise = booking_model_1.Booking.aggregate([
        // stage-1 : Group the tour
        {
            $group: {
                _id: '$tour',
                bookingCount: { $sum: 1 },
            },
        },
        //stage-2 : sort the tour
        {
            $sort: { bookingCount: -1 },
        },
        //stage-3 : sort
        {
            $limit: 5,
        },
        //stage-4 lookup stage
        {
            $lookup: {
                from: 'tours',
                let: { tourId: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ['$_id', '$$tourId'] },
                        },
                    },
                ],
                as: 'tour',
            },
        },
        //stage-5 unwind stage
        { $unwind: '$tour' },
        //stage-6 Project stage
        {
            $project: {
                bookingCount: 1,
                'tour.title': 1,
                'tour.slug': 1,
            },
        },
    ]);
    const [totalTour, totalTourByTourType, avgTourCost, totalTourByDivision, totalHighestBookedTour,] = yield Promise.all([
        totalTourPromise,
        totalTourByTourTypePromise,
        avgTourCostPromise,
        totalTourByDivisionPromise,
        totalHighestBookedTourPromise,
    ]);
    return {
        totalTour,
        totalTourByTourType,
        avgTourCost,
        totalTourByDivision,
        totalHighestBookedTour,
    };
});
const getBookingStats = () => __awaiter(void 0, void 0, void 0, function* () {
    const totalBookingPromise = booking_model_1.Booking.countDocuments();
    const totalBookingByStatsPromise = booking_model_1.Booking.aggregate([
        // stage -1 : group stage
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
            },
        },
    ]);
    const bookingsPerTourPromise = booking_model_1.Booking.aggregate([
        // stage-1 : group stage
        {
            $group: {
                _id: '$tour',
                bookingCount: { $sum: 1 },
            },
        },
        // stage-2 : sort stage
        {
            $sort: { bookingCount: -1 },
        },
        // stage-3 : limit stage
        {
            $limit: 10,
        },
        // stage-4 : lookup stage
        {
            $lookup: {
                from: 'tours',
                localField: '_id',
                foreignField: '_id',
                as: 'tour',
            },
        },
        // stage-5 : unwind stage
        {
            $unwind: '$tour',
        },
        // stages project stage
        {
            $project: {
                bookingCount: 1,
                _id: 1,
                'tour.title': 1,
                'tour.slug': 1,
            },
        },
    ]);
    const avgGuestCountPerBookingPromise = booking_model_1.Booking.aggregate([
        // state-1 : group stage
        {
            $group: {
                _id: null,
                avgGuestCount: { $avg: '$guestCount' },
            },
        },
    ]);
    const bookingsLast7DaysPromise = booking_model_1.Booking.countDocuments({
        createdAt: { $gte: sevenDaysAgo },
    });
    const bookingsLast30DaysPromise = booking_model_1.Booking.countDocuments({
        createdAt: { $gte: thirtyDaysAgo },
    });
    const totalBookingsByUniqueUsersPromise = booking_model_1.Booking.distinct('user').then((user) => user.length);
    const [totalBooking, totalBookingByStats, bookingsPerTour, avgGuestCountPerBooking, bookingsLast7Days, bookingsLast30Days, totalBookingsByUniqueUsers,] = yield Promise.all([
        totalBookingPromise,
        totalBookingByStatsPromise,
        bookingsPerTourPromise,
        avgGuestCountPerBookingPromise,
        bookingsLast7DaysPromise,
        bookingsLast30DaysPromise,
        totalBookingsByUniqueUsersPromise,
    ]);
    return {
        totalBooking,
        totalBookingByStats,
        bookingsPerTour,
        avgGuestCountPerBooking: avgGuestCountPerBooking[0].avgGuestCount,
        bookingsLast7Days,
        bookingsLast30Days,
        totalBookingsByUniqueUsers,
    };
});
const getPaymentStats = () => __awaiter(void 0, void 0, void 0, function* () {
    const totalPaymentPromise = payment_model_1.Payment.countDocuments();
    const totalPaymentByStatusPromise = payment_model_1.Payment.aggregate([
        // stage 1 group
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
            },
        },
    ]);
    const totalRevenuePromise = payment_model_1.Payment.aggregate([
        // stage: match stage
        {
            $match: {
                status: payment_interface_1.PAYMENT_STATUS.PAID,
            },
        },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: '$amount' },
            },
        },
    ]);
    const avgPaymentAmountPromise = payment_model_1.Payment.aggregate([
        // stage 1 group stage
        {
            $group: {
                _id: null,
                avgPaymentAmount: { $avg: '$amount' },
            },
        },
    ]);
    const paymentGatewayDataPromise = payment_model_1.Payment.aggregate([
        // stage-1: group stage
        {
            $group: {
                _id: { $ifNull: ['$paymentGatewayData.status', 'UNKNOWN'] },
                count: { $sum: 1 },
            },
        },
    ]);
    const [totalPayment, totalRevenue, totalPaymentByStatus, avgPaymentAmount, paymentGatewayData,] = yield Promise.all([
        totalPaymentPromise,
        totalRevenuePromise,
        totalPaymentByStatusPromise,
        avgPaymentAmountPromise,
        paymentGatewayDataPromise,
    ]);
    return {
        totalPayment,
        totalRevenue,
        totalPaymentByStatus,
        avgPaymentAmount,
        paymentGatewayData,
    };
});
exports.StatsService = {
    getBookingStats,
    getPaymentStats,
    getTourStats,
    getUserStats,
};
