'use client'

import React from 'react'
import { useTask } from '@/contexts/TaskContext'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Filter, X } from 'lucide-react'
import { TaskStatus, TaskPriority } from '@/types/task'

export function TaskFilter() {
  const { 
    filter, 
    setFilter, 
    projects,
    teamMembers 
  } = useTask()

  const handleSearchChange = (value: string) => {
    setFilter({ ...filter, search: value })
  }

  const handleStatusFilter = (status: TaskStatus | 'all') => {
    setFilter({ 
      ...filter, 
      status: status === 'all' ? undefined : [status] 
    })
  }

  const handlePriorityFilter = (priority: TaskPriority | 'all') => {
    setFilter({ 
      ...filter, 
      priority: priority === 'all' ? undefined : [priority] 
    })
  }

  const handleAssigneeFilter = (assigneeId: string | 'all') => {
    setFilter({ 
      ...filter, 
      assigneeId: assigneeId === 'all' ? undefined : [assigneeId] 
    })
  }

  const handleProjectFilter = (projectId: string | 'all') => {
    setFilter({ 
      ...filter, 
      projectId: projectId === 'all' ? undefined : projectId 
    })
  }

  const statusOptions = [
    { value: 'all', label: '全部状态' },
    { value: 'todo', label: '待办' },
    { value: 'in_progress', label: '进行中' },
    { value: 'review', label: '待审核' },
    { value: 'done', label: '已完成' }
  ]

  const priorityOptions = [
    { value: 'all', label: '全部优先级' },
    { value: 'low', label: '低' },
    { value: 'medium', label: '中' },
    { value: 'high', label: '高' },
    { value: 'urgent', label: '紧急' }
  ]

  const clearFilters = () => {
    setFilter({})
  }

  const hasActiveFilters = filter.search || filter.status || filter.priority || filter.assigneeId || filter.projectId

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Filter className="w-5 h-5" />
          任务筛选
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="搜索任务标题或描述..."
            value={filter.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* 状态筛选 */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">状态</label>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map(option => (
              <Badge
                key={option.value}
                variant={
                  (filter.status && filter.status.includes(option.value as TaskStatus)) || 
                  (option.value === 'all' && !filter.status) ? 'default' : 'outline'
                }
                className="cursor-pointer"
                onClick={() => handleStatusFilter(option.value as TaskStatus | 'all')}
              >
                {option.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* 优先级筛选 */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">优先级</label>
          <div className="flex flex-wrap gap-2">
            {priorityOptions.map(option => (
              <Badge
                key={option.value}
                variant={
                  (filter.priority && filter.priority.includes(option.value as TaskPriority)) || 
                  (option.value === 'all' && !filter.priority) ? 'default' : 'outline'
                }
                className="cursor-pointer"
                onClick={() => handlePriorityFilter(option.value as TaskPriority | 'all')}
              >
                {option.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* 负责人筛选 */}
        {teamMembers && teamMembers.length > 0 && (
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">负责人</label>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={!filter.assigneeId ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => handleAssigneeFilter('all')}
              >
                全部
              </Badge>
              {teamMembers.map(member => (
                <Badge
                  key={member.id}
                  variant={filter.assigneeId && filter.assigneeId.includes(member.id) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => handleAssigneeFilter(member.id)}
                >
                  {member.avatar} {member.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* 项目筛选 */}
        {projects && projects.length > 0 && (
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">项目</label>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={!filter.projectId ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => handleProjectFilter('all')}
              >
                全部项目
              </Badge>
              {projects.map(project => (
                <Badge
                  key={project.id}
                  variant={filter.projectId === project.id ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => handleProjectFilter(project.id)}
                >
                  {project.icon} {project.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* 清除筛选 */}
        {hasActiveFilters && (
          <div className="pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="w-full"
            >
              <X className="w-4 h-4 mr-2" />
              清除所有筛选
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}