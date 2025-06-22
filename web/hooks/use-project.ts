import { mockApi } from '@/lib/mock-data'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => mockApi.getProjects(),
  })
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => mockApi.getProject(id),
    enabled: !!id,
  })
}

export function useProjectComments(projectId: string) {
  return useQuery({
    queryKey: ['project-comments', projectId],
    queryFn: () => mockApi.getProjectComments(projectId),
    enabled: !!projectId,
  })
}

export function usePostComment() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ projectId, content }: { projectId: string; content: string }) =>
      mockApi.postComment(projectId, content),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['project-comments', projectId] })
    },
  })
}

export function useLikeComment() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (commentId: number) => mockApi.likeComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-comments'] })
    },
  })
}

export function useLeaderboard() {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => mockApi.getLeaderboard(),
  })
}

export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: () => mockApi.getUser(),
  })
}

export function useUserActivity() {
  return useQuery({
    queryKey: ['user-activity'],
    queryFn: () => mockApi.getUserActivity(),
  })
} 