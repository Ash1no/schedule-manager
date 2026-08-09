import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  User,
  Wrench,
  FileText,
  Plus,
  Trash2,
  Edit2,
  Share2,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronRight,
  Phone,
  AlertTriangle,
  Check,
  X
} from 'lucide-react';

// ============================================================================
// HELPER FUNCTIONS & INITIAL DATA
// ============================================================================

const DEFAULT_DATE = '2026-08-08';

const INITIAL_SCHEDULES = [
  { id: 1, date: '2026-08-08', address: '123 Tech Park, Cyberjaya', assigneeId: 1, toolId: 1 },
  { id: 2, date: '2026-08-08', address: '456 Innovation Way, JB', assigneeId: 2, toolId: null },
  { id: 3, date: '2026-08-08', address: '789 Main HQ', assigneeId: null, toolId: 2 }
];

const INITIAL_ASSIGNEES = [
  { id: 1, name: 'Alex', phoneNumber: '60123456789' },
  { id: 2, name: 'Jordan', phoneNumber: '60129876543' },
  { id: 3, name: 'Taylor', phoneNumber: '601111223344' }
];

const INITIAL_TOOLS = [
  { id: 1, name: 'Drill Kit', description: 'Cordless power drill with bits' },
  { id: 2, name: 'Ladder', description: '6ft aluminum step ladder' },
  { id: 3, name: 'Multimeter', description: 'Digital voltage tester' }
];

const DEFAULT_TEMPLATE =
  "Hi {assignee}, here is your schedule:\n\n📅 Date: {date}\n📍 Address: {address}\n🛠 Tool: {tool}";

function sanitizePhoneNumber(raw) {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('601')) return digits;
  if (digits.startsWith('01')) return '60' + digits.slice(1);
  if (digits.startsWith('1')) return '60' + digits;
  return digits;
}

function isValidPhoneNumber(sanitized) {
  return sanitized.length >= 10 && sanitized.length <= 15;
}

