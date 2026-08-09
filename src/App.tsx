import React, { useState } from 'react';
import { useScheduleStore } from './useScheduleStore';
import { formatScheduleMessage, generateWhatsAppLink } from './utils/whatsapp';
import { 
  Calendar as CalendarIcon, 
  Users, 
  Wrench, 
  FileText, 
  Plus, 
  Lock, 
  Unlock, 
  ChevronLeft, 
  ChevronRight, 
  Share2, 
  Copy, 
  Trash2,
  X
} from 'lucide-react';

export default function App() {
  const {
    selectedDate,
    setSelectedDate,
    isEditMode,
    toggleEditMode,
    savedTemplate,
    saveTemplate,
    displayedScheduleItems,
    assignees,
    tools,
    addScheduleItem,
    deleteScheduleItem,
    addAssignee,
    addTool,
  } = useScheduleStore();

  const [activeTab, setActiveTab] = useState<'schedule' | 'assignees' | 'tools' | 'templates'>('schedule');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states for job creation
  const [address, setAddress] = useState('');
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<number | ''>('');
  const [selectedToolId, setSelectedToolId] = useState<number | ''>('');

  // Form states for people & tools
  const [newAssigneeName, setNewAssigneeName] = useState('');
  const [newAssigneePhone, setNewAssigneePhone] = useState('');
  const [newToolName, setNewToolName] = useState('');
  const [newToolDesc, setNewToolDesc] = useState('');
  const [templateText, setTemplateText] = useState(savedTemplate);

  // Helper for generating weekly date strip around selected date
  const getWeekDates = (baseDateStr: string) => {
    const curr = new Date(baseDateStr);
    const day = curr.getDay();
    const diffToMon = curr.getDate() - day + (day === 0 ? -6 : 1);
    
    const monday = new Date(curr.setDate(diffToMon));
    const week = [];
    
    for (let i = 0; i < 7; i++) {
      const next = new Date(monday);
      next.setDate(monday.getDate() + i);
      week.push(next);
    }
    return week;
  };

  const currentWeekDays = getWeekDates(selectedDate);

  const formatDateStr = (d: Date) => d.toISOString().split('T')[0];

  const handlePrevWeek = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 7);
    setSelectedDate(formatDateStr(d));
  };

  const handleNextWeek = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 7);
    setSelectedDate(formatDateStr(d));
  };

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;

    addScheduleItem({
      date: selectedDate,
      address,
      assigneeId: selectedAssigneeId !== '' ? Number(selectedAssigneeId) : null,
      toolId: selectedToolId !== '' ? Number(selectedToolId) : null,
    });

    setAddress('');
    setSelectedAssigneeId('');
    setSelectedToolId('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-gray-50 text-gray-900 font-sans select-none overflow-hidden border-x border-gray-200">
      
      {/* Top Header */}
      <header className="flex justify-between items-center px-4 py-3 bg-white border-b border-gray-100">
        <h1 className="text-xl font-bold tracking-tight text-gray-900">Schedule Manager</h1>
        <button 
          onClick={toggleEditMode}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          <span>{isEditMode ? 'Edit Mode' : 'View Mode'}</span>
          {isEditMode ? <Unlock className="w-4 h-4 text-blue-600" /> : <Lock className="w-4 h-4 text-gray-600" />}
        </button>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto relative pb-20">

        {/* TAB 1: SCHEDULE */}
        {activeTab === 'schedule' && (
          <div className="flex flex-col h-full">
            
            {/* Week Carousel Navigation Header */}
            <div className="bg-white pb-3 pt-2 px-2 border-b border-gray-100 shadow-sm">
              <div className="flex justify-between items-center px-4 mb-3">
                <button onClick={handlePrevWeek} className="p-1 text-gray-600 hover:bg-gray-100 rounded-full">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="font-bold text-gray-800 text-sm">
                  {currentWeekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {currentWeekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <button onClick={handleNextWeek} className="p-1 text-gray-600 hover:bg-gray-100 rounded-full">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Day Pills Bar */}
              <div className="grid grid-cols-7 gap-1 px-1">
                {currentWeekDays.map((d) => {
                  const dateStr = formatDateStr(d);
                  const isSelected = dateStr === selectedDate;
                  const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
                  const dayNum = d.getDate();

                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`flex flex-col items-center py-2.5 rounded-xl transition ${
                        isSelected 
                          ? 'bg-indigo-900 text-white font-bold shadow-md' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <span className="text-[10px] tracking-wide">{dayName}</span>
                      <span className="text-sm font-semibold mt-0.5">{dayNum}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Schedule Items List / Empty State */}
            <div className="flex-1 p-4">
              {displayedScheduleItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 py-20">
                  <p className="text-sm font-medium">No schedules for this day.</p>
                  <p className="text-xs text-gray-400 mt-1">Tap + to add one.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {displayedScheduleItems.map((item) => {
                    const assignee = assignees.find(a => a.id === item.assigneeId);
                    const tool = tools.find(t => t.id === item.toolId);
                    const formattedMsg = formatScheduleMessage(savedTemplate, item, assignees, tools);
                    const waUrl = generateWhatsAppLink(formattedMsg, assignee?.phoneNumber);

                    return (
                      <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-2">
                        <p className="font-bold text-gray-900">{item.address}</p>
                        <div className="text-xs text-gray-600 space-y-1">
                          <p>👤 <span className="font-medium text-gray-800">{assignee ? assignee.name : 'Unassigned'}</span></p>
                          <p>🛠️ <span className="font-medium text-gray-800">{tool ? tool.name : 'No Tool'}</span></p>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-1 bg-emerald-600 text-white text-xs font-semibold py-2 rounded-xl hover:bg-emerald-700 transition"
                          >
                            <Share2 className="w-3.5 h-3.5" /> WhatsApp
                          </a>
                          <button
                            onClick={() => navigator.clipboard.writeText(formattedMsg)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl border border-gray-200"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          {isEditMode && (
                            <button
                              onClick={() => deleteScheduleItem(item.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-xl border border-gray-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Floating Add Button */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="fixed bottom-20 right-6 w-14 h-14 bg-indigo-100 text-indigo-900 rounded-2xl shadow-lg flex items-center justify-center hover:bg-indigo-200 transition active:scale-95"
            >
              <Plus className="w-7 h-7" />
            </button>
          </div>
        )}

        {/* TAB 2: ASSIGNEES */}
        {activeTab === 'assignees' && (
          <div className="p-4 space-y-4">
            <h2 className="text-lg font-bold">Assignees</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!newAssigneeName.trim()) return;
              addAssignee({ name: newAssigneeName, phoneNumber: newAssigneePhone });
              setNewAssigneeName('');
              setNewAssigneePhone('');
            }} className="bg-white p-4 rounded-2xl border border-gray-200 space-y-3">
              <input
                type="text"
                placeholder="Name"
                value={newAssigneeName}
                onChange={e => setNewAssigneeName(e.target.value)}
                className="w-full p-2.5 border rounded-xl text-sm"
                required
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={newAssigneePhone}
                onChange={e => setNewAssigneePhone(e.target.value)}
                className="w-full p-2.5 border rounded-xl text-sm"
              />
              <button type="submit" className="w-full bg-indigo-900 text-white py-2.5 rounded-xl text-sm font-semibold">
                Add Person
              </button>
            </form>

            <div className="bg-white rounded-2xl border border-gray-200 divide-y overflow-hidden">
              {assignees.map(a => (
                <div key={a.id} className="p-3.5 text-sm">
                  <p className="font-bold">{a.name}</p>
                  <p className="text-xs text-gray-500">{a.phoneNumber || 'No phone'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: TOOLS */}
        {activeTab === 'tools' && (
          <div className="p-4 space-y-4">
            <h2 className="text-lg font-bold">Tools</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!newToolName.trim()) return;
              addTool({ name: newToolName, description: newToolDesc });
              setNewToolName('');
              setNewToolDesc('');
            }} className="bg-white p-4 rounded-2xl border border-gray-200 space-y-3">
              <input
                type="text"
                placeholder="Tool Name"
                value={newToolName}
                onChange={e => setNewToolName(e.target.value)}
                className="w-full p-2.5 border rounded-xl text-sm"
                required
              />
              <input
                type="text"
                placeholder="Description"
                value={newToolDesc}
                onChange={e => setNewToolDesc(e.target.value)}
                className="w-full p-2.5 border rounded-xl text-sm"
              />
              <button type="submit" className="w-full bg-indigo-900 text-white py-2.5 rounded-xl text-sm font-semibold">
                Add Tool
              </button>
            </form>

            <div className="bg-white rounded-2xl border border-gray-200 divide-y overflow-hidden">
              {tools.map(t => (
                <div key={t.id} className="p-3.5 text-sm">
                  <p className="font-bold">{t.name}</p>
                  {t.description && <p className="text-xs text-gray-500">{t.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: TEMPLATES */}
        {activeTab === 'templates' && (
          <div className="p-4 space-y-4">
            <h2 className="text-lg font-bold">Message Template</h2>
            <div className="bg-white p-4 rounded-2xl border border-gray-200 space-y-3">
              <p className="text-xs text-gray-500">Available tags: {'{date}'}, {'{address}'}, {'{assignee}'}, {'{tool}'}</p>
              <textarea
                rows={5}
                value={templateText}
                onChange={e => setTemplateText(e.target.value)}
                className="w-full p-3 border rounded-xl font-mono text-sm"
              />
              <button
                onClick={() => saveTemplate(templateText)}
                className="w-full bg-indigo-900 text-white py-2.5 rounded-xl text-sm font-semibold"
              >
                Save Template
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Add Schedule Modal Pop-up */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-3xl p-6 space-y-4 animate-in slide-in-from-bottom">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-lg">Add New Schedule</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSchedule} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500">Job Address / Location</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Enter location address"
                  className="w-full p-2.5 border rounded-xl text-sm mt-1"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500">Assignee</label>
                <select
                  value={selectedAssigneeId}
                  onChange={e => setSelectedAssigneeId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full p-2.5 border rounded-xl text-sm mt-1 bg-white"
                >
                  <option value="">Select Assignee...</option>
                  {assignees.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500">Tool</label>
                <select
                  value={selectedToolId}
                  onChange={e => setSelectedToolId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full p-2.5 border rounded-xl text-sm mt-1 bg-white"
                >
                  <option value="">Select Tool...</option>
                  {tools.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-900 text-white py-3 rounded-xl font-bold mt-2"
              >
                Add Schedule
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav className="flex justify-around items-center bg-gray-100 border-t border-gray-200 py-2.5 px-2 fixed bottom-0 max-w-md w-full">
        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold transition ${
            activeTab === 'schedule' ? 'text-indigo-900' : 'text-gray-500'
          }`}
        >
          <div className={`p-1 px-4 rounded-full ${activeTab === 'schedule' ? 'bg-indigo-100' : ''}`}>
            <CalendarIcon className="w-5 h-5" />
          </div>
          Schedule
        </button>

        <button
          onClick={() => setActiveTab('assignees')}
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold transition ${
            activeTab === 'assignees' ? 'text-indigo-900' : 'text-gray-500'
          }`}
        >
          <div className={`p-1 px-4 rounded-full ${activeTab === 'assignees' ? 'bg-indigo-100' : ''}`}>
            <Users className="w-5 h-5" />
          </div>
          Assignees
        </button>

        <button
          onClick={() => setActiveTab('tools')}
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold transition ${
            activeTab === 'tools' ? 'text-indigo-900' : 'text-gray-500'
          }`}
        >
          <div className={`p-1 px-4 rounded-full ${activeTab === 'tools' ? 'bg-indigo-100' : ''}`}>
            <Wrench className="w-5 h-5" />
          </div>
          Tools
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold transition ${
            activeTab === 'templates' ? 'text-indigo-900' : 'text-gray-500'
          }`}
        >
          <div className={`p-1 px-4 rounded-full ${activeTab === 'templates' ? 'bg-indigo-100' : ''}`}>
            <FileText className="w-5 h-5" />
          </div>
          Templates
        </button>
      </nav>

    </div>
  );
}
