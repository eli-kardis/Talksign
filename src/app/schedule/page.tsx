"use client";
import { useState, useEffect } from "react";
import { Schedule } from "@/components/Schedule";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface ScheduleItem {
  id: number;
  title: string;
  date: string;
  time: string;
  type: 'task' | 'meeting' | 'deadline' | 'presentation' | 'launch';
  priority: 'low' | 'medium' | 'high';
  description?: string;
}

export default function SchedulePage() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 일정 목록 로드
  useEffect(() => {
    if (user?.id) {
      loadSchedules();
    }
  }, [user?.id]);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      
      console.log('Schedule page: Loading schedules for user:', user?.id);
      
      const { data: schedules, error, count } = await supabase
        .from('schedules')
        .select('*', { count: 'exact' })
        .eq('user_id', user?.id)
        .order('start_date', { ascending: true });

      console.log('Schedule page: Schedules query result:', { 
        data: schedules, 
        error, 
        count,
        user_id: user?.id 
      });

      if (error) {
        console.error('Error loading schedules:', error);
        return;
      }
      
      if (!schedules || schedules.length === 0) {
        console.log('Schedule page: No schedules found for user');
        setSchedules([]);
        return;
      }
      
      // Supabase 데이터를 Schedule 컴포넌트 형식으로 변환
      const formattedSchedules = schedules.map((schedule: any, index: number) => {
        console.log(`Schedule page: Schedule ${index + 1}:`, schedule);
        
        return {
          id: index + 1, // 단순히 배열 인덱스 사용
          title: schedule.title,
          date: schedule.start_date,
          time: schedule.start_time || '00:00',
          type: schedule.type,
          priority: schedule.priority,
          description: schedule.description
        };
      });
      
      console.log('Schedule page: Formatted schedules:', formattedSchedules);
      setSchedules(formattedSchedules);
    } catch (error) {
      console.error('Error loading schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchedule = async (scheduleData: Omit<ScheduleItem, 'id'>) => {
    try {
      console.log('Adding schedule for user:', user?.id);
      
      // Schedule 컴포넌트 형식을 Supabase 형식으로 변환
      const supabaseData = {
        user_id: user?.id,
        title: scheduleData.title,
        description: scheduleData.description || null,
        start_date: scheduleData.date,
        start_time: scheduleData.time,
        end_date: scheduleData.date,
        end_time: scheduleData.time,
        type: scheduleData.type,
        priority: scheduleData.priority
      };

      const { error } = await supabase
        .from('schedules')
        .insert([supabaseData]);

      if (error) {
        console.error('Error adding schedule:', error);
        alert('일정 추가 중 오류가 발생했습니다: ' + error.message);
        return;
      }

      // 성공시 목록 새로고침
      await loadSchedules();
    } catch (error) {
      console.error('Error adding schedule:', error);
      alert('일정 추가 중 오류가 발생했습니다.');
    }
  };

  const handleUpdateSchedule = async (id: number, scheduleData: Omit<ScheduleItem, 'id'>) => {
    try {
      console.log('Updating schedule with id:', id);
      
      // 현재 schedules 배열에서 해당 인덱스의 실제 UUID 찾기
      const { data: allSchedules, error: fetchError } = await supabase
        .from('schedules')
        .select('id')
        .eq('user_id', user?.id)
        .order('start_date', { ascending: true });

      if (fetchError) {
        console.error('Error fetching schedules for update:', fetchError);
        throw new Error('Failed to fetch schedules');
      }

      // id는 배열 인덱스 + 1이므로, 실제 인덱스는 id - 1
      const actualScheduleId = allSchedules?.[id - 1]?.id;

      if (!actualScheduleId) {
        console.error('Schedule not found at index:', id - 1);
        throw new Error('Schedule not found');
      }

      console.log('Found actual schedule UUID:', actualScheduleId);

      const supabaseData = {
        title: scheduleData.title,
        description: scheduleData.description || null,
        start_date: scheduleData.date,
        start_time: scheduleData.time,
        end_date: scheduleData.date,
        end_time: scheduleData.time,
        type: scheduleData.type,
        priority: scheduleData.priority,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('schedules')
        .update(supabaseData)
        .eq('id', actualScheduleId);

      if (error) {
        console.error('Error updating schedule:', error);
        alert('일정 수정 중 오류가 발생했습니다: ' + error.message);
        return;
      }

      console.log('Schedule updated successfully');
      // 성공시 목록 새로고침
      await loadSchedules();
    } catch (error) {
      console.error('Error updating schedule:', error);
      alert('일정 수정 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteSchedule = async (id: number) => {
    try {
      console.log('Deleting schedule with id:', id);
      
      // 현재 schedules 배열에서 해당 인덱스의 실제 UUID 찾기
      const { data: allSchedules, error: fetchError } = await supabase
        .from('schedules')
        .select('id')
        .eq('user_id', user?.id)
        .order('start_date', { ascending: true });

      if (fetchError) {
        console.error('Error fetching schedules for delete:', fetchError);
        throw new Error('Failed to fetch schedules');
      }

      // id는 배열 인덱스 + 1이므로, 실제 인덱스는 id - 1
      const actualScheduleId = allSchedules?.[id - 1]?.id;

      if (!actualScheduleId) {
        console.error('Schedule not found at index:', id - 1);
        throw new Error('Schedule not found');
      }

      console.log('Found actual schedule UUID for deletion:', actualScheduleId);

      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', actualScheduleId);

      if (error) {
        console.error('Error deleting schedule:', error);
        alert('일정 삭제 중 오류가 발생했습니다: ' + error.message);
        return;
      }

      console.log('Schedule deleted successfully');
      // 성공시 목록 새로고침
      await loadSchedules();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      alert('일정 삭제 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-64">로딩 중...</div>;
  }

  return (
    <Schedule
      onNavigate={() => {}}
      schedules={schedules}
      onAddSchedule={handleAddSchedule}
      onUpdateSchedule={handleUpdateSchedule}
      onDeleteSchedule={handleDeleteSchedule}
    />
  );
}