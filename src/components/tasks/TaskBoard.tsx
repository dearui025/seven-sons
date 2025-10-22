'use client'

import React from 'react'
import { Task, TaskStatus } from '@/types/task'
import { TaskCard } from './TaskCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTask } from '@/contexts/TaskContext'

interface TaskBoardProps {
  tasks: Task[]
}

const statusConfig = {
  todo: {
    title: '待办',
    color: 'bg-gray-100 border-gray-200',
    badgeColor: 'secondary'
  },
  in_progress: {
    title: '进行中',
    color: 'bg-blue-50 border-blue-200',
    badgeColor: 'default'
  },
  review: {
    title: '待审核',
    color: 'bg-yellow-50 border-yellow-200',
    badgeColor: 'outline'
  },
  done: {
    title: '已完成',
    color: 'bg-green-50 border-green-200',
    badgeColor: 'default'
  },
  cancelled: {
    title: '已取消',
    color: 'bg-red-50 border-red-200',
    badgeColor: 'destructive'
  }
} as const

export function TaskBoard({ tasks }: TaskBoardProps) {
  const { updateTask } = useTask()
  
  const statusColumns: TaskStatus[] = ['todo', 'in_progress', 'review', 'done', 'cancelled']
  
  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status)
  }

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData('text/plain', task.id)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('text/plain')
    const task = tasks.find(t => t.id === taskId)
    
    if (task && task.status !== status) {
      await updateTask(taskId, { status })
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {statusColumns.map(status => {
        const statusTasks = getTasksByStatus(status)
        const config = statusConfig[status]
        
        return (
          <Card 
            key={status} 
            className={`${config.color} min-h-[600px]`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  {config.title}
                </CardTitle>
                <Badge variant={config.badgeColor as any} className="text-xs">
                  {statusTasks.length}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {statusTasks.map(task => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task)}
                  className="cursor-move"
                >
                  <TaskCard task={task} />
                </div>
              ))}
              
              {statusTasks.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-2xl mb-2">📝</div>
                  <p className="text-sm">暂无任务</p>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}