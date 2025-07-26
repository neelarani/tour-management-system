import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { IDivision } from './division.interface';
import { DivisionService } from './division.service';

const createDivision = catchAsync(async (req, res) => {
  const payload: IDivision = {
    ...req.body,
    thumbnail: req.file?.path,
  };

  const result = await DivisionService.createDivision(payload);

  sendResponse(res, {
    status: 201,
    success: true,
    message: 'Division created',
    data: result,
  });
});

const getAllDivisions = catchAsync(async (req, res) => {
  const result = await DivisionService.getAllDivisions(
    req.query as Record<string, string>
  );

  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Divisions retrieved',
    data: result.data,
    meta: result.meta,
  });
});

const getSingleDivision = catchAsync(async (req, res) => {
  const slug = req.params.slug;
  const result = await DivisionService.getSingleDivision(slug);

  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Divisions retrieved',
    data: result.data,
  });
});

const updateDivision = catchAsync(async (req, res) => {
  const id = req.params.id;

  const payload: IDivision = {
    ...req.body,
    thumbnail: req.file?.path,
  };

  const result = await DivisionService.updateDivision(id, payload);

  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Division updated',
    data: result,
  });
});

const deleteDivision = catchAsync(async (req, res) => {
  const result = await DivisionService.deleteDivision(req.params.id);

  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Division deleted',
    data: result,
  });
});

export const DivisionCotroller = {
  createDivision,
  getAllDivisions,
  getSingleDivision,
  updateDivision,
  deleteDivision,
};
