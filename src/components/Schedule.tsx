import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Calendar } from './ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { CalendarClock, Plus, Edit, Trash2, AlertCircle, Users, FileText, TrendingUp, CheckCircle, Calendar as CalendarIcon } from 'lucide-react';

interface ScheduleItem {
  id: number;
  title: string;
  date: string;
  time: string;
  type: 'task' | 'meeting' | 'deadline' | 'presentation' | 'launch';
  priority: 'low' | 'medium' | 'high';
  description?: string;
}

interface ScheduleProps {
  onNavigate: (view: string) => void;
  schedules: ScheduleItem[];
  onAddSchedule: (schedule: Omit<ScheduleItem, 'id'>) => void;
  onUpdateSchedule: (id: number, schedule: Omit<ScheduleItem, 'id'>) => void;
  onDeleteSchedule: (id: number) => void;
}

export function Schedule({ onNavigate, schedules, onAddSchedule, onUpdateSchedule, onDeleteSchedule }: ScheduleProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    type: 'task' as ScheduleItem['type'],
    priority: 'medium' as ScheduleItem['priority'],
    description: ''
  });

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getSchedulesForDate = (date: Date) => {
    const dateString = formatDateForInput(date);
    return schedules.filter(schedule => schedule.date === dateString);
  };

  const getScheduleIcon = (type: string) => {
    switch (type) {
      case 'deadline':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      case 'meeting':
        return <Users className="w-4 h-4 text-primary" />;
      case 'presentation':
        return <FileText className="w-4 h-4 text-accent-foreground" />;
      case 'launch':
        return <TrendingUp className="w-4 h-4 text-primary" />;
      case 'task':
        return <CheckCircle className="w-4 h-4 text-muted-foreground" />;
      default:
        return <CalendarIcon className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive/20 text-destructive';
      case 'medium':
        return 'bg-accent text-accent-foreground';
      case 'low':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high':
        return '긴급';
      case 'medium':
        return '보통';
      case 'low':
        return '낮음';
      default:
        return '보통';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'deadline':
        return '마감일';
      case 'meeting':
        return '회의';
      case 'presentation':
        return '발표';
      case 'launch':
        return '런칭';
      case 'task':
        return '작업';
      default:
        return '일정';
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setFormData(prev => ({
        ...prev,
        date: formatDateForInput(date)
      }));
    }
  };

  const handleAddNew = () => {
    setEditingSchedule(null);
    setFormData({
      title: '',
      date: selectedDate ? formatDateForInput(selectedDate) : '',
      time: '',
      type: 'task',
      priority: 'medium',
      description: ''
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (schedule: ScheduleItem) => {
    setEditingSchedule(schedule);
    setFormData({
      title: schedule.title,
      date: schedule.date,
      time: schedule.time,
      type: schedule.type,
      priority: schedule.priority,
      description: schedule.description || ''
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.title || !formData.date || !formData.time) return;

    const scheduleData = {
      title: formData.title,
      date: formData.date,
      time: formData.time,
      type: formData.type,
      priority: formData.priority,
      description: formData.description
    };

    if (editingSchedule) {
      onUpdateSchedule(editingSchedule.id, scheduleData);
    } else {
      onAddSchedule(scheduleData);
    }

    setIsDialogOpen(false);
    setEditingSchedule(null);
    setFormData({
      title: '',
      date: '',
      time: '',
      type: 'task',
      priority: 'medium',
      description: ''
    });
  };

  const handleDelete = (id: number) => {
    onDeleteSchedule(id);
  };

  const selectedDateSchedules = selectedDate ? getSchedulesForDate(selectedDate) : [];

  // Calendar에 일정이 있는 날짜 표시를 위한 modifier
  const scheduleDates = schedules.map(schedule => new Date(schedule.date));

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarClock className="w-6 h-6 text-primary" />
          <h1 className="text-lg md:text-xl font-medium text-foreground">일정 관리</h1>
        </div>
        <Button onClick={handleAddNew} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          새 일정
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2 p-4 md:p-6 bg-card border-border">
          <div className="flex flex-col items-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="rounded-md border-0"
              modifiers={{
                hasSchedule: scheduleDates
              }}
              modifiersStyles={{
                hasSchedule: {
                  backgroundColor: 'hsl(var(--primary) / 0.1)',
                  color: 'hsl(var(--primary))',
                  fontWeight: 'medium'
                }
              }}
            />
          </div>
        </Card>

        {/* Schedule List for Selected Date */}
        <Card className="p-4 md:p-6 bg-card border-border">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-foreground mb-2">
                {selectedDate ? selectedDate.toLocaleDateString('ko-KR', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                }) : '날짜를 선택하세요'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {selectedDateSchedules.length}개의 일정
              </p>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {selectedDateSchedules.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">일정이 없습니다</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleAddNew}
                    className="mt-2 text-primary hover:text-primary/80"
                  >
                    일정 추가하기
                  </Button>
                </div>
              ) : (
                selectedDateSchedules.map((schedule) => (
                  <div key={schedule.id} className="p-3 bg-secondary rounded-lg border border-border">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        {getScheduleIcon(schedule.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-foreground truncate">
                              {schedule.title}
                            </p>
                            <Badge className={`text-xs ${getPriorityBadge(schedule.priority)}`}>
                              {getPriorityText(schedule.priority)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{schedule.time}</span>
                            <span>•</span>
                            <span>{getTypeText(schedule.type)}</span>
                          </div>
                          {schedule.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {schedule.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(schedule)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(schedule.id)}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Add/Edit Schedule Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingSchedule ? '일정 수정' : '새 일정 추가'}
            </DialogTitle>
            <DialogDescription>
              일정의 세부사항을 입력해주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="일정 제목을 입력하세요"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date">날짜</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="time">시간</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">타입</Label>
                <Select value={formData.type} onValueChange={(value: ScheduleItem['type']) => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="task">작업</SelectItem>
                    <SelectItem value="meeting">회의</SelectItem>
                    <SelectItem value="deadline">마감일</SelectItem>
                    <SelectItem value="presentation">발표</SelectItem>
                    <SelectItem value="launch">런칭</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="priority">우선순위</Label>
                <Select value={formData.priority} onValueChange={(value: ScheduleItem['priority']) => setFormData(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">낮음</SelectItem>
                    <SelectItem value="medium">보통</SelectItem>
                    <SelectItem value="high">긴급</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">설명 (선택사항)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="일정에 대한 세부사항을 입력하세요"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSave} disabled={!formData.title || !formData.date || !formData.time}>
              {editingSchedule ? '수정' : '추가'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
