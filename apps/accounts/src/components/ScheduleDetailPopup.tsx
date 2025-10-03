import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { AlertCircle, Users, FileText, TrendingUp, CheckCircle, Calendar as CalendarIcon, Clock, Edit, Trash2 } from 'lucide-react';

interface ScheduleItem {
  id: number;
  title: string;
  date: string;
  time: string;
  type: 'task' | 'meeting' | 'deadline' | 'presentation' | 'launch';
  priority: 'low' | 'medium' | 'high';
  description?: string;
}

interface ScheduleDetailPopupProps {
  schedule: ScheduleItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (schedule: ScheduleItem) => void;
  onDelete?: (id: number) => void;
}

export function ScheduleDetailPopup({ 
  schedule, 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete 
}: ScheduleDetailPopupProps) {
  if (!schedule) return null;

  const getScheduleIcon = (type: string) => {
    switch (type) {
      case 'deadline':
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      case 'meeting':
        return <Users className="w-5 h-5 text-primary" />;
      case 'presentation':
        return <FileText className="w-5 h-5 text-accent-foreground" />;
      case 'launch':
        return <TrendingUp className="w-5 h-5 text-primary" />;
      case 'task':
        return <CheckCircle className="w-5 h-5 text-muted-foreground" />;
      default:
        return <CalendarIcon className="w-5 h-5 text-muted-foreground" />;
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? '오후' : '오전';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${ampm} ${displayHour}:${minutes}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {getScheduleIcon(schedule.type)}
            <span className="text-lg font-semibold">{schedule.title}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* 일정 정보 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">날짜</span>
              <span className="text-sm text-foreground">{formatDate(schedule.date)}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">시간</span>
              <span className="text-sm text-foreground">{formatTime(schedule.time)}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">타입</span>
              <Badge className="text-xs bg-secondary text-secondary-foreground">
                {getTypeText(schedule.type)}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">우선순위</span>
              <Badge className={`text-xs ${getPriorityBadge(schedule.priority)}`}>
                {getPriorityText(schedule.priority)}
              </Badge>
            </div>
          </div>

          {/* 설명 */}
          {schedule.description && (
            <div className="space-y-2">
              <span className="text-sm font-medium">설명</span>
              <div className="p-3 bg-secondary rounded-lg">
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {schedule.description}
                </p>
              </div>
            </div>
          )}

          {/* 액션 버튼 */}
          {(onEdit || onDelete) && (
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                닫기
              </Button>
              {onEdit && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    onEdit(schedule);
                    onClose();
                  }}
                  className="flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  수정
                </Button>
              )}
              {onDelete && (
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    onDelete(schedule.id);
                    onClose();
                  }}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  삭제
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
