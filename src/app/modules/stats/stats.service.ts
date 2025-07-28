import { Booking } from '../booking/booking.model';
import { PAYMENT_STATUS } from '../payment/payment.interface';
import { Payment } from '../payment/payment.model';
import { Tour } from '../tour/tour.model';
import { IsActive, IUser } from '../user/user.interface';
import { User } from '../user/user.model';

const now = new Date();

const sevenDaysAgo = new Date(now).setDate(now.getDate() - 7);

const thirtyDaysAgo = new Date(now).setDate(now.getDate() - 30);

const getUserStats = async () => {
  const totalUsersPromise = await User.countDocuments();

  const totalActiveUsersPromise = await User.countDocuments({
    isActive: IsActive.ACTIVE,
  });
  const totalInActiveUsersPromise = await User.countDocuments({
    isActive: IsActive.INACTIVE,
  });
  const totalBlockedUsersPromise = await User.countDocuments({
    isActive: IsActive.BLOCKED,
  });

  const newUsersInLast7DaysPromise = User.countDocuments({
    createdAt: { $gte: sevenDaysAgo },
  });

  const newUsersInLast30DaysPromise = User.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
  });

  const usersByRolePromise = User.aggregate([
    // stage-1: Grouping users by role and count total users in each role

    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
      },
    },
  ]);
  const [
    totalUsers,
    totalActiveUsers,
    totalInActiveUsers,
    totalBlockedUsers,
    newUsersInLast7Days,
    newUsersInLast30Days,
    usersByRole,
  ] = await Promise.all([
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
};

const getTourStats = async () => {
  const totalTourPromise = Tour.countDocuments();
  const totalTourByTourTypePromise = Tour.aggregate([
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

  const avgTourCostPromise = Tour.aggregate([
    //  stage-1: group the cost from and average the sum
    {
      $group: {
        _id: null,
        avgCostFrom: { $avg: '$costFrom' },
      },
    },
  ]);

  const totalTourByDivisionPromise = Tour.aggregate([
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

  const totalHighestBookedTourPromise = Booking.aggregate([
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

  const [
    totalTour,
    totalTourByTourType,
    avgTourCost,
    totalTourByDivision,
    totalHighestBookedTour,
  ] = await Promise.all([
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
};

const getBookingStats = async () => {
  const totalBookingPromise = Booking.countDocuments();

  const totalBookingByStatsPromise = Booking.aggregate([
    // stage -1 : group stage
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const bookingsPerTourPromise = Booking.aggregate([
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

  const avgGuestCountPerBookingPromise = Booking.aggregate([
    // state-1 : group stage
    {
      $group: {
        _id: null,
        avgGuestCount: { $avg: '$guestCount' },
      },
    },
  ]);

  const bookingsLast7DaysPromise = Booking.countDocuments({
    createdAt: { $gte: sevenDaysAgo },
  });
  const bookingsLast30DaysPromise = Booking.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
  });

  const totalBookingsByUniqueUsersPromise = Booking.distinct('user').then(
    (user: any) => user.length
  );

  const [
    totalBooking,
    totalBookingByStats,
    bookingsPerTour,
    avgGuestCountPerBooking,
    bookingsLast7Days,
    bookingsLast30Days,
    totalBookingsByUniqueUsers,
  ] = await Promise.all([
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
};

const getPaymentStats = async () => {
  const totalPaymentPromise = Payment.countDocuments();

  const totalPaymentByStatusPromise = Payment.aggregate([
    // stage 1 group
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const totalRevenuePromise = Payment.aggregate([
    // stage: match stage
    {
      $match: {
        status: PAYMENT_STATUS.PAID,
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$amount' },
      },
    },
  ]);

  const avgPaymentAmountPromise = Payment.aggregate([
    // stage 1 group stage

    {
      $group: {
        _id: null,
        avgPaymentAmount: { $avg: '$amount' },
      },
    },
  ]);

  const paymentGatewayDataPromise = Payment.aggregate([
    // stage-1: group stage
    {
      $group: {
        _id: { $ifNull: ['$paymentGatewayData.status', 'UNKNOWN'] },
        count: { $sum: 1 },
      },
    },
  ]);

  const [
    totalPayment,
    totalRevenue,
    totalPaymentByStatus,
    avgPaymentAmount,
    paymentGatewayData,
  ] = await Promise.all([
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
};

export const StatsService = {
  getBookingStats,
  getPaymentStats,
  getTourStats,
  getUserStats,
};
