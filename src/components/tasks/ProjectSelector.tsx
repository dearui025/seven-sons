'use client'

import React, { useState } from 'react'
import { useTask } from '@/contexts/TaskContext'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Plus, Search, Folder, Settings, Users, Calendar } from 'lucide-react'
import { Project } from '@/types/task'

interface ProjectSelectorProps {
  selectedProjectId?: string
  onProjectSelect: (projectId: string | null) => void
  showCreateNew?: boolean
}

export function ProjectSelector({ 
  selectedProjectId, 
  onProjectSelect, 
  showCreateNew = true 
}: ProjectSelectorProps) {
  const { projects, createProject } = useTask()
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newProjectData, setNewProjectData] = useState({
    name: '',
    description: '',
    icon: '📁',
    color: '#3b82f6'
  })

  const filteredProjects = projects?.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const handleCreateProject = async () => {
    if (!newProjectData.name.trim()) return

    try {
      const newProject = await createProject({
        ...newProjectData,
        status: 'active',
        progress: 0,
        teamMembers: [],
        createdAt: new Date(),
        updatedAt: new Date()
      })
      
      setShowCreateForm(false)
      setNewProjectData({
        name: '',
        description: '',
        icon: '📁',
        color: '#3b82f6'
      })
      
      if (newProject) {
        onProjectSelect(newProject.id)
      }
    } catch (error) {
      console.error('创建项目失败:', error)
    }
  }

  const projectIcons = ['📁', '🚀', '💼', '🎯', '⚡', '🔧', '🎨', '📊', '🌟', '🔥']
  const projectColors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
  ]

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Folder className="w-5 h-5" />
            项目选择
          </span>
          {showCreateNew && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              <Plus className="w-4 h-4 mr-1" />
              新建项目
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="搜索项目..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* 创建新项目表单 */}
        {showCreateForm && (
          <Card className="border-dashed">
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">项目名称</label>
                <Input
                  placeholder="输入项目名称"
                  value={newProjectData.name}
                  onChange={(e) => setNewProjectData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">项目描述</label>
                <Input
                  placeholder="项目描述（可选）"
                  value={newProjectData.description}
                  onChange={(e) => setNewProjectData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">图标</label>
                  <div className="flex flex-wrap gap-1">
                    {projectIcons.map(icon => (
                      <Button
                        key={icon}
                        variant={newProjectData.icon === icon ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setNewProjectData(prev => ({ ...prev, icon }))}
                        className="w-8 h-8 p-0"
                      >
                        {icon}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">颜色</label>
                  <div className="flex flex-wrap gap-1">
                    {projectColors.map(color => (
                      <Button
                        key={color}
                        variant="outline"
                        size="sm"
                        onClick={() => setNewProjectData(prev => ({ ...prev, color }))}
                        className="w-6 h-6 p-0 border-2"
                        style={{ 
                          backgroundColor: color,
                          borderColor: newProjectData.color === color ? '#000' : color
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateForm(false)}
                >
                  取消
                </Button>
                <Button
                  size="sm"
                  onClick={handleCreateProject}
                  disabled={!newProjectData.name.trim()}
                >
                  创建项目
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 全部项目选项 */}
        <div
          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
            !selectedProjectId 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => onProjectSelect(null)}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              📋
            </div>
            <div>
              <div className="font-medium">全部项目</div>
              <div className="text-sm text-gray-500">显示所有任务</div>
            </div>
          </div>
        </div>

        {/* 项目列表 */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filteredProjects.map(project => (
            <div
              key={project.id}
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedProjectId === project.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onProjectSelect(project.id)}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: project.color }}
                >
                  {project.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{project.name}</div>
                  {project.description && (
                    <div className="text-sm text-gray-500 truncate">
                      {project.description}
                    </div>
                  )}
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Users className="w-3 h-3" />
                      {project.teamMembers?.length || 0}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {project.progress || 0}%
                    </div>
                  </div>
                </div>
                <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                  {project.status === 'active' ? '进行中' : '已完成'}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {filteredProjects.length === 0 && searchTerm && (
          <div className="text-center py-8 text-gray-500">
            <Folder className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <div>未找到匹配的项目</div>
            <div className="text-sm">尝试调整搜索关键词</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}