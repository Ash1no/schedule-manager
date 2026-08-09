import { useState, useEffect } from 'react';
import { ScheduleItem, Assignee, Tool } from './types';

const STORAGE_KEYS = {
  SCHEDULES: 'sm_schedules',
  ASSIGNEES: 'sm_assignees',
  TOOLS: 'sm_tools',
  TEMPLATE: 'sm_template',
  SELECTED_DATE: 'sm_selected_date',
};

export function useScheduleStore() {
  const [selectedDate, setSelectedDateState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.SELECTED_DATE) || '2026-08-09';
  });

  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  const [savedTemplate, setSavedTemplate] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.TEMPLATE) || 
      '📅 Date: {date}\n📍 Address: {address}\n👤 Assignee: {assignee}\n🛠️ Tool: {tool}';
  });

  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SCHEDULES);
    return saved ? JSON.parse(saved) : [];
  });

  const [assignees, setAssignees] = useState<Assignee[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ASSIGNEES);
    return saved ? JSON.parse(saved) : [];
  });

  const [tools, setTools] = useState<Tool[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TOOLS);
    return saved ? JSON.parse(saved) : [];
  });

  // Save changes to localStorage automatically
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(scheduleItems));
  }, [scheduleItems]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ASSIGNEES, JSON.stringify(assignees));
  }, [assignees]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TOOLS, JSON.stringify(tools));
  }, [tools]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SELECTED_DATE, selectedDate);
  }, [selectedDate]);

  const setSelectedDate = (date: string) => {
    setSelectedDateState(date);
  };

  const saveTemplate = (template: string) => {
    setSavedTemplate(template);
    localStorage.setItem(STORAGE_KEYS.TEMPLATE, template);
  };

  const addScheduleItem = (item: Omit<ScheduleItem, 'id'>) => {
    const nextId = scheduleItems.length > 0 ? Math.max(...scheduleItems.map(s => s.id)) + 1 : 1;
    setScheduleItems(prev => [...prev, { ...item, id: nextId }]);
  };

  const deleteScheduleItem = (id: number) => {
    setScheduleItems(prev => prev.filter(item => item.id !== id));
  };

  const addAssignee = (assignee: Omit<Assignee, 'id'>) => {
    const nextId = assignees.length > 0 ? Math.max(...assignees.map(a => a.id)) + 1 : 1;
    setAssignees(prev => [...prev, { ...assignee, id: nextId }]);
  };

  const addTool = (tool: Omit<Tool, 'id'>) => {
    const nextId = tools.length > 0 ? Math.max(...tools.map(t => t.id)) + 1 : 1;
    setTools(prev => [...prev, { ...tool, id: nextId }]);
  };

  return {
    selectedDate,
    setSelectedDate,
    isEditMode,
    toggleEditMode: () => setIsEditMode(prev => !prev),
    savedTemplate,
    saveTemplate,
    displayedScheduleItems: scheduleItems.filter(item => item.date === selectedDate),
    allSchedules: scheduleItems,
    assignees,
    tools,
    addScheduleItem,
    deleteScheduleItem,
    addAssignee,
    addTool,
  };
}
