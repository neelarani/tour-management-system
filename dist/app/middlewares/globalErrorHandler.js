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
exports.globalErrorHandler = void 0;
const env_1 = require("../config/env");
const AppError_1 = __importDefault(require("../errorHelpers/AppError"));
const handleDuplicateError_1 = require("../helpers/handleDuplicateError");
const handleCastError_1 = require("../helpers/handleCastError");
const handleValidationError_1 = require("../helpers/handleValidationError");
const handleZodError_1 = require("../helpers/handleZodError");
const cloudinary_config_1 = require("../config/cloudinary.config");
const globalErrorHandler = (err, req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (env_1.envVars.NODE_ENV === 'development') {
        console.log(err);
    }
    if (req.file) {
        yield (0, cloudinary_config_1.deleteImageFromCloudinary)(req.file.path);
    }
    if (req.files && Array.isArray(req.file) && req.files.length) {
        const imageUrls = req.files.map(file => file.path);
        yield Promise.all(imageUrls.map(url => (0, cloudinary_config_1.deleteImageFromCloudinary)(url)));
    }
    let errorSources = [];
    let status = 500;
    // let msg = err instanceof Error && err.message;
    let msg = 'Something went wrong';
    // Duplicate error
    if (err.code === 11000) {
        const simplifiedError = (0, handleDuplicateError_1.handlerDuplicateError)(err);
        status = simplifiedError.status;
        msg = simplifiedError.message;
    }
    // Object id error / cast error
    else if (err.name === 'CastError') {
        const simplifiedError = (0, handleCastError_1.handleCastError)(err);
        status = simplifiedError.status;
        msg = simplifiedError.message;
    }
    // Mongoose Validation Error
    else if (err.name === 'validationError') {
        const simplifiedError = (0, handleValidationError_1.HandleValidationError)(err);
        status = simplifiedError.status;
        errorSources = simplifiedError.errorSources;
        msg = simplifiedError.message;
    }
    // Zod Error
    else if (err.name === 'zodError') {
        const simplifiedError = (0, handleZodError_1.handleZodError)(err);
        status = simplifiedError.status;
        msg = simplifiedError.message;
        errorSources = simplifiedError.errorSources;
    }
    else if (err instanceof AppError_1.default) {
        status = err.statusCode;
        msg = err.message;
    }
    else if (err instanceof Error) {
        status = 500;
        msg = err.message;
    }
    res.status(status).json({
        success: false,
        msg,
        errorSources,
        err: env_1.envVars.NODE_ENV === 'development' ? err : null,
        stack: env_1.envVars.NODE_ENV === 'development'
            ? err.stack.split('\n')
            : null,
    });
});
exports.globalErrorHandler = globalErrorHandler;
