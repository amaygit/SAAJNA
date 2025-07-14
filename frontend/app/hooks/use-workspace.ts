import type { WorkspaceForm } from "@/components/workspace/create-workspace"
import { deleteData, fetchData, postData, updateData } from "@/lib/fetch-util"
import { useMutation, useQuery } from "@tanstack/react-query"

export const useCreateWorkspace=() => {
    return useMutation({
        mutationFn:async(data:WorkspaceForm)=>postData("/workspaces", data),
    })
}

export const useGetWorkspacesQuery = () => {
    return useQuery({
        queryKey: ["workspaces"],
        queryFn: async () => fetchData("/workspaces"),
    })
}

export const useGetWorkspaceQuery = (workspaceId: string) => {
  return useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: async () => fetchData(`/workspaces/${workspaceId}/projects`),
  });
};  

export const useGetWorkspaceStatsQuery = (workspaceId: string, p0: { enabled: boolean }) => {
  return useQuery({
    queryKey: ["workspace", workspaceId, "stats"],
    queryFn: async () => fetchData(`/workspaces/${workspaceId}/stats`),
  });
};
export const useGetWorkspaceDetailsQuery = (workspaceId: string) => {
  return useQuery({
    queryKey: ["workspace", workspaceId, "details"],
    queryFn: async () => fetchData(`/workspaces/${workspaceId}`),
  });
};
export const useUpdateWorkspace = (workspaceId: string) => {
  return useMutation({
    mutationFn: async (data: WorkspaceForm) =>
      updateData(`/workspaces/${workspaceId}`, data),
  });
};

export const useDeleteWorkspace = () => {
  return useMutation({
    mutationFn: async (workspaceId: string) =>
      deleteData(`/workspaces/${workspaceId}`),
  });
};
