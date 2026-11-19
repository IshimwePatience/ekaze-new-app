// services/profileService.ts

import { UpdateProfilePhotoResponse } from "@/types/sidebar.types";
import api from "@/lib/api";

export const updateCompanyProfilePhoto = async (
  file: File
): Promise<UpdateProfilePhotoResponse> => {
  const formData = new FormData();
  formData.append("photo", file);

  const response = await api.post<UpdateProfilePhotoResponse>(
    "/company/profile/photo",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  return response.data;
};


export const updateEmployerProfilePhoto = async (file: File): Promise<UpdateProfilePhotoResponse> => {
  const formData = new FormData();
  formData.append('photo', file);
  const response = await api.post<UpdateProfilePhotoResponse>('/employer/profile/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateWorkerProfilePhoto = async (
  file: File
): Promise<UpdateProfilePhotoResponse> => {
  const formData = new FormData();
  formData.append("photo", file);

  const response = await api.post<UpdateProfilePhotoResponse>(
    "/worker/profile/photo",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  return response.data;
};