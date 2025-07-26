import { useQuery } from 'mongoose-qb';
import { deleteImageFromCloudinary } from '../../config/cloudinary.config';
import { ITour, ITourType } from './tour.interface';
import { Tour, TourType } from './tour.model';

const createTour = async (payload: ITour) => {
  const existingTour = await Tour.findOne({ title: payload.title });

  if (existingTour) {
    throw new Error('A tour with this title already exists.');
  }

  const tour = await Tour.create(payload);

  return tour;
};

const getAllTours = async (query: Record<string, string>) => {
  const tour = await useQuery<ITour>(Tour, query, {
    fields: true,
    filter: true,
    paginate: true,
    sort: true,
    search: ['title', 'description', 'slug'],
  });

  return tour;
};

const updateTour = async (id: string, payload: Partial<ITour>) => {
  const existingTour = await Tour.findById(id);
  if (!existingTour) {
    throw new Error('Tour not found.');
  }

  if (
    payload.images &&
    payload.images.length > 0 &&
    existingTour.images &&
    existingTour.images.length > 0
  ) {
    payload.images = [...payload.images, ...existingTour.images];
  }

  if (
    payload.deleteImages &&
    payload.deleteImages.length > 0 &&
    existingTour.images &&
    existingTour.images.length > 0
  ) {
    const restDBImages = existingTour.images.filter(
      imageUrl => !payload.deleteImages?.includes(imageUrl)
    );

    const updatedPayloadImages = (payload.images || [])
      .filter(imageUrl => !payload.deleteImages?.includes(imageUrl))
      .filter(imageUrl => !restDBImages.includes(imageUrl));

    payload.images = [...restDBImages, ...updatedPayloadImages];
  }

  const updatedTour = await Tour.findByIdAndUpdate(id, payload, {
    new: true,
  });

  if (
    payload.deleteImages &&
    payload.deleteImages.length > 0 &&
    existingTour.images &&
    existingTour.images.length > 0
  ) {
    await Promise.all(
      payload.deleteImages.map(url => deleteImageFromCloudinary(url))
    );
  }

  return updateTour;
};

const deleteTour = async (id: string) => {
  return await Tour.findByIdAndDelete(id);
};

// tour type
const createTourType = async (payload: ITourType) => {
  const existingTourType = await TourType.findOne({ name: payload.name });

  if (existingTourType) {
    throw new Error('Tour type already exists.');
  }

  return await TourType.create({ name: payload.name });
};

const getAllTourTypes = async (query: Record<string, string>) =>
  await useQuery<ITourType>(TourType, query, {
    fields: true,
    filter: true,
    paginate: true,
    sort: true,
  });

const updateTourType = async (id: string, payload: ITourType) => {
  const existingTourType = await TourType.findById(id);
  if (!existingTourType) {
    throw new Error('Tour type not found.');
  }

  const updatedTourType = await TourType.findByIdAndUpdate(id, payload, {
    new: true,
  });

  return updatedTourType;
};

const deleteTourType = async (id: string) => {
  const existingTourType = await TourType.findById(id);
  if (!existingTourType) {
    throw new Error('Tour type not found.');
  }

  return await TourType.findByIdAndDelete(id);
};

export const TourService = {
  createTour,
  createTourType,
  deleteTourType,
  updateTourType,
  getAllTourTypes,
  getAllTours,
  updateTour,
  deleteTour,
};
