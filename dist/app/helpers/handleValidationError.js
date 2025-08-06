"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandleValidationError = void 0;
const HandleValidationError = (err) => {
    let errorSources = [];
    const errors = Object.values(err.errors);
    errors.forEach((errorObj) => errorSources.push({
        path: errorObj.path,
        message: errorObj.message,
    }));
    return {
        status: 400,
        message: 'Validation Error',
        errorSources,
    };
};
exports.HandleValidationError = HandleValidationError;
