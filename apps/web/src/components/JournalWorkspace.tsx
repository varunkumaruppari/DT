import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Save,
  Trash2,
  Heart,
  Lightbulb,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { apiGet, apiPost, apiPatch, apiDelete, apiPut } from '../lib/api.js';
import { Button } from './ui/Button.js';
import type { JournalResponse, MoodResponse, JournalCreateRequest, JournalUpdateRequest, MoodUpsertRequest } from '@ddt/shared';

interface JournalWorkspaceProps {
  currentDate: string;
  timezone: string;
  todayStr: string;
}

const MOOD_OPTIONS = [
  { value: 'AMAZING', label: 'Amazing', emoji: '🤩', color: 'text-violet-500 bg-violet-500/10 border-violet-500/20' },
  { value: 'HAPPY', label: 'Happy', emoji: '😊', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
  { value: 'NORMAL', label: 'Normal', emoji: '😐', color: 'text-sky-500 bg-sky-500/10 border-sky-500/20' },
  { value: 'SAD', label: 'Sad', emoji: '😢', color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' },
  { value: 'TIRED', label: 'Tired', emoji: '🥱', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
] as const;

export function JournalWorkspace({ currentDate, timezone: _timezone, todayStr }: JournalWorkspaceProps) {
  const queryClient = useQueryClient();

  // Local state for Journal editing fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [gratitude, setGratitude] = useState('');
  const [lessonsLearned, setLessonsLearned] = useState('');
  const [tomorrowPlan, setTomorrowPlan] = useState('');

  // Local state for Mood note editing
  const [moodNote, setMoodNote] = useState('');

  // Status alerts
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Fetch Journal for selected date
  const journalQuery = useQuery({
    queryKey: ['journal', currentDate],
    queryFn: async () => {
      const res = await apiGet<{ journals: JournalResponse[] }>(`/journal?date=${currentDate}`);
      if (!res.success) throw new Error(res.message);
      return res.data.journals[0] || null;
    },
    enabled: !!currentDate,
  });

  // 2. Fetch Mood for selected date (we can query history filtered by date range)
  const moodQuery = useQuery({
    queryKey: ['mood', currentDate],
    queryFn: async () => {
      const res = await apiGet<{ moods: MoodResponse[] }>(`/mood?from=${currentDate}&to=${currentDate}`);
      if (!res.success) throw new Error(res.message);
      return res.data.moods[0] || null;
    },
    enabled: !!currentDate,
  });

  // Sync journal query data into editing form fields
  useEffect(() => {
    if (journalQuery.data) {
      const j = journalQuery.data;
      setTitle(j.title || '');
      setContent(j.content || '');
      setGratitude(j.gratitude || '');
      setLessonsLearned(j.lessonsLearned || '');
      setTomorrowPlan(j.tomorrowPlan || '');
    } else {
      // Clear form for new entry
      setTitle('');
      setContent('');
      setGratitude('');
      setLessonsLearned('');
      setTomorrowPlan('');
    }
  }, [journalQuery.data, currentDate]);

  // Sync mood note query data
  useEffect(() => {
    if (moodQuery.data) {
      setMoodNote(moodQuery.data.note || '');
    } else {
      setMoodNote('');
    }
  }, [moodQuery.data, currentDate]);

  const isTodaySelected = currentDate === todayStr;

  // Mutations
  const createJournalMutation = useMutation({
    mutationFn: async (data: JournalCreateRequest) => {
      const res = await apiPost<JournalCreateRequest, { journal: JournalResponse }>('/journal', data);
      if (!res.success) throw new Error(res.message);
      return res.data.journal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal', currentDate] });
      queryClient.invalidateQueries({ queryKey: ['xp-summary'] });
      queryClient.invalidateQueries({ queryKey: ['achievements-list'] });
      queryClient.invalidateQueries({ queryKey: ['activity-history'] });
      showFeedback('Reflection saved successfully!');
    },
    onError: (err) => {
      setErrorMessage(err.message);
    },
  });

  const updateJournalMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: JournalUpdateRequest }) => {
      const res = await apiPatch<JournalUpdateRequest, { journal: JournalResponse }>(`/journal/${id}`, data);
      if (!res.success) throw new Error(res.message);
      return res.data.journal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal', currentDate] });
      queryClient.invalidateQueries({ queryKey: ['activity-history'] });
      showFeedback('Reflection updated successfully!');
    },
    onError: (err) => {
      setErrorMessage(err.message);
    },
  });

  const deleteJournalMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiDelete(`/journal/${id}`);
      if (!res.success) throw new Error(res.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal', currentDate] });
      queryClient.invalidateQueries({ queryKey: ['activity-history'] });
      showFeedback('Reflection deleted successfully.');
    },
    onError: (err) => {
      setErrorMessage(err.message);
    },
  });

  const upsertMoodMutation = useMutation({
    mutationFn: async (data: MoodUpsertRequest) => {
      const res = await apiPut<MoodUpsertRequest, { mood: MoodResponse }>('/mood/today', data);
      if (!res.success) throw new Error(res.message);
      return res.data.mood;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mood', currentDate] });
      queryClient.invalidateQueries({ queryKey: ['activity-history'] });
      showFeedback('Mood logged successfully!');
    },
    onError: (err) => {
      setErrorMessage(err.message);
    },
  });

  const showFeedback = (msg: string) => {
    setSuccessMessage(msg);
    setErrorMessage('');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleSaveJournal = async () => {
    if (!content.trim()) {
      setErrorMessage('Reflection content is required.');
      return;
    }

    try {
      if (journalQuery.data) {
        await updateJournalMutation.mutateAsync({
          id: journalQuery.data.id,
          data: {
            title: title.trim() || null,
            content: content.trim(),
            gratitude: gratitude.trim() || null,
            lessonsLearned: lessonsLearned.trim() || null,
            tomorrowPlan: tomorrowPlan.trim() || null,
          },
        });
      } else {
        await createJournalMutation.mutateAsync({
          entryDate: currentDate,
          title: title.trim() || null,
          content: content.trim(),
          gratitude: gratitude.trim() || null,
          lessonsLearned: lessonsLearned.trim() || null,
          tomorrowPlan: tomorrowPlan.trim() || null,
        });
      }
    } catch {
      // Caught by mutation hooks
    }
  };

  const handleDeleteJournal = () => {
    if (!journalQuery.data) return;
    if (confirm('Are you sure you want to delete today\'s journal reflection?')) {
      deleteJournalMutation.mutate(journalQuery.data.id);
    }
  };

  const handleMoodSelect = (mood: typeof MOOD_OPTIONS[number]['value']) => {
    if (!isTodaySelected) return; // Strict boundary check
    upsertMoodMutation.mutate({
      mood,
      note: moodNote.trim() || null,
    });
  };

  const handleSaveMoodNote = () => {
    if (!isTodaySelected || !moodQuery.data) return;
    upsertMoodMutation.mutate({
      mood: moodQuery.data.mood,
      note: moodNote.trim() || null,
    });
  };

  const activeMood = moodQuery.data?.mood || null;

  return (
    <div className="space-y-6">
      {/* Visual Feedback Alerts */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-success/15 border border-success/30 text-success p-4 rounded-xl text-sm flex items-center gap-2.5 shadow-sm"
          >
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{successMessage}</span>
          </motion.div>
        )}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-danger/15 border border-danger/30 text-danger p-4 rounded-xl text-sm flex items-center gap-2.5 shadow-sm"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mood Check-In Widget */}
        <div className="lg:col-span-1 bg-card border border-border p-6 rounded-2xl shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="text-heading-3 font-semibold text-foreground">Mood check-in</h3>
            <p className="text-xs text-muted-foreground">
              {isTodaySelected
                ? 'How are you feeling today?'
                : 'Mood logged for this day:'}
            </p>
          </div>

          {moodQuery.isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                {MOOD_OPTIONS.map((opt) => {
                  const isSelected = activeMood === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={!isTodaySelected || upsertMoodMutation.isPending}
                      onClick={() => handleMoodSelect(opt.value)}
                      className={`flex items-center justify-between p-3.5 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                        isSelected
                          ? `${opt.color} border-current scale-[1.02] shadow-sm`
                          : 'border-border hover:border-muted-foreground/30 bg-background/50 hover:bg-background text-foreground'
                      } ${!isTodaySelected ? 'opacity-90' : 'cursor-pointer'}`}
                      aria-label={`Log feeling as ${opt.label}`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="text-xl" role="img" aria-hidden="true">
                          {opt.emoji}
                        </span>
                        <span>{opt.label}</span>
                      </span>
                      {isSelected && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                  );
                })}
              </div>

              {/* Mood Note Input */}
              {activeMood && (
                <div className="pt-4 border-t border-border space-y-2">
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Mood notes
                  </label>
                  <textarea
                    rows={2}
                    value={moodNote}
                    onChange={(e) => setMoodNote(e.target.value)}
                    disabled={!isTodaySelected}
                    placeholder={
                      isTodaySelected
                        ? 'Why are you feeling this way? Add a note...'
                        : 'No note added.'
                    }
                    className="bg-background border border-border text-foreground text-sm rounded-lg p-2.5 w-full focus:ring-1 focus:ring-primary focus:outline-none resize-none disabled:opacity-85"
                  />
                  {isTodaySelected && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSaveMoodNote}
                      disabled={upsertMoodMutation.isPending}
                      className="w-full text-xs"
                    >
                      {upsertMoodMutation.isPending ? 'Saving...' : 'Update Note'}
                    </Button>
                  )}
                </div>
              )}

              {!activeMood && !isTodaySelected && (
                <p className="text-xs text-muted-foreground text-center italic py-4">
                  No mood logged for this date.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Reflection Journal Editor */}
        <div className="lg:col-span-2 bg-card border border-border p-6 rounded-2xl shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <h3 className="text-heading-3 font-semibold text-foreground">Reflection journal</h3>
            </div>
            {journalQuery.data && (
              <button
                type="button"
                onClick={handleDeleteJournal}
                disabled={deleteJournalMutation.isPending}
                className="p-2 rounded-lg text-muted-foreground hover:bg-danger/10 hover:text-danger transition-colors"
                aria-label="Delete journal entry"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {journalQuery.isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                  Title / Theme
                </label>
                <input
                  type="text"
                  placeholder="e.g. A productive coding session, Relaxed Sunday"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-background border border-border text-foreground text-sm rounded-lg p-3 w-full focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              {/* Reflection Content */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                  Today's Reflection / Summary *
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="What went well? Describe your reflections, milestones, or thoughts..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="bg-background border border-border text-foreground text-sm rounded-lg p-3 w-full focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              {/* Gratitude & Lessons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    Gratitude
                  </label>
                  <textarea
                    rows={3}
                    placeholder="I am grateful for..."
                    value={gratitude}
                    onChange={(e) => setGratitude(e.target.value)}
                    className="bg-background border border-border text-foreground text-sm rounded-lg p-2.5 w-full focus:ring-1 focus:ring-primary focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    Lessons Learned
                  </label>
                  <textarea
                    rows={3}
                    placeholder="What did you learn today?"
                    value={lessonsLearned}
                    onChange={(e) => setLessonsLearned(e.target.value)}
                    className="bg-background border border-border text-foreground text-sm rounded-lg p-2.5 w-full focus:ring-1 focus:ring-primary focus:outline-none resize-none"
                  />
                </div>
              </div>

              {/* Tomorrow's Plan */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                  Tomorrow's plan / next steps
                </label>
                <input
                  type="text"
                  placeholder="What will you focus on tomorrow?"
                  value={tomorrowPlan}
                  onChange={(e) => setTomorrowPlan(e.target.value)}
                  className="bg-background border border-border text-foreground text-sm rounded-lg p-3 w-full focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {journalQuery.data ? '*Modifying existing entry' : '*Creation awards +20 XP'}
                </span>
                <Button
                  variant="primary"
                  onClick={handleSaveJournal}
                  disabled={
                    createJournalMutation.isPending ||
                    updateJournalMutation.isPending ||
                    !content.trim()
                  }
                >
                  {createJournalMutation.isPending || updateJournalMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-1.5" />
                      Save Reflection
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
