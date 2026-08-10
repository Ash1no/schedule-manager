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
  ChevronLeft,
  ChevronRight,
  Phone,
  AlertTriangle,
  Check,
  X,
  BookOpen,
  Clock
} from 'lucide-react';

// ============================================================================
// HELPER FUNCTIONS & INITIAL DATA
// ============================================================================

const DEFAULT_DATE = '2026-08-08';

const INITIAL_SCHEDULES = [
  { id: 1, date: '2026-08-08', address: '123 Tech Park, Cyberjaya', assigneeId: 1, secondaryAssigneeId: 2, toolId: 1, isHalfDay: true, halfDayPeriod: 'AM' },
  { id: 2, date: '2026-08-08', address: '456 Innovation Way, JB', assigneeId: 2, secondaryAssigneeId: null, toolId: null, isHalfDay: false, halfDayPeriod: 'AM' },
  { id: 3, date: '2026-08-08', address: '789 Main HQ', assigneeId: null, secondaryAssigneeId: null, toolId: 2, isHalfDay: true, halfDayPeriod: 'PM' }
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
  "Hi {assignee}, here is your schedule:\n\n📅 Date: {date}\n⏱ Shift: {halfDay}\n📍 Address: {address}\n🔧 Tool: {tool}";

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

  const [activeTab, setActiveTab] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);

  const [templateDraft, setTemplateDraft] = useState(savedTemplate);
  const [hasUnsavedTemplateChanges, setHasUnsavedTemplateChanges] = useState(false);
  const [pendingTab, setPendingTab] = useState(null);

  useEffect(() => { localStorage.setItem('sm_schedules', JSON.stringify(schedules)); }, [schedules]);
  useEffect(() => { localStorage.setItem('sm_assignees', JSON.stringify(assignees)); }, [assignees]);
  useEffect(() => { localStorage.setItem('sm_tools', JSON.stringify(tools)); }, [tools]);
  useEffect(() => { localStorage.setItem('sm_selected_date', selectedDate); }, [selectedDate]);
  useEffect(() => { localStorage.setItem('sm_template', savedTemplate); }, [savedTemplate]);

  const handleTabSwitch = (targetTab) => {
    if (activeTab === 3 && hasUnsavedTemplateChanges) {
      setPendingTab(targetTab);
    } else {
      setActiveTab(targetTab);
    }
  };

  return (
    <div className="h-screen h-[100dvh] bg-white text-black flex flex-col font-sans w-full max-w-md mx-auto overflow-hidden border-x border-black relative min-w-0">
      <header className="bg-white border-b border-black shrink-0 z-20">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-base font-bold tracking-tight text-black flex items-center gap-2 font-mono">
            <BookOpen className="w-5 h-5 text-black" /> SCHEDULE_PLANNER
          </h1>

          {activeTab === 0 && (
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-black ${
                isEditMode ? 'bg-black text-white' : 'bg-white text-black'
              }`}>
                {isEditMode ? 'EDIT' : 'VIEW'}
              </span>
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className={`p-1.5 rounded border border-black transition ${
                  isEditMode ? 'bg-black text-white' : 'bg-white text-black hover:bg-zinc-100'
                }`}
                title="Toggle Edit Mode"
              >
                {isEditMode ? <Edit2 className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-1.5 border-t border-black overflow-x-auto no-scrollbar whitespace-nowrap px-3 py-2 bg-white">
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

      <main className="flex-1 w-full p-3.5 min-w-0 bg-white overflow-y-auto relative pb-24">
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

      {pendingTab !== null && (
        <Modal onClose={() => setPendingTab(null)} title="Unsaved Edits">
          <p className="text-black text-xs font-mono mb-5 leading-relaxed">
            Unsaved template edits exist. Leaving now will discard your changes.
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setPendingTab(null)}
              className="px-3 py-1.5 text-xs font-mono bg-white hover:bg-zinc-100 border border-black text-black rounded"
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
              className="px-3 py-1.5 text-xs font-mono bg-black hover:bg-zinc-800 text-white font-semibold rounded"
            >
              Discard & Leave
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function TabButton({ icon, label, active, onClick, hasBadge }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono transition rounded border border-black ${
        active ? 'bg-black text-white font-bold' : 'bg-white text-black hover:bg-zinc-100'
      }`}
    >
      {React.cloneElement(icon, { className: 'w-3.5 h-3.5' })}
      <span>{label}</span>
      {hasBadge && <span className="w-2 h-2 rounded-full bg-amber-500" />}
    </button>
  );
}

