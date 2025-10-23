'use client'

import React, { useState } from 'react'
import { Task } from '@/types/task'
import { useTask } from '@/contexts/TaskContext'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/progress'
import { 
  Calendar, 
  Clock, 
  User, 
  MessageSquare, 
  Paperclip, 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface TaskCardProps {
  task: Task
  compact?: boolean
}

const priorityConfig = {
  low: { color: 'bg-green-100 text-green-800', label: '低' },
  medium: { color: 'bg-yellow-100 text-yellow-800', label: '中' },
  high: { color: 'bg-red-100 text-red-800', label: '高' },
  urgent: { color: 'bg-purple-100 text-purple-800', label: '紧急' }
}

const statusConfig = {
  todo: { color: 'bg-gray-100 text-gray-800', label: '待办' },
  in_progress: { color: 'bg-blue-100 text-blue-800', label: '进行中' },
  review: { color: 'bg-yellow-100 text-yellow-800', label: '待审核' },
  done: { color: 'bg-green-100 text-green-800', label: '已完成' },
  cancelled: { color: 'bg-red-100 text-red-800', label: '已取消' }
}

export function TaskCard({ task, compact = false }: TaskCardProps) {
  const { updateTask, deleteTask } = useTask()
  const [showDetails, setShowDetails] = useState(false)

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done'
  const daysUntilDue = task.dueDate 
    ? Math.ceil((new Date(task.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null

  const handleEdit = () => {
    // TODO: 打开编辑表单
    console.log('Edit task:', task.id)
  }

  const handleDelete = async () => {
    if (confirm('确定要删除这个任务吗？')) {
      await deleteTask(task.id)
    }
  }

  const handleToggleComplete = async () => {
    const newStatus = task.status === 'done' ? 'todo' : 'done'
    await updateTask(task.id, { status: newStatus })
  }

  return (
    <Card className={`hover:shadow-md transition-shadow ${isOverdue ? 'border-red-300' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className={`font-medium ${compact ? 'text-sm' : 'text-base'} line-clamp-2`}>
              {task.title}
            </h3>
            {!compact && task.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowDetails(true)}>
                <Eye className="h-4 w-4 mr-2" />
                查看详情
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                编辑
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* 优先级和状态 */}
        <div className="flex items-center gap-2">
          <Badge 
            className={`text-xs ${priorityConfig[task.priority].color}`}
            variant="secondary"
          >
            {priorityConfig[task.priority].label}
          </Badge>
          {compact && (
            <Badge 
              className={`text-xs ${statusConfig[task.status].color}`}
              variant="secondary"
            >
              {statusConfig[task.status].label}
            </Badge>
          )}
        </div>

        {/* 进度条 */}
        {task.progress !== undefined && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-600">
              <span>进度</span>
              <span>{task.progress}%</span>
            </div>
            <Progress value={task.progress} className="h-2" />
          </div>
        )}

        {/* 分配人 */}
        {task.assigneeName && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="h-4 w-4" />
            <span className="flex items-center gap-1">
              {task.assigneeAvatar && <span>{task.assigneeAvatar}</span>}
              {task.assigneeName}
            </span>
          </div>
        )}

        {/* 截止日期 */}
        {task.dueDate && (
          <div className={`flex items-center gap-2 text-sm ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
            <Calendar className="h-4 w-4" />
            <span>
              {new Date(task.dueDate).toLocaleDateString('zh-CN')}
              {daysUntilDue !== null && (
                <span className="ml-1">
                  {daysUntilDue > 0 ? `(${daysUntilDue}天后)` : 
                   daysUntilDue === 0 ? '(今天)' : 
                   `(逾期${Math.abs(daysUntilDue)}天)`}
                </span>
              )}
            </span>
          </div>
        )}

        {/* 工时信息 */}
        {(task.estimatedHours || task.actualHours) && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>
              {task.actualHours ? `${task.actualHours}h` : '0h'}
              {task.estimatedHours && ` / ${task.estimatedHours}h`}
            </span>
          </div>
        )}

        {/* 标签 */}
        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.slice(0, compact ? 2 : 3).map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {task.tags.length > (compact ? 2 : 3) && (
              <Badge variant="outline" className="text-xs">
                +{task.tags.length - (compact ? 2 : 3)}
              </Badge>
            )}
          </div>
        )}

        {/* 附加信息 */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            {task.comments.length > 0 && (
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {task.comments.length}
              </span>
            )}
            {task.attachments.length > 0 && (
              <span className="flex items-center gap-1">
                <Paperclip className="h-3 w-3" />
                {task.attachments.length}
              </span>
            )}
            {task.subtasks.length > 0 && (
              <span>
                {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length} 子任务
              </span>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleComplete}
            className="h-6 px-2 text-xs"
          >
            {task.status === 'done' ? '取消完成' : '标记完成'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}