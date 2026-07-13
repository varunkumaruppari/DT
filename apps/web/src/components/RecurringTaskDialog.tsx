import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Loader2, Plus, Trash2, Calendar, ToggleLeft, ToggleRight, X, Clock, Edit2 } from 'lucide-react';
import { apiGet, apiPost, apiPatch, apiDelete } from '../lib/api.js';
import { Button } from './ui/Button.js';
import type { CategoryResponse, RecurringTaskResponse, RecurringTaskCreateRequest, RecurringTaskUpdateRequest } from '@ddt/shared';

interface RecurringTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryResponse[];
  timezone: string;
}

const WEEKDAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

export function RecurringTaskDialog({ isOpen, onClose, categories, timezone }: RecurringTaskDialogProps) {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingTask, setEditingTask] = useState<RecurringTaskResponse | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledLocalTime, setScheduledLocalTime] = useState('09:00');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [recurrenceType, setRecurrenceType] = useState<'DAILY' | 'WEEKLY' | 'CUSTOM'>('DAILY');
  const [selectedWeekdays, setSelectedWeekdays] = useState<string[]>([]);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderMinutes, setReminderMinutes] = useState(3);
  const [startsOn, setStartsOn] = useState(() => {
    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).formatToParts(Date.now());
      const getPart = (t: string) => parts.find((p) => p.type === t)!.value;
      return `${getPart('year')}-${getPart('month')}-${getPart('day')}`;
    } catch {
      return new Date().toISOString().split('T')[0]!;
    }
  });
  const [endsOn, setEndsOn] = useState('');

  // Fetch Recurring Tasks
  const { data: recurringTasks = [], isLoading } = useQuery({
    queryKey: ['recurring-tasks'],
    queryFn: async () => {
      const res = await apiGet<{ tasks: RecurringTaskResponse[] }>('/recurring-tasks');
      if (!res.success) throw new Error(res.message);
      return res.data.tasks;
    },
    enabled: isOpen,
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: async (payload: RecurringTaskCreateRequest) => {
      const res = await apiPost<RecurringTaskCreateRequest, { task: RecurringTaskResponse }>('/recurring-tasks', payload);
      if (!res.success) throw new Error(res.message);
      return res.data.task;
    },
    onSuccess: () => {
      resetForm();
      setIsAdding(false);
      queryClient.invalidateQueries({ queryKey: ['recurring-tasks'] });
    },
    onError: (err: unknown) => {
      alert('Failed to create recurring task: ' + (err instanceof Error ? err.message : String(err)));
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; payload: RecurringTaskUpdateRequest }) => {
      const res = await apiPatch<RecurringTaskUpdateRequest, { task: RecurringTaskResponse }>(`/recurring-tasks/${data.id}`, data.payload);
      if (!res.success) throw new Error(res.message);
      return res.data.task;
    },
    onSuccess: () => {
      resetForm();
      setEditingTask(null);
      queryClient.invalidateQueries({ queryKey: ['recurring-tasks'] });
    },
    onError: (err: unknown) => {
      alert('Failed to update recurring task: ' + (err instanceof Error ? err.message : String(err)));
    },
  });

  // Toggle Active Mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async (task: RecurringTaskResponse) => {
      const res = await apiPatch<{ isActive: boolean }, { task: RecurringTaskResponse }>(`/recurring-tasks/${task.id}`, {
        isActive: !task.isActive,
      });
      if (!res.success) throw new Error(res.message);
      return res.data.task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-tasks'] });
    },
    onError: (err: unknown) => {
      alert('Failed to toggle active status: ' + (err instanceof Error ? err.message : String(err)));
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiDelete<unknown>(`/recurring-tasks/${id}`);
      if (!res.success) throw new Error(res.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-tasks'] });
    },
    onError: (err: unknown) => {
      alert('Failed to delete recurring task: ' + (err instanceof Error ? err.message : String(err)));
    },
  });

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setScheduledLocalTime('09:00');
    setCategoryId('');
    setPriority('MEDIUM');
    setRecurrenceType('DAILY');
    setSelectedWeekdays([]);
    setReminderEnabled(true);
    setReminderMinutes(3);
    setEndsOn('');
  };

  const handleOpenEdit = (task: RecurringTaskResponse) => {
    setEditingTask(task);
    setIsAdding(false);
    setTitle(task.title);
    setDescription(task.description || '');
    setScheduledLocalTime(task.scheduledLocalTime);
    setCategoryId(task.categoryId || '');
    setPriority(task.priority);
    setRecurrenceType(task.recurrenceType);
    setSelectedWeekdays(task.recurrenceConfig.weekdays || []);
    setReminderEnabled(task.reminderEnabled);
    setReminderMinutes(task.reminderMinutes || 0);
    setStartsOn(task.startsOn);
    setEndsOn(task.endsOn || '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const config: { weekdays?: ('MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY')[] } = {};
    if (recurrenceType === 'WEEKLY' || recurrenceType === 'CUSTOM') {
      config.weekdays = selectedWeekdays as ('MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY')[];
    }

    const payload: RecurringTaskCreateRequest = {
      title,
      description: description.trim() || null,
      scheduledLocalTime,
      categoryId: categoryId || null,
      priority,
      recurrenceType,
      recurrenceConfig: config,
      reminderEnabled,
      reminderMinutes: reminderEnabled ? reminderMinutes : null,
      startsOn,
      endsOn: endsOn || null,
    };

    if (editingTask) {
      updateMutation.mutate({ id: editingTask.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const toggleWeekday = (day: string) => {
    setSelectedWeekdays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border p-6 rounded-2xl shadow-xl w-full max-w-2xl space-y-6 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <h3 className="text-heading-3 font-semibold text-foreground">Recurring Tasks</h3>
          </div>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground font-bold">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {isAdding || editingTask ? (
            /* Create / Edit Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <h4 className="text-sm font-bold text-foreground">
                  {editingTask ? 'Edit Schedule Template' : 'New Schedule Template'}
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsAdding(false);
                    setEditingTask(null);
                    resetForm();
                  }}
                >
                  Back to list
                </Button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Morning Standup"
                  className="bg-background border border-border text-foreground text-sm rounded-lg p-2.5 w-full focus:ring-1 focus:ring-primary focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details about this routine"
                  rows={2}
                  className="bg-background border border-border text-foreground text-sm rounded-lg p-2.5 w-full focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Scheduled Local Time</label>
                  <input
                    type="time"
                    value={scheduledLocalTime}
                    onChange={(e) => setScheduledLocalTime(e.target.value)}
                    className="bg-background border border-border text-foreground text-sm rounded-lg p-2.5 w-full focus:ring-1 focus:ring-primary focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Category Tag</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="bg-background border border-border text-foreground text-sm rounded-lg p-2.5 w-full focus:ring-1 focus:ring-primary focus:outline-none"
                  >
                    <option value="">No Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH')}
                    className="bg-background border border-border text-foreground text-sm rounded-lg p-2.5 w-full focus:ring-1 focus:ring-primary focus:outline-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Recurrence Type</label>
                  <select
                    value={recurrenceType}
                    onChange={(e) => setRecurrenceType(e.target.value as 'DAILY' | 'WEEKLY' | 'CUSTOM')}
                    className="bg-background border border-border text-foreground text-sm rounded-lg p-2.5 w-full focus:ring-1 focus:ring-primary focus:outline-none"
                  >
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="CUSTOM">Custom Selection</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Starts On (YYYY-MM-DD)</label>
                  <input
                    type="date"
                    value={startsOn}
                    onChange={(e) => setStartsOn(e.target.value)}
                    className="bg-background border border-border text-foreground text-sm rounded-lg p-2.5 w-full focus:ring-1 focus:ring-primary focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Ends On (Optional)</label>
                  <input
                    type="date"
                    value={endsOn}
                    onChange={(e) => setEndsOn(e.target.value)}
                    className="bg-background border border-border text-foreground text-sm rounded-lg p-2.5 w-full focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              {(recurrenceType === 'WEEKLY' || recurrenceType === 'CUSTOM') && (
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-2">Repeat Weekdays</label>
                  <div className="flex gap-2 flex-wrap">
                    {WEEKDAYS.map((day) => {
                      const isSelected = selectedWeekdays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleWeekday(day)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                            isSelected
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background text-muted-foreground border-border hover:border-muted-foreground'
                          }`}
                        >
                          {day.substring(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center border-t border-border pt-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="reminderEnabled"
                    checked={reminderEnabled}
                    onChange={(e) => setReminderEnabled(e.target.checked)}
                    className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-1"
                  />
                  <label htmlFor="reminderEnabled" className="ml-2 text-sm font-semibold text-foreground">
                    Enable Reminder Notification
                  </label>
                </div>

                {reminderEnabled && (
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">
                      Lead Time (Minutes before scheduled time)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={reminderMinutes}
                      onChange={(e) => setReminderMinutes(parseInt(e.target.value) || 0)}
                      className="bg-background border border-border text-foreground text-sm rounded-lg p-2.5 w-full focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-border flex justify-end gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsAdding(false);
                    setEditingTask(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : editingTask ? (
                    'Save Changes'
                  ) : (
                    'Create Template'
                  )}
                </Button>
              </div>
            </form>
          ) : (
            /* Routine list */
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground font-semibold">
                  Configure routines that automatically populate planners
                </span>
                <Button variant="primary" size="sm" onClick={() => setIsAdding(true)}>
                  <Plus className="w-4 h-4 mr-1.5" />
                  New Template
                </Button>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : recurringTasks.length === 0 ? (
                <div className="bg-secondary/20 border border-dashed border-border rounded-xl py-12 text-center text-muted-foreground p-6">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <h5 className="font-semibold text-foreground">No recurring tasks yet</h5>
                  <p className="text-xs">Create template routines to automate task lists.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                  {recurringTasks.map((task) => {
                    const category = categories.find((c) => c.id === task.categoryId);
                    return (
                      <div
                        key={task.id}
                        className="flex items-center justify-between border border-border p-3 rounded-xl bg-card hover:bg-secondary/10 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold text-primary flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {task.scheduledLocalTime}
                            </span>
                            <h5 className="font-semibold text-sm text-foreground truncate">{task.title}</h5>
                            <span className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.2 rounded-full">
                              {task.recurrenceType}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground flex-wrap">
                            {category && (
                              <span className="px-2 py-0.5 rounded bg-secondary text-foreground text-[10px] font-bold">
                                {category.name}
                              </span>
                            )}
                            {task.startsOn && <span>Starts: {task.startsOn}</span>}
                            {task.endsOn && <span>Ends: {task.endsOn}</span>}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-3">
                          {/* Active Toggle */}
                          <button
                            type="button"
                            onClick={() => toggleActiveMutation.mutate(task)}
                            className="p-1 rounded hover:bg-secondary"
                            title={task.isActive ? 'Deactivate template' : 'Activate template'}
                          >
                            {task.isActive ? (
                              <ToggleRight className="w-6 h-6 text-success" />
                            ) : (
                              <ToggleLeft className="w-6 h-6 text-muted-foreground" />
                            )}
                          </button>

                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(task)}
                            className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('Delete this template schedule? Already generated days will remain unchanged.')) {
                                deleteMutation.mutate(task.id);
                              }
                            }}
                            className="p-1.5 rounded hover:bg-danger/10 text-muted-foreground hover:text-danger"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
