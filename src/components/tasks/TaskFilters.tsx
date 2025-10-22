"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useTask } from "@/contexts/TaskContext"
import { TaskFilter } from "@/types/task"
import { Search, Filter, X, Calendar, User, Tag } from "lucide-react"

interface TaskFiltersProps {
  filters: TaskFilter
  onFiltersChange: (filters: TaskFilter) => void
}

export function TaskFilters({ filters, onFiltersChange }: TaskFiltersProps) {
  const { projects, teamMembers } = useTask()
  const [isExpanded, setIsExpanded] = useState(false)

  const updateFilter = (key: keyof TaskFilter, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      status: undefined,
      priority: undefined,
      assigneeId: undefined,
      projectId: undefined,
      tags: [],
      dueDateRange: undefined
    })
  }

  const hasActiveFilters = 
    filters.search ||
    filters.status ||
    filters.priority ||
    filters.assigneeId ||
    filters.projectId ||
    (filters.tags && filters.tags.length > 0) ||
    filters.dueDateRange

  const addTag = (tag: string) => {
    if (tag && !filters.tags?.includes(tag)) {
      updateFilter('tags', [...(filters.tags || []), tag])
    }
  }

  const removeTag = (tag: string) => {
    updateFilter('tags', filters.tags?.filter(t => t !== tag) || [])
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            筛选条件
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {[
                  filters.search && '搜索',
                  filters.status && '状态',
                  filters.priority && '优先级',
                  filters.assigneeId && '负责人',
                  filters.projectId && '项目',
                  filters.tags?.length && '标签',
                  filters.dueDateRange && '日期'
                ].filter(Boolean).length}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                清除
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? '收起' : '展开'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 搜索框 - 始终显示 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索任务标题、描述..."
            value={filters.search || ''}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* 展开的筛选选项 */}
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 状态筛选 */}
            <div className="space-y-2">
              <Label>状态</Label>
              <Select
                value={filters.status || ''}
                onValueChange={(value) => updateFilter('status', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部状态</SelectItem>
                  <SelectItem value="todo">待开始</SelectItem>
                  <SelectItem value="in-progress">进行中</SelectItem>
                  <SelectItem value="review">待审核</SelectItem>
                  <SelectItem value="completed">已完成</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 优先级筛选 */}
            <div className="space-y-2">
              <Label>优先级</Label>
              <Select
                value={filters.priority || ''}
                onValueChange={(value) => updateFilter('priority', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择优先级" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部优先级</SelectItem>
                  <SelectItem value="low">低</SelectItem>
                  <SelectItem value="medium">中</SelectItem>
                  <SelectItem value="high">高</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 负责人筛选 */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <User className="h-4 w-4" />
                负责人
              </Label>
              <Select
                value={filters.assigneeId || ''}
                onValueChange={(value) => updateFilter('assigneeId', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择负责人" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部成员</SelectItem>
                  {teamMembers.map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 项目筛选 */}
            <div className="space-y-2">
              <Label>项目</Label>
              <Select
                value={filters.projectId || ''}
                onValueChange={(value) => updateFilter('projectId', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择项目" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部项目</SelectItem>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* 标签筛选 */}
        {isExpanded && (
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <Tag className="h-4 w-4" />
              标签
            </Label>
            <div className="flex flex-wrap gap-2">
              {filters.tags?.map(tag => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => removeTag(tag)}
                >
                  {tag}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
            <Input
              placeholder="添加标签..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const target = e.target as HTMLInputElement
                  addTag(target.value.trim())
                  target.value = ''
                }
              }}
            />
          </div>
        )}

        {/* 日期范围筛选 */}
        {isExpanded && (
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              到期日期
            </Label>
            <Select
              value={filters.dueDateRange || ''}
              onValueChange={(value) => updateFilter('dueDateRange', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择日期范围" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部日期</SelectItem>
                <SelectItem value="overdue">已逾期</SelectItem>
                <SelectItem value="today">今天</SelectItem>
                <SelectItem value="tomorrow">明天</SelectItem>
                <SelectItem value="this-week">本周</SelectItem>
                <SelectItem value="next-week">下周</SelectItem>
                <SelectItem value="this-month">本月</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* 活跃筛选器显示 */}
        {hasActiveFilters && (
          <div className="pt-4 border-t">
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <Badge variant="outline" className="gap-1">
                  搜索: {filters.search}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => updateFilter('search', '')}
                  />
                </Badge>
              )}
              {filters.status && (
                <Badge variant="outline" className="gap-1">
                  状态: {filters.status}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => updateFilter('status', undefined)}
                  />
                </Badge>
              )}
              {filters.priority && (
                <Badge variant="outline" className="gap-1">
                  优先级: {filters.priority}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => updateFilter('priority', undefined)}
                  />
                </Badge>
              )}
              {filters.assigneeId && (
                <Badge variant="outline" className="gap-1">
                  负责人: {teamMembers.find(m => m.id === filters.assigneeId)?.name}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => updateFilter('assigneeId', undefined)}
                  />
                </Badge>
              )}
              {filters.projectId && (
                <Badge variant="outline" className="gap-1">
                  项目: {projects.find(p => p.id === filters.projectId)?.name}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => updateFilter('projectId', undefined)}
                  />
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}