'use client'

import React, { useState, useEffect } from 'react'
import { useTask } from '@/contexts/TaskContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Calendar, Clock, User, Tag, X, Plus } from 'lucide-react'
import { Task, TaskStatus, TaskPriority } from '@/types/task'

interface TaskFormProps {
  task?: Task
  onSave: (taskData: Partial<Task>) => void
  onCancel: () => void
}

export function TaskForm({ task, onSave, onCancel }: TaskFormProps) {
  const { projects, teamMembers } = useTask()
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo' as TaskStatus,
    priority: 'medium' as TaskPriority,
    assigneeId: '',
    projectId: '',
    dueDate: '',
    estimatedHours: 0,
    tags: [] as string[]
  })

  const [newTag, setNewTag] = useState('')

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        assigneeId: task.assigneeId || '',
        projectId: task.projectId || '',
        dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : '',
        estimatedHours: task.estimatedHours || 0,
        tags: task.tags || []
      })
    }
  }, [task])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const taskData: Partial<Task> = {
      ...formData,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      estimatedHours: formData.estimatedHours || undefined
    }

    onSave(taskData)
  }

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const statusOptions = [
    { value: 'todo', label: '待办' },
    { value: 'in_progress', label: '进行中' },
    { value: 'review', label: '待审核' },
    { value: 'done', label: '已完成' }
  ]

  const priorityOptions = [
    { value: 'low', label: '低' },
    { value: 'medium', label: '中' },
    { value: 'high', label: '高' },
    { value: 'urgent', label: '紧急' }
  ]

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {task ? '编辑任务' : '创建新任务'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 任务标题 */}
          <div className="space-y-2">
            <Label htmlFor="title">任务标题 *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="输入任务标题"
              required
            />
          </div>

          {/* 任务描述 */}
          <div className="space-y-2">
            <Label htmlFor="description">任务描述</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="详细描述任务内容和要求"
              rows={4}
            />
          </div>

          {/* 状态和优先级 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>状态</Label>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map(option => (
                  <Badge
                    key={option.value}
                    variant={formData.status === option.value ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setFormData(prev => ({ ...prev, status: option.value as TaskStatus }))}
                  >
                    {option.label}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>优先级</Label>
              <div className="flex flex-wrap gap-2">
                {priorityOptions.map(option => (
                  <Badge
                    key={option.value}
                    variant={formData.priority === option.value ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setFormData(prev => ({ ...prev, priority: option.value as TaskPriority }))}
                  >
                    {option.label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* 负责人和项目 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamMembers && teamMembers.length > 0 && (
              <div className="space-y-2">
                <Label>负责人</Label>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={!formData.assigneeId ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setFormData(prev => ({ ...prev, assigneeId: '' }))}
                  >
                    未分配
                  </Badge>
                  {teamMembers.map(member => (
                    <Badge
                      key={member.id}
                      variant={formData.assigneeId === member.id ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setFormData(prev => ({ ...prev, assigneeId: member.id }))}
                    >
                      {member.avatar} {member.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {projects && projects.length > 0 && (
              <div className="space-y-2">
                <Label>所属项目</Label>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={!formData.projectId ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setFormData(prev => ({ ...prev, projectId: '' }))}
                  >
                    无项目
                  </Badge>
                  {projects.map(project => (
                    <Badge
                      key={project.id}
                      variant={formData.projectId === project.id ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setFormData(prev => ({ ...prev, projectId: project.id }))}
                    >
                      {project.icon} {project.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 截止日期和预估工时 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">截止日期</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedHours">预估工时（小时）</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="estimatedHours"
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.estimatedHours}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: parseFloat(e.target.value) || 0 }))}
                  className="pl-10"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* 标签 */}
          <div className="space-y-2">
            <Label>标签</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {tag}
                  <X 
                    className="w-3 h-3 cursor-pointer hover:text-red-500" 
                    onClick={() => handleRemoveTag(tag)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="添加标签"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <Button type="button" variant="outline" onClick={handleAddTag}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              取消
            </Button>
            <Button type="submit">
              {task ? '保存修改' : '创建任务'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}