import React, { useState } from 'react';
import { useScheduleStore } from './useScheduleStore';
import { formatScheduleMessage, generateWhatsAppLink } from './utils/whatsapp';
import { Calendar, Plus, Trash2, Share2, Copy, Settings, UserPlus, Wrench } from 'lucide-react';

export default function App() {
  const {
    selectedDate,
    setSelectedDate,
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

  const [activeTab, setActiveTab] = useState<'schedules' | 'assignees' | 'tools' | 'settings'>('schedules');

  // Form states for creating a new schedule
  const [address, setAddress] = useState('');
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<number | ''>('');
  const [selectedToolId, setSelectedToolId] = useState<number | ''>('');

  // Form states for adding people and tools
  const [newAssigneeName, setNewAssigneeName] = useState('');
  const [newAssigneePhone, setNewAssigneePhone] = useState('');
  const [newToolName, setNewToolName] = useState('');
  const [newToolDesc, setNewToolDesc] = useState('');

  // Template editor state
  const [templateText, setTemplateText] = useState(savedTemplate);

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
  };

  const handleAddAssignee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssigneeName.trim()) return;
    addAssignee({ name: newAssigneeName, phoneNumber: newAssigneePhone });
    setNewAssigneeName('');
    setNewAssigneePhone('');
  };

  const handleAddTool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newToolName.trim()) return;
    addTool({ name: newToolName, description: newToolDesc });
    setNewToolName('');
    setNewToolDesc('');
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-12">
      {/* Top Bar */}
      <header className="bg-blue-600 text-white p-4 shadow-md sticky top-0 z-10">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Calendar className="w-6 h-6" /> Schedule Manager
          </h1>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-md mx-auto p-4 space-y-6">

        {/* Navigation Tabs */}
        <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200 justify-around">
          <button
            onClick={() => setActiveTab('schedules')}
            className={`flex-1 py-2 text-sm font-medium rounded-md text-center ${activeTab === 'schedules' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
          >
            Schedules
          </button>
          <button
            onClick={() => setActiveTab('assignees')}
            className={`flex-1 py-2 text-sm font-medium rounded-md text-center ${activeTab === 'assignees' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
          >
            People
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`flex-1 py-2 text-sm font-medium rounded-md text-center ${activeTab === 'tools' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
          >
            Tools
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-2 text-sm font-medium rounded-md text-center ${activeTab === 'settings' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
          >
            Template
          </button>
        </div>

        {/* SCHEDULES TAB */}
        {activeTab === 'schedules' && (
          <div className="space-y-4">
            {/* Date Selector */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Select Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Add New Schedule Form */}
            <form onSubmit={handleAddSchedule} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-3">
              <h2 className="font-bold text-gray-800 text-base flex items-center gap-1">
                <Plus className="w-5 h-5 text-blue-600" /> Add New Job
              </h2>
              <div>
                <input
                  type="text"
                  placeholder="Address / Job Location"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={selectedAssigneeId}
                  onChange={(e) => setSelectedAssigneeId(e.target.value ? Number(e.target.value) : '')}
                  className="p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Assign Person...</option>
                  {assignees.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>

                <select
                  value={selectedToolId}
                  onChange={(e) => setSelectedToolId(e.target.value ? Number(e.target.value) : '')}
                  className="p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Select Tool...</option>
                  {tools.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Save Schedule
              </button>
            </form>

            {/* List of Schedules */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-700 text-sm">Jobs for {selectedDate}</h3>
              {displayedScheduleItems.length === 0 ? (
                <div className="bg-white p-6 rounded-xl text-center text-gray-500 text-sm border border-gray-200">
                  No tasks scheduled for this date.
                </div>
              ) : (
                displayedScheduleItems.map((item) => {
                  const assignedPerson = assignees.find(a => a.id === item.assigneeId);
                  const assignedTool = tools.find(t => t.id === item.toolId);
                  const formattedMsg = formatScheduleMessage(savedTemplate, item, assignees, tools);
                  const waUrl = generateWhatsAppLink(formattedMsg, assignedPerson?.phoneNumber);

                  return (
                    <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-3">
                      <div>
                        <p className="font-bold text-gray-800">{item.address}</p>
                        <div className="text-xs text-gray-500 space-y-0.5 mt-1">
                          <p>👤 <span className="font-medium text-gray-700">{assignedPerson ? assignedPerson.name : 'Unassigned'}</span></p>
                          <p>🛠️ <span className="font-medium text-gray-700">{assignedTool ? assignedTool.name : 'No Tool'}</span></p>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-1 bg-green-600 text-white text-xs font-semibold py-2 rounded-lg hover:bg-green-700 transition"
                        >
                          <Share2 className="w-3.5 h-3.5" /> WhatsApp
                        </a>

                        <button
                          onClick={() => navigator.clipboard.writeText(formattedMsg)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200"
                          title="Copy Message"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => deleteScheduleItem(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg border border-gray-200"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* PEOPLE TAB */}
        {activeTab === 'assignees' && (
          <div className="space-y-4">
            <form onSubmit={handleAddAssignee} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-3">
              <h2 className="font-bold text-gray-800 text-base flex items-center gap-1">
                <UserPlus className="w-5 h-5 text-blue-600" /> Add Team Member
              </h2>
              <input
                type="text"
                placeholder="Full Name"
                value={newAssigneeName}
                onChange={(e) => setNewAssigneeName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                required
              />
              <input
                type="tel"
                placeholder="Phone (e.g. 60123456789)"
                value={newAssigneePhone}
                onChange={(e) => setNewAssigneePhone(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              />
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium">
                Add Person
              </button>
            </form>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y">
              {assignees.map(a => (
                <div key={a.id} className="p-3 flex justify-between items-center text-sm">
                  <div>
                    <p className="font-semibold text-gray-800">{a.name}</p>
                    <p className="text-xs text-gray-500">{a.phoneNumber || 'No phone number'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TOOLS TAB */}
        {activeTab === 'tools' && (
          <div className="space-y-4">
            <form onSubmit={handleAddTool} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-3">
              <h2 className="font-bold text-gray-800 text-base flex items-center gap-1">
                <Wrench className="w-5 h-5 text-blue-600" /> Add Tool / Equipment
              </h2>
              <input
                type="text"
                placeholder="Tool Name"
                value={newToolName}
                onChange={(e) => setNewToolName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                required
              />
              <input
                type="text"
                placeholder="Description / Notes"
                value={newToolDesc}
                onChange={(e) => setNewToolDesc(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              />
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium">
                Add Tool
              </button>
            </form>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y">
              {tools.map(t => (
                <div key={t.id} className="p-3 text-sm">
                  <p className="font-semibold text-gray-800">{t.name}</p>
                  {t.description && <p className="text-xs text-gray-500">{t.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TEMPLATE SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-4">
            <h2 className="font-bold text-gray-800 text-base flex items-center gap-1">
              <Settings className="w-5 h-5 text-blue-600" /> WhatsApp Template
            </h2>
            <p className="text-xs text-gray-500">
              Customize how your schedule text looks when sharing. Available tags: <code className="bg-gray-100 px-1 font-mono text-blue-600">{'{date}'}</code>, <code className="bg-gray-100 px-1 font-mono text-blue-600">{'{address}'}</code>, <code className="bg-gray-100 px-1 font-mono text-blue-600">{'{assignee}'}</code>, <code className="bg-gray-100 px-1 font-mono text-blue-600">{'{tool}'}</code>.
            </p>

            <textarea
              rows={5}
              value={templateText}
              onChange={(e) => setTemplateText(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              onClick={() => saveTemplate(templateText)}
              className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
              Save Template Format
            </button>
          </div>
        )}

      </main>
    </div>
  );
}
