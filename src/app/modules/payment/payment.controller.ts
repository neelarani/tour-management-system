import { HttpStatusCode } from 'axios';
import { envVars } from '../../config/env';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { PaymentService } from './payment.service';
import { SSLService } from '../sslCommerz/sslCommerz.service';

const initPayment = catchAsync(async (req, res) => {
  const bookingId = req.params.bookingId;
  const result = await PaymentService.initPayment(bookingId as string);
  sendResponse(res, {
    status: 201,
    success: true,
    message: 'Payment done successfully',
    data: result,
  });
});
const successPayment = catchAsync(async (req, res) => {
  const query = req.query;
  const result = await PaymentService.successPayment(
    query as Record<string, string>
  );

  if (result.success) {
    res.redirect(
      `${envVars.SSL.SSL_SUCCESS_FRONTEND_URL}?transactionId=${query.transactionId}&message=${result.message}&amount=${query.amount}&status=${query.status}`
    );
  }
});
const failPayment = catchAsync(async (req, res) => {
  const query = req.query;
  const result = await PaymentService.failPayment(
    query as Record<string, string>
  );

  if (!result.success) {
    res.redirect(
      `${envVars.SSL.SSL_FAIL_FRONTEND_URL}?transactionId=${query.transactionId}&message=${result.message}&amount=${query.amount}&status=${query.status}`
    );
  }
});
const cancelPayment = catchAsync(async (req, res) => {
  const query = req.query;
  const result = await PaymentService.cancelPayment(
    query as Record<string, string>
  );

  if (!result.success) {
    res.redirect(
      `${envVars.SSL.SSL_CANCEL_FRONTEND_URL}?transactionId=${query.transactionId}&message=${result.message}&amount=${query.amount}&status=${query.status}`
    );
  }
});

const getInvoiceDownloadUrl = catchAsync(async (req, res) => {
  const { paymentId } = req.params;

  const result = await PaymentService.getInvoiceDownloadUrl(paymentId);

  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Invoice download URL retrieved successfully',
    data: result,
  });
});

const validatePayment = catchAsync(async (req, res) => {
  console.log('ssl ipn', req.body);
  await SSLService.validatePayment(req.body);

  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Payment Validated Succcessfully!',
    data: null,
  });
});

export const PaymentController = {
  initPayment,
  successPayment,
  failPayment,
  cancelPayment,
  getInvoiceDownloadUrl,
  validatePayment,
};
