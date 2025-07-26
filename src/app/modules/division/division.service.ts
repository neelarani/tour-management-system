import { useQuery } from 'mongoose-qb';
import { deleteImageFromCloudinary } from '../../config/cloudinary.config';
import { IDivision } from './division.interface';
import { Division } from './division.model';

const createDivision = async (payload: IDivision) => {
  const existingDivision = await Division.findOne({ name: payload.name });

  if (existingDivision) {
    throw new Error('A division with this name already exists..');
  }

  const division = await Division.create(payload);
  return division;
};

const getAllDivisions = async (query: Record<string, string>) =>
  await useQuery<IDivision>(Division, query, {
    fields: true,
    sort: true,
    filter: true,
    search: ['name'],
  });

const getSingleDivision = async (slug: string) => {
  const division = await Division.findOne({ slug });
  return {
    data: division,
  };
};

const updateDivision = async (id: string, payload: Partial<IDivision>) => {
  const existingDivision = await Division.findById(id);
  if (!existingDivision) {
    throw new Error('Division not Found!');
  }

  const duplicateDivision = await Division.findOne({
    name: payload.name,
    _id: { $ne: id },
  });

  if (duplicateDivision) {
    throw new Error('A division with this name already exists.');
  }

  const updateDivision = await Division.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (payload.thumbnail && existingDivision.thumbnail) {
    await deleteImageFromCloudinary(existingDivision.thumbnail);
  }
  return updateDivision;
};

const deleteDivision = async (id: string) => {
  await Division.findByIdAndDelete(id);
  return null;
};

export const DivisionService = {
  createDivision,
  getAllDivisions,
  getSingleDivision,
  updateDivision,
  deleteDivision,
};
