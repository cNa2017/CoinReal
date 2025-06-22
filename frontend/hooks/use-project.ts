import { api } from '@/lib/wagmi-contract-api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React from 'react'

export function useProjects(offset: number = 0, limit: number = 50) {
  return useQuery({
    queryKey: ['projects', offset, limit],
    queryFn: async () => {
      // Mock API不支持分页，返回所有项目
      const allProjects = await api.getProjects()
      const total = allProjects.length
      const paginatedProjects = allProjects.slice(offset, offset + limit)
      
      return {
        projects: paginatedProjects,
        total,
        hasMore: offset + limit < total
      }
    },
  })
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => api.getProject(id),
    enabled: !!id,
  })
}

export function useProjectComments(projectId: string, offset: number = 0, limit: number = 20) {
  return useQuery({
    queryKey: ['project-comments', projectId, offset, limit],
    queryFn: async () => {
      // Mock API不支持分页，返回所有评论
      const allComments = await api.getProjectComments(projectId)
      const total = allComments.length
      const paginatedComments = allComments.slice(offset, offset + limit)
      
      return {
        comments: paginatedComments,
        total,
        hasMore: offset + limit < total
      }
    },
    enabled: !!projectId,
  })
}

export function usePostComment() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ projectId, content }: { projectId: string; content: string }) =>
      api.postComment(projectId, content),
    onSuccess: (_, { projectId }) => {
      // 使评论查询失效，触发重新获取
      queryClient.invalidateQueries({ queryKey: ['project-comments', projectId] })
      // 同时使项目数据失效（更新评论计数）
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export function useLikeComment(projectId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (commentId: number) => {
      // 使用真实合约API，需要projectId和commentId
      await api.likeComment(projectId, commentId)
    },
    onSuccess: () => {
      // 使相关查询失效
      queryClient.invalidateQueries({ queryKey: ['project-comments', projectId] })
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
    },
  })
}

export function useLeaderboard(sortBy: number = 2, offset: number = 0, limit: number = 10) {
  return useQuery({
    queryKey: ['leaderboard', sortBy, offset, limit],
    queryFn: async () => {
      // Mock API实现简单排序
      const allProjects = await api.getLeaderboard()
      
      // 根据sortBy排序
      let sortedProjects = [...allProjects]
      switch (sortBy) {
        case 0: // 按参与人数
          sortedProjects.sort((a, b) => b.totalParticipants - a.totalParticipants)
          break
        case 1: // 按评论数
          sortedProjects.sort((a, b) => b.totalComments - a.totalComments)
          break
        case 2: // 按奖池金额
          sortedProjects.sort((a, b) => b.poolValueUSD - a.poolValueUSD)
          break
        case 3: // 按最新活动
          sortedProjects.sort((a, b) => b.lastActivityTime - a.lastActivityTime)
          break
      }
      
      const total = sortedProjects.length
      const paginatedProjects = sortedProjects.slice(offset, offset + limit)
      
      return {
        projects: paginatedProjects,
        total,
        hasMore: offset + limit < total
      }
    },
  })
}

export function useUser(userAddress?: string) {
  return useQuery({
    queryKey: ['user', userAddress],
    queryFn: async () => {
      // Mock API不需要地址参数
      const userData = await api.getUser()
      
      // 如果有userAddress，可以在此处进行用户特定的数据获取
      if (userAddress) {
        // await contractApi.getUser(userAddress)
      }
      
      return userData
    },
    enabled: true, // Mock数据总是可用
  })
}

export function useUserActivity(userAddress?: string, offset: number = 0, limit: number = 20) {
  return useQuery({
    queryKey: ['user-activity', userAddress, offset, limit],
    queryFn: async () => {
      // Mock API实现
      const allActivities = await api.getUserActivity()
      const total = allActivities.length
      const paginatedActivities = allActivities.slice(offset, offset + limit)
      
      return {
        activities: paginatedActivities,
        total,
        hasMore: offset + limit < total
      }
    },
  })
}

// 新增：赞助项目Hook
export function useSponsorProject() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      projectAddress, 
      tokenAddress, 
      amount 
    }: { 
      projectAddress: string
      tokenAddress: string
      amount: string 
    }) => {
      // 真实合约调用
      // await contractApi.sponsorProject(projectAddress, tokenAddress, amount)
      
      // Mock实现 - 暂不执行实际操作
      console.log('Mock sponsor project:', { projectAddress, tokenAddress, amount })
    },
    onSuccess: (_, { projectAddress }) => {
      // 使项目数据失效，更新奖池信息
      queryClient.invalidateQueries({ queryKey: ['project', projectAddress] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] })
    },
  })
}

// 新增：获取项目分类Hook
export function useProjectsByCategory(category: string) {
  return useQuery({
    queryKey: ['projects-by-category', category],
    queryFn: async () => {
      // Mock实现 - 从所有项目中筛选
      const allProjects = await api.getProjects()
      return allProjects.filter(project => project.category === category)
      
      // 真实合约调用
      // return contractApi.getProjectsByCategory(category)
    },
    enabled: !!category,
  })
}

// 新增：无限滚动Hook
export function useInfiniteProjects(limit: number = 20) {
  return useQuery({
    queryKey: ['infinite-projects', limit],
    queryFn: async () => {
      // 为无限滚动准备的数据结构
      const allProjects = await api.getProjects()
      return {
        pages: [allProjects.slice(0, limit)],
        pageParams: [0],
        hasNextPage: allProjects.length > limit,
        totalProjects: allProjects.length
      }
    },
  })
}

// 新增：实时数据更新Hook（用于WebSocket或轮询）
export function useRealtimeProject(projectId: string, enabled: boolean = false) {
  const queryClient = useQueryClient()
  
  const query = useQuery({
    queryKey: ['realtime-project', projectId],
    queryFn: () => api.getProject(projectId),
    enabled: enabled && !!projectId,
    refetchInterval: enabled ? 10000 : false, // 10秒轮询
  })
  
  // 使用useEffect处理数据更新
  React.useEffect(() => {
    if (query.data) {
      // 更新缓存中的项目数据
      queryClient.setQueryData(['project', projectId], query.data)
    }
  }, [query.data, queryClient, projectId])
  
  return query
}

// 导出合约API实例供组件直接使用
export { api as currentApi }

// 当切换到合约API时，可以导出contractApi
// export { contractApi } 