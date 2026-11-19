import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCompanyProfilePhoto, updateEmployerProfilePhoto, updateWorkerProfilePhoto } from "@/api/profileService"; // ✅ import both
import { useToast } from "@/hooks/use-toast";
import { AxiosError } from "axios";
import { UpdateProfilePhotoResponse } from "@/types/sidebar.types";

interface ErrorResponse {
  message?: string;
}

export const useUpdateEmployerProfilePhoto = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<UpdateProfilePhotoResponse, AxiosError<ErrorResponse>, File>({
    mutationFn: (file: File) => updateEmployerProfilePhoto(file),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["sidebar", "data"] });
      toast({ title: "Success", description: data.message || "Profile photo updated successfully", variant: "success" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error?.response?.data?.message || "Failed to update profile photo", variant: "destructive" });
    },
  });
};

export const useUpdateProfilePhoto = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<UpdateProfilePhotoResponse, AxiosError<ErrorResponse>, File>({ // ✅ explicit generics
    mutationFn: (file: File) => updateCompanyProfilePhoto(file),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["companySidebarData"] });
      toast({
        title: "Success",
        description: data.message || "Profile photo updated successfully",
        variant: "success",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to update profile photo",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateWorkerProfilePhoto = () => { // ✅ defined here, not in sidebar
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<UpdateProfilePhotoResponse, AxiosError<ErrorResponse>, File>({ // ✅ explicit generics
    mutationFn: (file: File) => updateWorkerProfilePhoto(file),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["workerSidebarData"] });
      toast({
        title: "Success",
        description: data.message || "Profile photo updated successfully",
        variant: "success",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to update profile photo",
        variant: "destructive",
      });
    },
  });
};