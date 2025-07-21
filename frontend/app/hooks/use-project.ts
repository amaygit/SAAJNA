import type { CreateProjectFormData } from "@/components/project/create-project";
import { deleteData, fetchData, postData } from "@/lib/fetch-util";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const UseCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      projectData: CreateProjectFormData;
      workspaceId: string;
    }) =>
      postData(
        `/projects/${data.workspaceId}/create-project`,
        data.projectData
      ),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["workspace", data.workspace],
      });
    },
  });
};

export const UseProjectQuery = (projectId: string) => {
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: () => fetchData(`/projects/${projectId}/tasks`),
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => deleteData(`/projects/${projectId}`),
    onSuccess: (_data, projectId) => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    },
  });
};




export const useGetProjectDetails = (projectId: string | undefined) => {
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => fetchData(`/projects/${projectId}`),
    enabled: !!projectId,
  });
};

export const useInviteProjectMember = () => {
  return useMutation({
    mutationFn: (data: { email: string; role: string; projectId: string }) =>
      postData(`/projects/${data.projectId}/invite-member`, data),
  });
};

export const useAcceptProjectInviteMutation = () => {
  return useMutation({
    mutationFn: (token: string) =>
      postData("/projects/accept-invite-token", { token }),
  });
};

export const useAcceptProjectInviteManualMutation = () => {
  return useMutation({
    mutationFn: (projectId: string) =>
      postData(`/projects/${projectId}/accept-generate-invite`, {}),
  });
};