// ============================================================================
// TAB 1: SCHEDULE TAB
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
  const [deletingSchedule, setDeletingSchedule] = useState(null);

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
    setDeletingSchedule(null);
  };

  return (
    <div className="space-y-3.5 min-w-0 bg-white">
      <WeekHeaderStrip
        selectedDate={selectedDate}
        schedules={schedules}
        onDateSelected={setSelectedDate}
      />

      {displayedItems.length === 0 ? (
        <div className="text-center py-12 bg-white rounded border-2 border-dashed border-black">
          <p className="text-black text-xs font-mono font-bold">NO ENTRIES FOR THIS DATE</p>
          <p className="text-zinc-600 text-[11px] font-mono mt-1">Tap + below to add a record.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {displayedItems.map((item) => {
            const assignee = assignees.find((a) => a.id === item.assigneeId);
            const secondaryAssignee = assignees.find((a) => a.id === item.secondaryAssigneeId);
            const tool = tools.find((t) => t.id === item.toolId);

            return (
              <ScheduleCard
                key={item.id}
                item={item}
                assignee={assignee}
                secondaryAssignee={secondaryAssignee}
                tool={tool}
                savedTemplate={savedTemplate}
                isEditMode={isEditMode}
                onEdit={() => {
                  setEditingItem(item);
                  setShowAddEditModal(true);
                }}
                onDelete={() => setDeletingSchedule(item)}
              />
            );
          })}
        </div>
      )}

      <div className="fixed bottom-6 left-0 right-0 max-w-md mx-auto px-4 pointer-events-none flex justify-end z-30">
        <button
          onClick={() => {
            setEditingItem(null);
            setShowAddEditModal(true);
          }}
          className="pointer-events-auto w-12 h-12 bg-black text-white hover:bg-zinc-800 rounded-full flex items-center justify-center border-2 border-black transition transform active:scale-95 shadow-xl"
          title="Add Schedule"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

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

      {deletingSchedule && (
        <Modal onClose={() => setDeletingSchedule(null)} title="Confirm Delete">
          <p className="text-black text-xs font-mono mb-4 leading-relaxed">
            Delete entry at <span className="font-bold">"{deletingSchedule.address}"</span>?
          </p>
          <div className="flex justify-end gap-2 font-mono">
            <button
              onClick={() => setDeletingSchedule(null)}
              className="px-3 py-1.5 bg-white text-black border border-black rounded hover:bg-zinc-100"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDeleteSchedule(deletingSchedule.id)}
              className="px-3 py-1.5 bg-black text-white rounded font-bold hover:bg-zinc-800"
            >
              Delete Entry
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

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
    <div className="bg-white border-2 border-black rounded-lg p-2.5">
      <div className="flex items-center justify-between mb-2 px-1">
        <button
          onClick={() => shiftWeek(-1)}
          className="p-1 text-black hover:bg-zinc-100 rounded border border-black"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="relative group flex items-center cursor-pointer">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => e.target.value && onDateSelected(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <span className="font-mono text-xs font-bold text-black group-hover:underline">
            {rangeText}
          </span>
        </div>

        <button
          onClick={() => shiftWeek(1)}
          className="p-1 text-black hover:bg-zinc-100 rounded border border-black"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((dayDate) => {
          const iso = formatISO(dayDate);
          const isSelected = iso === selectedDate;
          const dayName = dayDate
            .toLocaleDateString('en-US', { weekday: 'short' })
            .toUpperCase();
          const dayNum = dayDate.getDate();

          const eventCount = schedules.filter((s) => s.date === iso).length;
          const maxDots = Math.min(eventCount, 6);

          return (
            <button
              key={iso}
              onClick={() => onDateSelected(iso)}
              className={`flex flex-col items-center py-1.5 px-0.5 rounded transition font-mono border ${
                isSelected
                  ? 'bg-black text-white border-black font-bold'
                  : 'bg-white text-black border-black hover:bg-zinc-100'
              }`}
            >
              <span className="text-[9px] tracking-tight">{dayName}</span>
              <span className="text-xs font-bold my-0.5">{dayNum}</span>

              <div className="h-1.5 flex items-center justify-center gap-0.5">
                {Array.from({ length: maxDots }).map((_, i) => (
                  <span
                    key={i}
                    className={`w-1 h-1 rounded-full ${
                      isSelected ? 'bg-white' : 'bg-black'
                    }`}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Individual Schedule Card Component
function ScheduleCard({ item, assignee, secondaryAssignee, tool, savedTemplate, isEditMode, onEdit, onDelete }) {
  const assigneeName = assignee ? assignee.name : 'Unassigned';
  const secondaryAssigneeName = secondaryAssignee ? secondaryAssignee.name : 'None';
  const toolName = tool ? tool.name : 'None';
  const halfDayText = item.isHalfDay ? `Half Day (${item.halfDayPeriod || 'AM'})` : 'Full Day';

  const handleWhatsAppShare = (targetAssignee = assignee) => {
    const rawTemplate = savedTemplate.trim() || DEFAULT_TEMPLATE;
    const formattedMessage = rawTemplate
      .replace(/{assignee}/g, assigneeName)
      .replace(/{secondaryAssignee}/g, secondaryAssigneeName)
      .replace(/{name}/g, assigneeName)
      .replace(/{date}/g, item.date)
      .replace(/{address}/g, item.address)
      .replace(/{location}/g, item.address)
      .replace(/{tool}/g, toolName)
      .replace(/{halfDay}/g, halfDayText);

    const cleanPhone = targetAssignee ? sanitizePhoneNumber(targetAssignee.phoneNumber) : '';
    const encodedText = encodeURIComponent(formattedMessage);

    const url = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`
      : `https://api.whatsapp.com/send?text=${encodedText}`;

    window.open(url, '_blank');
  };

  return (
    <div className="bg-white border-2 border-black rounded-lg p-3 min-w-0">
      <div className="flex justify-between items-start gap-2 min-w-0">
        <h3 className="font-bold text-black text-sm leading-snug break-words min-w-0 flex-1 font-mono">
          {item.address}
        </h3>

        {isEditMode ? (
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={onEdit}
              className="p-1 text-black hover:bg-zinc-100 rounded border border-black"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onDelete}
              className="p-1 text-black hover:bg-zinc-100 rounded border border-black"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => handleWhatsAppShare(assignee)}
            className="p-1.5 text-black hover:bg-zinc-100 rounded border border-black transition shrink-0"
            title="Share via WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 mt-2.5">
        {/* Half Day Badge */}
        {item.isHalfDay && (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono bg-black text-white font-bold px-2 py-0.5 rounded border border-black">
            <Clock className="w-3 h-3 text-white" />
            Half Day ({item.halfDayPeriod || 'AM'})
          </span>
        )}

        {/* Primary Assignee Badge */}
        <button
          type="button"
          onClick={() => handleWhatsAppShare(assignee)}
          className="inline-flex items-center gap-1 text-[11px] font-mono bg-white text-black px-2 py-0.5 rounded border border-black hover:bg-zinc-100 transition"
          title={`Share with ${assigneeName}`}
        >
          <User className="w-3 h-3 text-black" />
          {assigneeName}
          {!isEditMode && <Share2 className="w-2.5 h-2.5 ml-0.5 opacity-60" />}
        </button>

        {/* Secondary Assignee Badge */}
        {secondaryAssignee && (
          <button
            type="button"
            onClick={() => handleWhatsAppShare(secondaryAssignee)}
            className="inline-flex items-center gap-1 text-[11px] font-mono bg-zinc-100 text-black px-2 py-0.5 rounded border border-black hover:bg-zinc-200 transition"
            title={`Share with ${secondaryAssignee.name}`}
          >
            <User className="w-3 h-3 text-black" />
            2nd: {secondaryAssignee.name}
            {!isEditMode && <Share2 className="w-2.5 h-2.5 ml-0.5 opacity-60" />}
          </button>
        )}

        {/* Tool Badge */}
        <span className="inline-flex items-center gap-1 text-[11px] font-mono bg-white text-black px-2 py-0.5 rounded border border-black">
          <Wrench className="w-3 h-3 text-black" />
          {toolName}
        </span>
      </div>
    </div>
  );
}

// Add / Edit Schedule Dialog Component
function AddEditScheduleModal({ selectedDate, existingItem, assignees, tools, onClose, onSave }) {
  const [address, setAddress] = useState(existingItem?.address || '');
  
  // Half Day State
  const [isHalfDay, setIsHalfDay] = useState(existingItem?.isHalfDay || false);
  const [halfDayPeriod, setHalfDayPeriod] = useState(existingItem?.halfDayPeriod || 'AM');

  // Primary Assignee State
  const initialAssignee = assignees.find((a) => a.id === existingItem?.assigneeId);
  const [assigneeSearch, setAssigneeSearch] = useState(initialAssignee?.name || '');
  const [selectedAssignee, setSelectedAssignee] = useState(initialAssignee || null);
  const [assigneeOpen, setAssigneeOpen] = useState(false);

  // Secondary Assignee State
  const initialSecondaryAssignee = assignees.find((a) => a.id === existingItem?.secondaryAssigneeId);
  const [secondaryAssigneeSearch, setSecondaryAssigneeSearch] = useState(initialSecondaryAssignee?.name || '');
  const [selectedSecondaryAssignee, setSelectedSecondaryAssignee] = useState(initialSecondaryAssignee || null);
  const [secondaryAssigneeOpen, setSecondaryAssigneeOpen] = useState(false);

  // Tool State
  const initialTool = tools.find((t) => t.id === existingItem?.toolId);
  const [toolSearch, setToolSearch] = useState(initialTool?.name || '');
  const [selectedTool, setSelectedTool] = useState(initialTool || null);
  const [toolOpen, setToolOpen] = useState(false);

  const filteredAssignees = assignees.filter((a) =>
    a.name.toLowerCase().startsWith(assigneeSearch.toLowerCase())
  );

  const filteredSecondaryAssignees = assignees.filter((a) =>
    a.name.toLowerCase().startsWith(secondaryAssigneeSearch.toLowerCase())
  );

  const filteredTools = tools.filter((t) =>
    t.name.toLowerCase().startsWith(toolSearch.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    const finalAssignee =
      selectedAssignee ||
      assignees.find((a) => a.name.toLowerCase() === assigneeSearch.trim().toLowerCase());

    const finalSecondaryAssignee =
      selectedSecondaryAssignee ||
      assignees.find((a) => a.name.toLowerCase() === secondaryAssigneeSearch.trim().toLowerCase());

    const finalTool =
      selectedTool ||
      tools.find((t) => t.name.toLowerCase() === toolSearch.trim().toLowerCase());

    onSave({
      id: existingItem?.id || null,
      date: selectedDate,
      address,
      assigneeId: finalAssignee ? finalAssignee.id : null,
      secondaryAssigneeId: finalSecondaryAssignee ? finalSecondaryAssignee.id : null,
      toolId: finalTool ? finalTool.id : null,
      isHalfDay,
      halfDayPeriod
    });
  };

  return (
    <Modal onClose={onClose} title={existingItem ? 'Edit Entry' : 'New Schedule Entry'}>
      <form onSubmit={handleSubmit} className="space-y-3 font-mono text-xs">
        <div>
          <label className="block text-black font-bold mb-1">LOCATION / ADDRESS</label>
          <input
            type="text"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full bg-white border border-black rounded px-2.5 py-1.5 text-black focus:outline-none"
            placeholder="e.g. 123 Tech Park, Cyberjaya"
          />
        </div>

        {/* HALF-DAY SELECTOR SECTION */}
        <div className="border border-black rounded p-2.5 bg-zinc-50 space-y-2">
          <label className="flex items-center gap-2 cursor-pointer font-bold text-black select-none">
            <input
              type="checkbox"
              checked={isHalfDay}
              onChange={(e) => setIsHalfDay(e.target.checked)}
              className="w-4 h-4 accent-black cursor-pointer rounded"
            />
            <span>Half-Day Job</span>
          </label>

          <div className="flex items-center justify-between pt-1 border-t border-zinc-200">
            <span className={`text-[11px] font-bold ${isHalfDay ? 'text-black' : 'text-zinc-400'}`}>
              Session:
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                disabled={!isHalfDay}
                onClick={() => setHalfDayPeriod('AM')}
                className={`px-3 py-1 rounded text-xs font-bold transition border border-black ${
                  !isHalfDay
                    ? 'bg-zinc-200 text-zinc-400 border-zinc-300 cursor-not-allowed'
                    : halfDayPeriod === 'AM'
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-zinc-100'
                }`}
              >
                AM
              </button>
              <button
                type="button"
                disabled={!isHalfDay}
                onClick={() => setHalfDayPeriod('PM')}
                className={`px-3 py-1 rounded text-xs font-bold transition border border-black ${
                  !isHalfDay
                    ? 'bg-zinc-200 text-zinc-400 border-zinc-300 cursor-not-allowed'
                    : halfDayPeriod === 'PM'
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-zinc-100'
                }`}
              >
                PM
              </button>
            </div>
          </div>
        </div>

        {/* PRIMARY ASSIGNEE AUTOCOMPLETE */}
        <div className="relative">
          <label className="block text-black font-bold mb-1">PRIMARY ASSIGNEE</label>
          <input
            type="text"
            value={assigneeSearch}
            onFocus={() => setAssigneeOpen(true)}
            onChange={(e) => {
              setAssigneeSearch(e.target.value);
              setSelectedAssignee(null);
              setAssigneeOpen(true);
            }}
            className="w-full bg-white border border-black rounded px-2.5 py-1.5 text-black focus:outline-none"
            placeholder="Search primary assignee..."
          />

          {assigneeOpen && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border-2 border-black rounded shadow-2xl max-h-36 overflow-y-auto z-30">
              <div
                onClick={() => {
                  setSelectedAssignee(null);
                  setAssigneeSearch('');
                  setAssigneeOpen(false);
                }}
                className="px-2.5 py-1.5 hover:bg-zinc-100 cursor-pointer text-zinc-500 font-bold border-b border-zinc-200"
              >
                [ Unassigned ]
              </div>
              {filteredAssignees.map((a) => (
                <div
                  key={a.id}
                  onClick={() => {
                    setSelectedAssignee(a);
                    setAssigneeSearch(a.name);
                    setAssigneeOpen(false);
                  }}
                  className="px-2.5 py-1.5 hover:bg-zinc-100 cursor-pointer text-black"
                >
                  {a.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECONDARY ASSIGNEE AUTOCOMPLETE */}
        <div className="relative">
          <label className="block text-black font-bold mb-1">
            SECONDARY ASSIGNEE <span className="font-normal text-zinc-500">(OPTIONAL)</span>
          </label>
          <input
            type="text"
            value={secondaryAssigneeSearch}
            onFocus={() => setSecondaryAssigneeOpen(true)}
            onChange={(e) => {
              setSecondaryAssigneeSearch(e.target.value);
              setSelectedSecondaryAssignee(null);
              setSecondaryAssigneeOpen(true);
            }}
            className="w-full bg-white border border-black rounded px-2.5 py-1.5 text-black focus:outline-none"
            placeholder="Search 2nd assignee..."
          />

          {secondaryAssigneeOpen && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border-2 border-black rounded shadow-2xl max-h-36 overflow-y-auto z-30">
              <div
                onClick={() => {
                  setSelectedSecondaryAssignee(null);
                  setSecondaryAssigneeSearch('');
                  setSecondaryAssigneeOpen(false);
                }}
                className="px-2.5 py-1.5 hover:bg-zinc-100 cursor-pointer text-zinc-500 font-bold border-b border-zinc-200"
              >
                [ None ]
              </div>
              {filteredSecondaryAssignees.map((a) => (
                <div
                  key={a.id}
                  onClick={() => {
                    setSelectedSecondaryAssignee(a);
                    setSecondaryAssigneeSearch(a.name);
                    setSecondaryAssigneeOpen(false);
                  }}
                  className="px-2.5 py-1.5 hover:bg-zinc-100 cursor-pointer text-black"
                >
                  {a.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TOOL AUTOCOMPLETE */}
        <div className="relative">
          <label className="block text-black font-bold mb-1">REQUIRED TOOL</label>
          <input
            type="text"
            value={toolSearch}
            onFocus={() => setToolOpen(true)}
            onChange={(e) => {
              setToolSearch(e.target.value);
              setSelectedTool(null);
              setToolOpen(true);
            }}
            className="w-full bg-white border border-black rounded px-2.5 py-1.5 text-black focus:outline-none"
            placeholder="Search tool..."
          />

          {toolOpen && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border-2 border-black rounded shadow-2xl max-h-36 overflow-y-auto z-30">
              <div
                onClick={() => {
                  setSelectedTool(null);
                  setToolSearch('');
                  setToolOpen(false);
                }}
                className="px-2.5 py-1.5 hover:bg-zinc-100 cursor-pointer text-zinc-500 font-bold border-b border-zinc-200"
              >
                [ None ]
              </div>
              {filteredTools.map((t) => (
                <div
                  key={t.id}
                  onClick={() => {
                    setSelectedTool(t);
                    setToolSearch(t.name);
                    setToolOpen(false);
                  }}
                  className="px-2.5 py-1.5 hover:bg-zinc-100 cursor-pointer text-black"
                >
                  {t.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 bg-white border border-black text-black hover:bg-zinc-100 rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-3 py-1.5 bg-black hover:bg-zinc-800 text-white font-bold rounded"
          >
            Save Entry
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
      setPhoneError('Phone must be 10-15 digits');
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
    setSchedules((prev) =>
      prev.map((s) => ({
        ...s,
        assigneeId: s.assigneeId === id ? null : s.assigneeId,
        secondaryAssigneeId: s.secondaryAssigneeId === id ? null : s.secondaryAssigneeId,
      }))
    );
    setDeletingAssignee(null);
  };

  return (
    <div className="space-y-3 font-mono text-xs bg-white">
      <div className="bg-white border-2 border-black rounded-lg p-3">
        <h2 className="text-black font-bold mb-2">+ ADD ASSIGNEE</h2>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full bg-white border border-black rounded px-2.5 py-1.5 text-black focus:outline-none"
          />
          <input
            type="text"
            placeholder="Phone Number (e.g. 0123456789)"
            value={newPhone}
            onChange={(e) => {
              setNewPhone(e.target.value);
              setPhoneError(null);
            }}
            className="w-full bg-white border border-black rounded px-2.5 py-1.5 text-black focus:outline-none"
          />
        </div>

        {phoneError && <p className="text-black font-bold text-[11px] mt-1.5">⚠️ {phoneError}</p>}

        <div className="flex justify-end mt-2.5">
          <button
            onClick={handleAdd}
            disabled={!newName.trim() || !newPhone.trim()}
            className="px-3 py-1.5 bg-black text-white hover:bg-zinc-800 disabled:opacity-40 font-bold rounded transition"
          >
            Add Contact
          </button>
        </div>
      </div>

      {assignees.length === 0 ? (
        <p className="text-center py-8 text-black font-bold">No assignees saved.</p>
      ) : (
        <div className="space-y-1.5">
          {assignees.map((assignee) => (
            <div
              key={assignee.id}
              className="bg-white border border-black rounded-lg p-2.5 flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-1.5 text-black font-bold">
                  <User className="w-3.5 h-3.5 text-black" />
                  {assignee.name}
                </div>
                <div className="flex items-center gap-1.5 text-black text-[11px] mt-0.5">
                  <Phone className="w-3 h-3 text-black" />
                  +{assignee.phoneNumber}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setEditingAssignee(assignee)}
                  className="p-1 text-black hover:bg-zinc-100 rounded border border-black"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeletingAssignee(assignee)}
                  className="p-1 text-black hover:bg-zinc-100 rounded border border-black"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {duplicateWarning && (
        <Modal onClose={() => setDuplicateWarning(null)} title="Duplicate Name">
          <p className="text-black text-xs font-mono mb-4">
            An assignee named '{duplicateWarning.name}' already exists. Continue?
          </p>
          <div className="flex justify-end gap-2 font-mono">
            <button
              onClick={() => setDuplicateWarning(null)}
              className="px-3 py-1.5 bg-white text-black border border-black rounded"
            >
              Cancel
            </button>
            <button
              onClick={() =>
                executeAddAssignee(duplicateWarning.name, duplicateWarning.phone)
              }
              className="px-3 py-1.5 bg-black text-white font-bold rounded"
            >
              Add Anyway
            </button>
          </div>
        </Modal>
      )}

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

      {deletingAssignee && (
        <Modal onClose={() => setDeletingAssignee(null)} title="Confirm Delete">
          <p className="text-black text-xs font-mono mb-4">
            Delete contact '{deletingAssignee.name}'?
          </p>
          <div className="flex justify-end gap-2 font-mono">
            <button
              onClick={() => setDeletingAssignee(null)}
              className="px-3 py-1.5 bg-white text-black border border-black rounded"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDelete(deletingAssignee.id)}
              className="px-3 py-1.5 bg-black text-white rounded font-bold"
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
      setError('Phone must be 10-15 digits');
      return;
    }
    onSave({ ...assignee, name: name.trim(), phoneNumber: sanitized });
  };

  return (
    <Modal onClose={onClose} title="Edit Contact">
      <div className="space-y-2.5 font-mono text-xs">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-white border border-black rounded px-2.5 py-1.5 text-black"
        />
        <input
          type="text"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            setError(null);
          }}
          className="w-full bg-white border border-black rounded px-2.5 py-1.5 text-black"
        />
        {error && <p className="text-black font-bold text-[11px]">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-3 py-1.5 bg-white border border-black text-black rounded">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || !phone.trim()}
            className="px-3 py-1.5 bg-black text-white font-bold rounded disabled:opacity-40"
          >
            Save
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
  const [deletingTool, setDeletingTool] = useState(null);

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
    setSchedules((prev) => prev.map((s) => (s.toolId === id ? { ...s, toolId: null } : s)));
    setDeletingTool(null);
  };

  return (
    <div className="space-y-3 font-mono text-xs bg-white">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-sm font-bold text-black">TOOL INVENTORY</h2>
        <button
          onClick={() => {
            setEditingTool(null);
            setShowModal(true);
          }}
          className="flex items-center gap-1 px-2.5 py-1 bg-black text-white font-bold rounded border border-black hover:bg-zinc-800 transition"
        >
          <Plus className="w-3.5 h-3.5" /> Add Tool
        </button>
      </div>

      {tools.length === 0 ? (
        <div className="text-center py-12 bg-white rounded border-2 border-dashed border-black">
          <p className="text-black font-bold">No tools registered.</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {tools.map((tool) => (
            <div
              key={tool.id}
              className="bg-white border border-black rounded-lg p-3 flex items-center justify-between"
            >
              <div>
                <h3 className="text-black font-bold flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-black" />
                  {tool.name}
                </h3>
                {tool.description && (
                  <p className="text-black text-[11px] mt-0.5">{tool.description}</p>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setEditingTool(tool);
                    setShowModal(true);
                  }}
                  className="p-1 text-black hover:bg-zinc-100 rounded border border-black"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeletingTool(tool)}
                  className="p-1 text-black hover:bg-zinc-100 rounded border border-black"
                >
                  <Trash2 className="w-3.5 h-3.5" />
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

      {deletingTool && (
        <Modal onClose={() => setDeletingTool(null)} title="Confirm Delete">
          <p className="text-black text-xs font-mono mb-4 leading-relaxed">
            Delete tool <span className="font-bold">"{deletingTool.name}"</span>?
          </p>
          <div className="flex justify-end gap-2 font-mono">
            <button
              onClick={() => setDeletingTool(null)}
              className="px-3 py-1.5 bg-white text-black border border-black rounded hover:bg-zinc-100"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDeleteTool(deletingTool.id)}
              className="px-3 py-1.5 bg-black text-white rounded font-bold hover:bg-zinc-800"
            >
              Delete Tool
            </button>
          </div>
        </Modal>
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
        className="space-y-2.5 font-mono text-xs"
      >
        <div>
          <label className="block text-black font-bold mb-1">TOOL NAME</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white border border-black rounded px-2.5 py-1.5 text-black"
          />
        </div>
        <div>
          <label className="block text-black font-bold mb-1">DESCRIPTION (OPTIONAL)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-white border border-black rounded px-2.5 py-1.5 text-black h-16"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 bg-white border border-black text-black rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim()}
            className="px-3 py-1.5 bg-black text-white font-bold rounded disabled:opacity-40"
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
  const tags = ['{assignee}', '{secondaryAssignee}', '{date}', '{address}', '{tool}', '{halfDay}'];

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

  const previewText = useMemo(() => {
    const raw = templateDraft.trim() || DEFAULT_TEMPLATE;
    return raw
      .replace(/{assignee}/g, 'Alex')
      .replace(/{secondaryAssignee}/g, 'Jordan')
      .replace(/{name}/g, 'Alex')
      .replace(/{date}/g, '2026-08-08')
      .replace(/{address}/g, '123 Tech Park, Cyberjaya')
      .replace(/{location}/g, '123 Tech Park, Cyberjaya')
      .replace(/{tool}/g, 'Drill Kit')
      .replace(/{halfDay}/g, 'Half Day (AM)');
  }, [templateDraft]);

  return (
    <div className="space-y-3 font-mono text-xs bg-white">
      <div className="bg-white border-2 border-black rounded-lg p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-black">MESSAGE TEMPLATE</h2>
          {hasUnsaved && (
            <span className="text-[11px] text-black font-bold flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-black" /> UNSAVED
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => insertTag(tag)}
              className="text-[11px] bg-white text-black px-2 py-0.5 rounded border border-black hover:bg-zinc-100 transition font-bold"
            >
              + {tag}
            </button>
          ))}
        </div>

        <textarea
          value={templateDraft}
          onChange={(e) => handleTextChange(e.target.value)}
          rows={5}
          className="w-full bg-white border border-black rounded p-2.5 text-xs text-black focus:outline-none"
          placeholder="Enter custom template..."
        />

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={!hasUnsaved}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white hover:bg-zinc-800 disabled:opacity-40 font-bold rounded transition border border-black"
          >
            <Check className="w-3.5 h-3.5" /> Save Template
          </button>
        </div>
      </div>

      <div className="bg-white border-2 border-black rounded-lg p-3 space-y-1.5">
        <h3 className="text-[10px] uppercase font-bold tracking-wider text-black">
          PREVIEW DRAFT
        </h3>
        <div className="bg-white border border-black rounded p-2.5 text-xs text-black whitespace-pre-wrap leading-relaxed font-mono">
          {previewText}
        </div>
      </div>
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 z-50">
      <div className="bg-white border-2 border-black rounded-lg max-w-xs w-full p-4 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xs font-mono font-bold text-black uppercase tracking-wider">{title}</h2>
          <button onClick={onClose} className="text-black hover:bg-zinc-100 p-0.5 rounded border border-black">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
