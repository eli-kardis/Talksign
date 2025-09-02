"use client";
import { Schedule } from "@/components/Schedule";

export default function SchedulePage() {
  // 데모용 빈 핸들러
  return (
    <Schedule
      onNavigate={() => {}}
      schedules={[]}
      onAddSchedule={() => {}}
      onUpdateSchedule={() => {}}
      onDeleteSchedule={() => {}}
    />
  );
}