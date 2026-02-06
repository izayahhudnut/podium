"use client";

import { useEffect, useMemo, useState } from "react";
import { FiEdit2, FiPlus, FiSearch, FiTrash2 } from "react-icons/fi";
import AppSidebar from "../components/AppSidebar";
import AppTopbar from "../components/AppTopbar";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type TemplateTopic = {
  id: string;
  title: string;
  minutes: number;
  emoji?: string;
};

type TopicTemplate = {
  id: string;
  title: string;
  topics: TemplateTopic[];
};

const durationOptions = [1, 2, 3, 5, 10];
const emojiOptions = ["💡", "🔥", "🎯", "🧠", "⚖️", "🎙️", "📣", "🗳️", "📌"];

export default function TopicsPage() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<TopicTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [templateTitle, setTemplateTitle] = useState("");
  const [topics, setTopics] = useState<TemplateTopic[]>([]);
  const [topicTitle, setTopicTitle] = useState("");
  const [topicMinutes, setTopicMinutes] = useState(durationOptions[2]);
  const [topicEmoji, setTopicEmoji] = useState(emojiOptions[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState<TopicTemplate | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadTemplates = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/topic-templates", {
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Failed to load templates");
        }
        const data = await response.json();
        if (isMounted) {
          setTemplates(data.templates ?? []);
        }
      } catch {
        if (isMounted) {
          setTemplates([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadTemplates();

    return () => {
      isMounted = false;
    };
  }, []);

  const canCreate = useMemo(
    () => templateTitle.trim().length > 0 && topics.length > 0,
    [templateTitle, topics.length]
  );
  const filteredTemplates = useMemo(() => {
    if (!search.trim()) {
      return templates;
    }
    const needle = search.toLowerCase();
    return templates.filter((template) =>
      template.title.toLowerCase().includes(needle)
    );
  }, [search, templates]);

  const addTopic = () => {
    if (!topicTitle.trim()) {
      return;
    }
    setTopics((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: topicTitle.trim(),
        minutes: topicMinutes,
        emoji: topicEmoji,
      },
    ]);
    setTopicTitle("");
    setTopicMinutes(durationOptions[2]);
    setTopicEmoji(emojiOptions[0]);
  };

  const removeTopic = (id: string) => {
    setTopics((prev) => prev.filter((topic) => topic.id !== id));
  };

  const handleCreateTemplate = async () => {
    if (!canCreate) {
      return;
    }
    setIsSaving(true);
    try {
      const response = await fetch("/api/topic-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: templateTitle.trim(),
          topics,
        }),
      });
      if (response.status === 401) {
        toast({
          title: "Sign in required",
          description: "Please sign in to save templates.",
        });
        return;
      }
      if (!response.ok) {
        throw new Error("Failed to create template");
      }
      const data = await response.json();
      const created = data.template as TopicTemplate;
      setTemplates((prev) => [created, ...prev]);
      setTemplateTitle("");
      setTopics([]);
      setShowModal(false);
      toast({ title: "Template saved" });
    } catch {
      toast({ title: "Could not save template" });
    } finally {
      setIsSaving(false);
    }
  };

  const openEditTemplate = (template: TopicTemplate) => {
    setEditingTemplate(template);
    setTemplateTitle(template.title);
    setTopics(
      template.topics.map((topic) => ({
        id: topic.id ?? crypto.randomUUID(),
        title: topic.title,
        minutes: topic.minutes,
        emoji: topic.emoji,
      }))
    );
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-white text-[#111111]">
      <div className="flex min-h-screen">
        <AppSidebar />
        <main className="flex-1 px-8 py-6 lg:px-14">
          <AppTopbar />

          <section className="mt-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-semibold text-[#111111]">Topics</h1>
                <p className="mt-2 text-sm text-[#111111]/50">
                  Build reusable agendas and import them when creating rooms.
                </p>
              </div>
              <button
                className="inline-flex items-center gap-2 rounded-lg border border-[#dcdcdc] bg-transparent px-4 py-2 text-sm font-medium text-[#111111] transition hover:bg-[#ECECEC]"
                onClick={() => setShowModal(true)}
              >
                <FiPlus className="h-4 w-4" />
                Create template
              </button>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex w-full max-w-lg items-center gap-2 rounded-full border border-[#ECECEC] bg-white px-4 py-2 text-sm text-[#111111]/50">
                <FiSearch className="h-4 w-4 text-[#111111]/40" />
                <input
                  className="w-full bg-transparent text-sm text-[#111111] outline-none placeholder:text-[#111111]/40"
                  placeholder="Search templates"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
              <div className="text-xs text-[#111111]/40">
                {filteredTemplates.length} templates
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-[#ECECEC] bg-white">
              {isLoading ? (
                <div className="px-6 py-6 text-sm text-[#111111]/40">
                  Loading templates…
                </div>
              ) : filteredTemplates.length === 0 ? (
                <div className="px-6 py-6 text-sm text-[#111111]/40">
                  No templates yet. Create your first one.
                </div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#F8F8F8] text-xs font-semibold uppercase tracking-[0.2em] text-[#111111]/50">
                    <tr>
                      <th className="px-6 py-4">Template</th>
                      <th className="px-6 py-4">Topics</th>
                      <th className="px-6 py-4">Total time</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 bg-white">
                    {filteredTemplates.map((template) => {
                      const totalMinutes = template.topics.reduce(
                        (sum, topic) => sum + (topic.minutes ?? 0),
                        0
                      );
                      const emojiPreview = template.topics
                        .map((topic) => topic.emoji)
                        .filter(Boolean)
                        .slice(0, 3);
                      return (
                        <tr key={template.id} className="text-sm">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1b1b20] text-lg">
                                {emojiPreview[0] ?? "📌"}
                              </div>
                              <div>
                                <p className="font-semibold text-[#111111]">
                                  {template.title}
                                </p>
                                <p className="text-xs text-[#111111]/40">
                                  {template.topics.length} topics
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-[#111111]/60">
                            {emojiPreview.length > 0 ? (
                              <div className="flex gap-1 text-lg">
                                {emojiPreview.map((emoji, index) => (
                                  <span key={`${template.id}-${index}`}>
                                    {emoji}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              template.topics.length
                            )}
                          </td>
                          <td className="px-6 py-4 text-[#111111]/60">
                            {totalMinutes} min
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-3">
                              <button
                                className="inline-flex items-center justify-center text-[#111111]/60 transition hover:text-[#111111]"
                                onClick={() => openEditTemplate(template)}
                                aria-label="Edit template"
                              >
                                <FiEdit2 className="h-4 w-4" />
                              </button>
                              <button
                                className="inline-flex items-center justify-center text-red-400 transition hover:text-red-300"
                                aria-label="Delete template"
                              >
                                <FiTrash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </main>
      </div>

      <Dialog
        open={showModal}
        onOpenChange={(open) => {
          setShowModal(open);
          if (!open) {
            setEditingTemplate(null);
          }
        }}
      >
        <DialogContent className="w-full max-w-2xl rounded-[28px] border border-[#ECECEC] bg-white p-6">
          <div>
            <p className="text-lg font-semibold text-[#111111]">
              {editingTemplate ? "Edit template" : "Create template"}
            </p>
            <p className="mt-1 text-sm text-[#111111]/50">
              Add your topics and reuse them in new rooms.
            </p>
          </div>

          <div className="mt-6 grid gap-6">
            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[#111111]/40">
                Template name
              </label>
              <input
                className="w-full rounded-2xl border border-[#ECECEC] bg-white px-4 py-3 text-sm text-[#111111] outline-none focus:border-[#d0d0d0] placeholder:text-[#111111]/40"
                value={templateTitle}
                onChange={(event) => setTemplateTitle(event.target.value)}
                placeholder="Policy Roundtable"
              />
            </div>

            <div className="grid gap-3 rounded-2xl border border-[#ECECEC] bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#111111]">Topics</p>
                  <p className="text-xs text-[#111111]/50" />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-[90px_1fr_140px_110px]">
                <div className="grid gap-2">
                  <label className="text-[11px] uppercase tracking-[0.2em] text-[#111111]/40">
                    Emoji
                  </label>
                  <Select value={topicEmoji} onValueChange={setTopicEmoji}>
                    <SelectTrigger className="h-10 w-full rounded-2xl px-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {emojiOptions.map((emoji) => (
                        <SelectItem key={emoji} value={emoji}>
                          {emoji}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <label className="text-[11px] uppercase tracking-[0.2em] text-[#111111]/40">
                    Topic title
                  </label>
                  <input
                    className="h-10 rounded-2xl border border-[#ECECEC] bg-white px-3 text-sm text-[#111111] outline-none focus:border-[#d0d0d0] placeholder:text-[#111111]/40"
                    value={topicTitle}
                    onChange={(event) => setTopicTitle(event.target.value)}
                    placeholder="Topic title"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-[11px] uppercase tracking-[0.2em] text-[#111111]/40">
                    Duration
                  </label>
                  <Select
                    value={String(topicMinutes)}
                    onValueChange={(value) => setTopicMinutes(Number(value))}
                  >
                    <SelectTrigger className="h-10 rounded-2xl px-3">
                      <SelectValue className="truncate" placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {durationOptions.map((minutes) => (
                        <SelectItem key={minutes} value={String(minutes)}>
                          {minutes} min
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <label className="text-[11px] uppercase tracking-[0.2em] text-[#111111]/40">
                    Action
                  </label>
                  <button
                    className="inline-flex h-10 items-center justify-center rounded-lg bg-white px-3 text-sm font-semibold text-black transition hover:bg-white/90"
                    onClick={addTopic}
                  >
                    Add topic
                  </button>
                </div>
              </div>

              {topics.length > 0 && (
                <div className="mt-2 grid gap-2">
                  {topics.map((topic) => (
                    <div
                      key={topic.id}
                      className="flex items-center justify-between rounded-2xl border border-[#ECECEC] bg-[#F8F8F8] px-3 py-2 text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1b1b20] text-base">
                          {topic.emoji ?? "📌"}
                        </div>
                        <div>
                          <p className="font-semibold text-[#111111]">
                            {topic.title}
                          </p>
                          <p className="text-xs text-[#111111]/40">
                            {topic.minutes} min
                          </p>
                        </div>
                      </div>
                      <button
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-red-400 hover:bg-red-500/10"
                        onClick={() => removeTopic(topic.id)}
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              className="rounded-full px-4 py-2 text-sm font-semibold text-[#111111]/60"
              onClick={() => {
                setShowModal(false);
                setEditingTemplate(null);
              }}
            >
              Cancel
            </button>
            <button
              className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${
                canCreate
                  ? "bg-white text-black hover:bg-white/90"
                  : "bg-[#ECECEC] text-[#111111]/40"
              }`}
              onClick={handleCreateTemplate}
              disabled={!canCreate || isSaving}
            >
              {isSaving
                ? "Saving..."
                : editingTemplate
                  ? "Save changes"
                  : "Save template"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
