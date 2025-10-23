"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useTask } from "@/contexts/TaskContext"
import { CheckCircle, Clock, AlertCircle, Users, Calendar, TrendingUp } from "lucide-react"

export function TaskStats() {
  const { tasks, projects, teamMembers } = useTask()

  // 计算统计数据
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(task => task.status === 'completed').length
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length
  const todoTasks = tasks.filter(task => task.status === 'todo').length
  const overdueTasks = tasks.filter(task => 
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed'
  ).length

  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  // 优先级统计
  const highPriorityTasks = tasks.filter(task => task.priority === 'high').length
  const mediumPriorityTasks = tasks.filter(task => task.priority === 'medium').length
  const lowPriorityTasks = tasks.filter(task => task.priority === 'low').length

  // 本周到期任务
  const thisWeek = new Date()
  thisWeek.setDate(thisWeek.getDate() + 7)
  const tasksThisWeek = tasks.filter(task => 
    task.dueDate && 
    new Date(task.dueDate) <= thisWeek && 
    new Date(task.dueDate) >= new Date() &&
    task.status !== 'completed'
  ).length

  const stats = [
    {
      title: "总任务数",
      value: totalTasks,
      icon: CheckCircle,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "已完成",
      value: completedTasks,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "进行中",
      value: inProgressTasks,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      title: "逾期任务",
      value: overdueTasks,
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      title: "团队成员",
      value: teamMembers.length,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "本周到期",
      value: tasksThisWeek,
      icon: Calendar,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ]

  return (
    <div className="space-y-6">
      {/* 主要统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 详细统计 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 完成率 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              任务完成率
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>整体进度</span>
                <span>{completionRate.toFixed(1)}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">{completedTasks}</p>
                <p className="text-xs text-muted-foreground">已完成</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{inProgressTasks}</p>
                <p className="text-xs text-muted-foreground">进行中</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-600">{todoTasks}</p>
                <p className="text-xs text-muted-foreground">待开始</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 优先级分布 */}
        <Card>
          <CardHeader>
            <CardTitle>优先级分布</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="w-2 h-2 p-0 rounded-full"></Badge>
                  <span className="text-sm">高优先级</span>
                </div>
                <span className="text-sm font-medium">{highPriorityTasks}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="w-2 h-2 p-0 rounded-full bg-yellow-500"></Badge>
                  <span className="text-sm">中优先级</span>
                </div>
                <span className="text-sm font-medium">{mediumPriorityTasks}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="w-2 h-2 p-0 rounded-full"></Badge>
                  <span className="text-sm">低优先级</span>
                </div>
                <span className="text-sm font-medium">{lowPriorityTasks}</span>
              </div>
            </div>

            {/* 项目统计 */}
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">活跃项目</h4>
              <div className="space-y-2">
                {projects.slice(0, 3).map(project => {
                  const projectTasks = tasks.filter(task => task.projectId === project.id)
                  const projectProgress = projectTasks.length > 0 
                    ? (projectTasks.filter(task => task.status === 'completed').length / projectTasks.length) * 100 
                    : 0
                  
                  return (
                    <div key={project.id} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="truncate">{project.name}</span>
                        <span>{projectProgress.toFixed(0)}%</span>
                      </div>
                      <Progress value={projectProgress} className="h-1" />
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}