// Date handling helpers
function parseISO(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

// ============================================================================
// MAIN APPLICATION CONTAINER
// ============================================================================

export default function ScheduleManagerApp() {
  // Persistence state
  const [schedules, setSchedules] = useState(() => {
    const saved = localStorage.getItem('sm_schedules');
    return saved ? JSON.parse(saved) : INITIAL_SCHEDULES;
  });

  const [assignees, setAssignees] = useState(() => {
    const saved = localStorage.getItem('sm_assignees');
    return saved ? JSON.parse(saved) : INITIAL_ASSIGNEES;
  });

  const [tools, setTools] = useState(() => {
    const saved = localStorage.getItem('sm_tools');
    return saved ? JSON.parse(saved) : INITIAL_TOOLS;
  });

  const [selectedDate, setSelectedDate] = useState(() => {
    return localStorage.getItem('sm_selected_date') || DEFAULT_DATE;
  });

  const [savedTemplate, setSavedTemplate] = useState(() => {
    return localStorage.getItem('sm_template') || DEFAULT_TEMPLATE;
  });

  // UI state
  const [activeTab, setActiveTab] = useState(0); // 0: Schedule, 1: Assignees, 2: Tools, 3: Template
  const [isEditMode, setIsEditMode] = useState(false);

  // Template change tracking
  const [templateDraft, setTemplateDraft] = useState(savedTemplate);
  const [hasUnsavedTemplateChanges, setHasUnsavedTemplateChanges] = useState(false);
  const [pendingTab, setPendingTab] = useState(null);

  // Sync state to local storage
  useEffect(() => { localStorage.setItem('sm_schedules', JSON.stringify(schedules)); }, [schedules]);
  useEffect(() => { localStorage.setItem('sm_assignees', JSON.stringify(assignees)); }, [assignees]);
  useEffect(() => { localStorage.setItem('sm_tools', JSON.stringify(tools)); }, [tools]);
  useEffect(() => { localStorage.setItem('sm_selected_date', selectedDate); }, [selectedDate]);
  useEffect(() => { localStorage.setItem('sm_template', savedTemplate); }, [savedTemplate]);

  // Tab switch guard for unsaved template changes
  const handleTabSwitch = (targetTab) => {
    if (activeTab === 3 && hasUnsavedTemplateChanges) {
      setPendingTab(targetTab);
    } else {
      setActiveTab(targetTab);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* TOP HEADER / BAR */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-400" /> Schedule Manager
          </h1>

          {activeTab === 0 && (
            <div className="flex items-center gap-3">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${isEditMode ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-700 text-slate-400'}`}>
                {isEditMode ? 'Edit Mode' : 'View Mode'}
              </span>
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className={`p-2 rounded-lg border transition ${
                  isEditMode
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                }`}
                title="Toggle Edit Mode"
              >
                {isEditMode ? <Edit2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>

        {/* BOTTOM NAVIGATION TABS */}
        <div className="max-w-4xl mx-auto px-4 flex gap-1 border-t border-slate-700/50">
          <TabButton icon={<Calendar />} label="Schedules" active={activeTab === 0} onClick={() => handleTabSwitch(0)} />
          <TabButton icon={<User />} label="Assignees" active={activeTab === 1} onClick={() => handleTabSwitch(1)} />
          <TabButton icon={<Wrench />} label="Tools" active={activeTab === 2} onClick={() => handleTabSwitch(2)} />
          <TabButton
            icon={<FileText />}
            label="Template"
            active={activeTab === 3}
            hasBadge={hasUnsavedTemplateChanges}
            onClick={() => handleTabSwitch(3)}
          />
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4">
        {activeTab === 0 && (
          <ScheduleTab
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            schedules={schedules}
            setSchedules={setSchedules}
            assignees={assignees}
            tools={tools}
            savedTemplate={savedTemplate}
            isEditMode={isEditMode}
          />
        )}

        {activeTab === 1 && (
          <AssigneesTab
            assignees={assignees}
            setAssignees={setAssignees}
            schedules={schedules}
            setSchedules={setSchedules}
          />
        )}

        {activeTab === 2 && (
          <ToolsTab
            tools={tools}
            setTools={setTools}
            schedules={schedules}
            setSchedules={setSchedules}
          />
        )}

        {activeTab === 3 && (
          <TemplatesTab
            savedTemplate={savedTemplate}
            setSavedTemplate={setSavedTemplate}
            templateDraft={templateDraft}
            setTemplateDraft={setTemplateDraft}
            hasUnsaved={hasUnsavedTemplateChanges}
            setHasUnsaved={setHasUnsavedTemplateChanges}
          />
        )}
      </main>

      {/* UNSAVED CHANGES GUARD MODAL */}
      {pendingTab !== null && (
        <Modal onClose={() => setPendingTab(null)} title="Unsaved Changes">
          <p className="text-slate-300 text-sm mb-6">
            You have unsaved template edits. Are you sure you want to leave? Your changes will be lost.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setPendingTab(null)}
              className="px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-200"
            >
              Keep Editing
            </button>
            <button
              onClick={() => {
                setTemplateDraft(savedTemplate);
                setHasUnsavedTemplateChanges(false);
                setActiveTab(pendingTab);
                setPendingTab(null);
              }}
              className="px-4 py-2 text-sm bg-rose-600 hover:bg-rose-500 rounded-lg text-white font-medium"
            >
              Discard & Leave
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// Navigation Tab Component
function TabButton({ icon, label, active, onClick, hasBadge }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
        active
          ? 'border-indigo-500 text-indigo-400 bg-slate-800/50'
          : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
      }`}
    >
      {React.cloneElement(icon, { className: 'w-4 h-4' })}
      <span>{label}</span>
      {hasBadge && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
    </button>
  );
}

// ============================================================================
// TAB 1: SCHEDULE TAB & WEEK HEADER
// ============================================================================

function ScheduleTab({
  selectedDate,
  setSelectedDate,
  schedules,
  setSchedules,
  assignees,
  tools,
  savedTemplate,
  isEditMode
}) {
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Filtered schedules for selected date
  const displayedItems = useMemo(() => {
    return schedules.filter((s) => s.date === selectedDate);
  }, [schedules, selectedDate]);

  const handleSaveSchedule = (item) => {
    if (item.id) {
      setSchedules((prev) => prev.map((s) => (s.id === item.id ? item : s)));
    } else {
      const nextId = schedules.length ? Math.max(...schedules.map((s) => s.id)) + 1 : 1;
      setSchedules((prev) => [...prev, { ...item, id: nextId }]);
    }
    setShowAddEditModal(false);
  };

  const handleDeleteSchedule = (id) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* 7-DAY WEEK STRIP HEADER */}
      <WeekHeaderStrip
        selectedDate={selectedDate}
        schedules={schedules}
        onDateSelected={setSelectedDate}
      />

      {/* SCHEDULE CARDS LIST */}
      {displayedItems.length === 0 ? (
        <div className="text-center py-16 bg-slate-800/40 rounded-xl border border-dashed border-slate-700">
          <p className="text-slate-400 text-base">No schedules for this day.</p>
          <p className="text-slate-500 text-xs mt-1">Tap + button to add one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedItems.map((item) => {
            const assignee = assignees.find((a) => a.id === item.assigneeId);
            const tool = tools.find((t) => t.id === item.toolId);

            return (
              <ScheduleCard
                key={item.id}
                item={item}
                assignee={assignee}
                tool={tool}
                savedTemplate={savedTemplate}
                isEditMode={isEditMode}
                onEdit={() => {
                  setEditingItem(item);
                  setShowAddEditModal(true);
                }}
                onDelete={() => handleDeleteSchedule(item.id)}
              />
            );
          })}
        </div>
      )}

      {/* FLOATING ACTION BUTTON */}
      <button
        onClick={() => {
          setEditingItem(null);
          setShowAddEditModal(true);
        }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-900/40 transition transform active:scale-95 z-10"
        title="Add Schedule"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* ADD/EDIT MODAL */}
      {showAddEditModal && (
        <AddEditScheduleModal
          selectedDate={selectedDate}
          existingItem={editingItem}
          assignees={assignees}
          tools={tools}
          onClose={() => setShowAddEditModal(false)}
          onSave={handleSaveSchedule}
        />
      )}
    </div>
  );
}

// 7-Day Horizontal Week Selector Component
function WeekHeaderStrip({ selectedDate, schedules, onDateSelected }) {
  const currentDate = useMemo(() => parseISO(selectedDate), [selectedDate]);
  const monday = useMemo(() => getMonday(currentDate), [currentDate]);

  const sunday = useMemo(() => {
    const sun = new Date(monday);
    sun.setDate(sun.getDate() + 6);
    return sun;
  }, [monday]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [monday]);

  const shiftWeek = (weeks) => {
    const nextDate = new Date(monday);
    nextDate.setDate(nextDate.getDate() + weeks * 7);
    onDateSelected(formatISO(nextDate));
  };

  const rangeText = `${monday.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit'
  })} - ${sunday.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit'
  })}, ${sunday.getFullYear()}`;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 shadow-sm">
      {/* Week Title Bar */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => shiftWeek(-1)}
          className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="relative group flex items-center gap-2 cursor-pointer">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => e.target.value && onDateSelected(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <span className="font-semibold text-sm text-slate-200 group-hover:text-indigo-400 transition">
            {rangeText}
          </span>
        </div>

        <button
          onClick={() => shiftWeek(1)}
          className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* 7 Day Pills */}
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((dayDate) => {
          const iso = formatISO(dayDate);
          const isSelected = iso === selectedDate;
          const dayName = dayDate
            .toLocaleDateString('en-US', { weekday: 'short' })
            .toUpperCase();
          const dayNum = dayDate.getDate();

          // Count schedules for dots
          const eventCount = schedules.filter((s) => s.date === iso).length;
          const maxDots = Math.min(eventCount, 9);
          const topRowDots = Math.min(maxDots, 5);
          const bottomRowDots = Math.max(0, maxDots - 5);

          return (
            <button
              key={iso}
              onClick={() => onDateSelected(iso)}
              className={`flex flex-col items-center py-2 px-1 rounded-lg transition ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <span className="text-[10px] font-bold tracking-wider opacity-80">{dayName}</span>
              <span className="text-sm font-semibold my-0.5">{dayNum}</span>

              {/* Event count indicator dots */}
              <div className="h-2.5 flex flex-col justify-center gap-0.5">
                {topRowDots > 0 && (
                  <div className="flex gap-0.5">
                    {Array.from({ length: topRowDots }).map((_, i) => (
                      <span
                        key={i}
                        className={`w-1 h-1 rounded-full ${
                          isSelected ? 'bg-white' : 'bg-slate-400'
                        }`}
                      />
                    ))}
                  </div>
                )}
                {bottomRowDots > 0 && (
                  <div className="flex gap-0.5">
                    {Array.from({ length: bottomRowDots }).map((_, i) => (
                      <span
                        key={i}
                        className={`w-1 h-1 rounded-full ${
                          isSelected ? 'bg-white' : 'bg-slate-400'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Individual Schedule Card Component
function ScheduleCard({ item, assignee, tool, savedTemplate, isEditMode, onEdit, onDelete }) {
  const assigneeName = assignee ? assignee.name : 'Unassigned';
  const toolName = tool ? tool.name : 'None';

  const handleWhatsAppShare = () => {
    const rawTemplate = savedTemplate.trim() || DEFAULT_TEMPLATE;
    const formattedMessage = rawTemplate
      .replace(/{assignee}/g, assigneeName)
      .replace(/{name}/g, assigneeName)
      .replace(/{date}/g, item.date)
      .replace(/{address}/g, item.address)
      .replace(/{location}/g, item.address)
      .replace(/{tool}/g, toolName);

    const cleanPhone = assignee ? sanitizePhoneNumber(assignee.phoneNumber) : '';
    const encodedText = encodeURIComponent(formattedMessage);

    const url = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`
      : `https://api.whatsapp.com/send?text=${encodedText}`;

    window.open(url, '_blank');
  };

  return (
    <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 shadow-sm hover:border-slate-600 transition">
      <div className="flex justify-between items-start gap-2">
        <h3 className="font-semibold text-slate-100 text-base leading-snug">{item.address}</h3>

        {isEditMode ? (
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={onEdit}
              className="p-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-slate-700 rounded-lg"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-slate-700 rounded-lg"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleWhatsAppShare}
            className="p-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/50 rounded-lg transition"
            title="Share via WhatsApp"
          >
            <Share2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        <span className="inline-flex items-center gap-1.5 text-xs bg-slate-700/60 text-slate-300 px-2.5 py-1 rounded-full border border-slate-600/50">
          <User className="w-3 h-3 text-indigo-400" />
          {assigneeName}
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs bg-slate-700/60 text-slate-300 px-2.5 py-1 rounded-full border border-slate-600/50">
          <Wrench className="w-3 h-3 text-emerald-400" />
          {toolName}
        </span>
      </div>
    </div>
  );
}

// Add / Edit Schedule Dialog Component
function AddEditScheduleModal({ selectedDate, existingItem, assignees, tools, onClose, onSave }) {
  const [address, setAddress] = useState(existingItem?.address || '');

  // Assignee selection / search state
  const initialAssignee = assignees.find((a) => a.id === existingItem?.assigneeId);
  const [assigneeSearch, setAssigneeSearch] = useState(initialAssignee?.name || '');
  const [selectedAssignee, setSelectedAssignee] = useState(initialAssignee || null);
  const [assigneeOpen, setAssigneeOpen] = useState(false);

  // Tool selection / search state
  const initialTool = tools.find((t) => t.id === existingItem?.toolId);
  const [toolSearch, setToolSearch] = useState(initialTool?.name || '');
  const [selectedTool, setSelectedTool] = useState(initialTool || null);
  const [toolOpen, setToolOpen] = useState(false);

  const filteredAssignees = assignees.filter((a) =>
    a.name.toLowerCase().startsWith(assigneeSearch.toLowerCase())
  );

  const filteredTools = tools.filter((t) =>
    t.name.toLowerCase().startsWith(toolSearch.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    // Auto-resolve typed name if exact match found
    const finalAssignee =
      selectedAssignee ||
      assignees.find((a) => a.name.toLowerCase() === assigneeSearch.trim().toLowerCase());

    const finalTool =
      selectedTool ||
      tools.find((t) => t.name.toLowerCase() === toolSearch.trim().toLowerCase());

    onSave({
      id: existingItem?.id || null,
      date: selectedDate,
      address,
      assigneeId: finalAssignee ? finalAssignee.id : null,
      toolId: finalTool ? finalTool.id : null
    });
  };

  return (
    <Modal onClose={onClose} title={existingItem ? 'Edit Schedule' : 'Add Schedule'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Address / Location
          </label>
          <input
            type="text"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            placeholder="e.g. 123 Tech Park, Cyberjaya"
          />
        </div>

        {/* ASSIGNEE AUTOCOMPLETE */}
        <div className="relative">
          <label className="block text-xs font-medium text-slate-400 mb-1">Assignee</label>
          <input
            type="text"
            value={assigneeSearch}
            onFocus={() => setAssigneeOpen(true)}
            onChange={(e) => {
              setAssigneeSearch(e.target.value);
              setSelectedAssignee(null);
              setAssigneeOpen(true);
            }}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            placeholder="Search or select assignee"
          />

          {assigneeOpen && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-40 overflow-y-auto z-30">
              <div
                onClick={() => {
                  setSelectedAssignee(null);
                  setAssigneeSearch('');
                  setAssigneeOpen(false);
                }}
                className="px-3 py-2 text-sm hover:bg-slate-700 cursor-pointer text-slate-400"
              >
                Unassigned
              </div>
              {filteredAssignees.map((a) => (
                <div
                  key={a.id}
                  onClick={() => {
                    setSelectedAssignee(a);
                    setAssigneeSearch(a.name);
                    setAssigneeOpen(false);
                  }}
                  className="px-3 py-2 text-sm hover:bg-slate-700 cursor-pointer text-slate-200"
                >
                  {a.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TOOL AUTOCOMPLETE */}
        <div className="relative">
          <label className="block text-xs font-medium text-slate-400 mb-1">Tool Required</label>
          <input
            type="text"
            value={toolSearch}
            onFocus={() => setToolOpen(true)}
            onChange={(e) => {
              setToolSearch(e.target.value);
              setSelectedTool(null);
              setToolOpen(true);
            }}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            placeholder="Search or select tool"
          />

          {toolOpen && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-40 overflow-y-auto z-30">
              <div
                onClick={() => {
                  setSelectedTool(null);
                  setToolSearch('');
                  setToolOpen(false);
                }}
                className="px-3 py-2 text-sm hover:bg-slate-700 cursor-pointer text-slate-400"
              >
                None
              </div>
              {filteredTools.map((t) => (
                <div
                  key={t.id}
                  onClick={() => {
                    setSelectedTool(t);
                    setToolSearch(t.name);
                    setToolOpen(false);
                  }}
                  className="px-3 py-2 text-sm hover:bg-slate-700 cursor-pointer text-slate-200"
                >
                  {t.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg"
          >
            Save
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ============================================================================
// TAB 2: ASSIGNEES DIRECTORY TAB
// ============================================================================

function AssigneesTab({ assignees, setAssignees, setSchedules }) {
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [phoneError, setPhoneError] = useState(null);

  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [editingAssignee, setEditingAssignee] = useState(null);
  const [deletingAssignee, setDeletingAssignee] = useState(null);

  const handleAdd = () => {
    const trimmed = newName.trim();
    const sanitized = sanitizePhoneNumber(newPhone);

    if (!isValidPhoneNumber(sanitized)) {
      setPhoneError('Phone number must be 10-15 digits');
      return;
    }
    setPhoneError(null);

    const isDuplicate = assignees.some(
      (a) => a.name.toLowerCase() === trimmed.toLowerCase()
    );

    if (isDuplicate) {
      setDuplicateWarning({ name: trimmed, phone: sanitized });
    } else {
      executeAddAssignee(trimmed, sanitized);
    }
  };

  const executeAddAssignee = (name, phone) => {
    const nextId = assignees.length ? Math.max(...assignees.map((a) => a.id)) + 1 : 1;
    setAssignees((prev) => [...prev, { id: nextId, name, phoneNumber: phone }]);
    setNewName('');
    setNewPhone('');
    setDuplicateWarning(null);
  };

  const handleDelete = (id) => {
    setAssignees((prev) => prev.filter((a) => a.id !== id));
    // Clear assignee reference in schedules
    setSchedules((prev) =>
      prev.map((s) => (s.assigneeId === id ? { ...s, assigneeId: null } : s))
    );
    setDeletingAssignee(null);
  };

  return (
    <div className="space-y-4">
      {/* ADD ASSIGNEE FORM CARD */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-slate-200 mb-3">Add New Assignee</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
          />
          <input
            type="text"
            placeholder="Phone Number (e.g. 0123456789)"
            value={newPhone}
            onChange={(e) => {
              setNewPhone(e.target.value);
              setPhoneError(null);
            }}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {phoneError && <p className="text-rose-400 text-xs mt-1.5">{phoneError}</p>}

        <div className="flex justify-end mt-3">
          <button
            onClick={handleAdd}
            disabled={!newName.trim() || !newPhone.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition"
          >
            Add Assignee
          </button>
        </div>
      </div>

      {/* ASSIGNEES LIST */}
      {assignees.length === 0 ? (
        <p className="text-center py-10 text-slate-500 text-sm">No assignees saved in directory.</p>
      ) : (
        <div className="space-y-2">
          {assignees.map((assignee) => (
            <div
              key={assignee.id}
              className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2 text-slate-100 font-medium text-sm">
                  <User className="w-4 h-4 text-indigo-400" />
                  {assignee.name}
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-xs mt-1">
                  <Phone className="w-3.5 h-3.5" />
                  +{assignee.phoneNumber}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setEditingAssignee(assignee)}
                  className="p-1.5 text-indigo-400 hover:bg-slate-700 rounded-lg"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeletingAssignee(assignee)}
                  className="p-1.5 text-rose-400 hover:bg-slate-700 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DUPLICATE WARNING MODAL */}
      {duplicateWarning && (
        <Modal onClose={() => setDuplicateWarning(null)} title="Duplicate Assignee Name">
          <p className="text-slate-300 text-sm mb-6">
            An assignee named '{duplicateWarning.name}' already exists. Do you still want to add
            this contact?
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setDuplicateWarning(null)}
              className="px-4 py-2 text-sm bg-slate-700 text-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={() =>
                executeAddAssignee(duplicateWarning.name, duplicateWarning.phone)
              }
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg"
            >
              Add Anyway
            </button>
          </div>
        </Modal>
      )}

      {/* EDIT ASSIGNEE MODAL */}
      {editingAssignee && (
        <EditAssigneeModal
          assignee={editingAssignee}
          onClose={() => setEditingAssignee(null)}
          onSave={(updated) => {
            setAssignees((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
            setEditingAssignee(null);
          }}
        />
      )}

      {/* DELETE CONFIRM MODAL */}
      {deletingAssignee && (
        <Modal onClose={() => setDeletingAssignee(null)} title="Delete Assignee">
          <p className="text-slate-300 text-sm mb-6">
            Are you sure you want to delete '{deletingAssignee.name}'?
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setDeletingAssignee(null)}
              className="px-4 py-2 text-sm bg-slate-700 text-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDelete(deletingAssignee.id)}
              className="px-4 py-2 text-sm bg-rose-600 text-white rounded-lg"
            >
              Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function EditAssigneeModal({ assignee, onClose, onSave }) {
  const [name, setName] = useState(assignee.name);
  const [phone, setPhone] = useState(assignee.phoneNumber);
  const [error, setError] = useState(null);

  const handleSave = () => {
    const sanitized = sanitizePhoneNumber(phone);
    if (!isValidPhoneNumber(sanitized)) {
      setError('Phone number must be 10-15 digits');
      return;
    }
    onSave({ ...assignee, name: name.trim(), phoneNumber: sanitized });
  };

  return (
    <Modal onClose={onClose} title="Edit Assignee">
      <div className="space-y-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100"
        />
        <input
          type="text"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            setError(null);
          }}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100"
        />
        {error && <p className="text-rose-400 text-xs">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm bg-slate-700 text-slate-200 rounded-lg">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || !phone.trim()}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg disabled:opacity-50"
          >
            Save Changes
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ============================================================================
// TAB 3: TOOLS MANAGEMENT TAB
// ============================================================================

function ToolsTab({ tools, setTools, setSchedules }) {
  const [showModal, setShowModal] = useState(false);
  const [editingTool, setEditingTool] = useState(null);

  const handleSaveTool = (name, description) => {
    if (editingTool) {
      setTools((prev) =>
        prev.map((t) => (t.id === editingTool.id ? { ...t, name, description } : t))
      );
    } else {
      const nextId = tools.length ? Math.max(...tools.map((t) => t.id)) + 1 : 1;
      setTools((prev) => [...prev, { id: nextId, name, description }]);
    }
    setShowModal(false);
  };

  const handleDeleteTool = (id) => {
    setTools((prev) => prev.filter((t) => t.id !== id));
    // Clear tool reference in schedules
    setSchedules((prev) => prev.map((s) => (s.toolId === id ? { ...s, toolId: null } : s)));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-slate-100">Tool Directory</h2>
        <button
          onClick={() => {
            setEditingTool(null);
            setShowModal(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow transition"
        >
          <Plus className="w-4 h-4" /> Add Tool
        </button>
      </div>

      {tools.length === 0 ? (
        <div className="text-center py-16 bg-slate-800/40 rounded-xl border border-dashed border-slate-700">
          <p className="text-slate-400 text-base">No tools added yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tools.map((tool) => (
            <div
              key={tool.id}
              className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 flex items-center justify-between"
            >
              <div>
                <h3 className="text-slate-100 font-medium text-sm flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-emerald-400" />
                  {tool.name}
                </h3>
                {tool.description && (
                  <p className="text-slate-400 text-xs mt-1">{tool.description}</p>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setEditingTool(tool);
                    setShowModal(true);
                  }}
                  className="p-1.5 text-indigo-400 hover:bg-slate-700 rounded-lg"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteTool(tool.id)}
                  className="p-1.5 text-rose-400 hover:bg-slate-700 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <AddEditToolModal
          existingTool={editingTool}
          onClose={() => setShowModal(false)}
          onSave={handleSaveTool}
        />
      )}
    </div>
  );
}

function AddEditToolModal({ existingTool, onClose, onSave }) {
  const [name, setName] = useState(existingTool?.name || '');
  const [description, setDescription] = useState(existingTool?.description || '');

  return (
    <Modal onClose={onClose} title={existingTool ? 'Edit Tool' : 'Add Tool'}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) onSave(name.trim(), description.trim());
        }}
        className="space-y-3"
      >
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Tool Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 h-20"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm bg-slate-700 text-slate-200 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim()}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ============================================================================
// TAB 4: TEMPLATE EDITOR TAB
// ============================================================================

function TemplatesTab({
  savedTemplate,
  setSavedTemplate,
  templateDraft,
  setTemplateDraft,
  hasUnsaved,
  setHasUnsaved
}) {
  const tags = ['{assignee}', '{date}', '{address}', '{tool}'];

  const handleTextChange = (value) => {
    setTemplateDraft(value);
    setHasUnsaved(value !== savedTemplate);
  };

  const insertTag = (tag) => {
    const nextText = templateDraft + tag;
    setTemplateDraft(nextText);
    setHasUnsaved(nextText !== savedTemplate);
  };

  const handleSave = () => {
    setSavedTemplate(templateDraft);
    setHasUnsaved(false);
  };

  // Preview renderer
  const previewText = useMemo(() => {
    const raw = templateDraft.trim() || DEFAULT_TEMPLATE;
    return raw
      .replace(/{assignee}/g, 'Alex')
      .replace(/{name}/g, 'Alex')
      .replace(/{date}/g, '2026-08-08')
      .replace(/{address}/g, '123 Tech Park, Cyberjaya')
      .replace(/{location}/g, '123 Tech Park, Cyberjaya')
      .replace(/{tool}/g, 'Drill Kit');
  }, [templateDraft]);

  return (
    <div className="space-y-4">
      {/* EDITOR CARD */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-200">WhatsApp Message Template</h2>
          {hasUnsaved && (
            <span className="text-xs text-amber-400 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Unsaved changes
            </span>
          )}
        </div>

        {/* Placeholder Tag Injection Buttons */}
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => insertTag(tag)}
              className="text-xs font-mono bg-slate-700 hover:bg-indigo-900/60 hover:text-indigo-300 text-slate-300 px-2 py-1 rounded border border-slate-600 transition"
            >
              + {tag}
            </button>
          ))}
        </div>

        <textarea
          value={templateDraft}
          onChange={(e) => handleTextChange(e.target.value)}
          rows={6}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
          placeholder="Enter custom template..."
        />

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={!hasUnsaved}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition"
          >
            <Check className="w-4 h-4" /> Save Template
          </button>
        </div>
      </div>

      {/* LIVE PREVIEW CARD */}
      <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4 space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Live WhatsApp Preview
        </h3>
        <div className="bg-emerald-950/30 border border-emerald-900/40 rounded-lg p-3 text-sm text-emerald-100 whitespace-pre-wrap font-sans">
          {previewText}
        </div>
      </div>
    </div>
  );
}

// General Modal Shell Component
function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-bold text-slate-100">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
