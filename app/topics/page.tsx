"use client";

import { useEffect, useMemo, useState } from "react";
import { FiEdit2, FiPlus, FiSearch, FiTrash2 } from "react-icons/fi";
import AppSidebar from "../components/AppSidebar";
import AppTopbar from "../components/AppTopbar";
import { useToast } from "@/components/ui/use-toast";

type TemplateTopic = {
  id: string;
  title: string;
  minutes: number;
};

type TopicTemplate = {
  id: string;
  title: string;
  topics: TemplateTopic[];
};

const durationOptions = [1, 2, 3, 5, 10];

export default function TopicsPage() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<TopicTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [templateTitle, setTemplateTitle] = useState("");
  const [topics, setTopics] = useState<TemplateTopic[]>([]);
  const [topicTitle, setTopicTitle] = useState("");
  const [topicMinutes, setTopicMinutes] = useState(durationOptions[2]);
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
      },
    ]);
    setTopicTitle("");
    setTopicMinutes(durationOptions[2]);
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
      }))
    );
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-[#f7f6f4] text-[#1f1c17]">
      <div className="flex min-h-screen">
        <AppSidebar />
        <main className="flex-1 px-6 py-6 lg:px-10">
          <AppTopbar />

          <section className="mt-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-semibold">Topics templates</h1>
                <p className="mt-2 text-sm text-black/50">
                  Build reusable agendas and import them when creating rooms.
                </p>
              </div>
              <button
                className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-semibold text-white"
                onClick={() => setShowModal(true)}
              >
                <FiPlus className="h-4 w-4" />
                Create template
              </button>
            </div>

            <div className="mt-6 rounded-3xl border border-black/5 bg-white p-6 shadow-[0_20px_60px_rgba(15,15,15,0.06)]">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex w-full max-w-md items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm text-black/50">
                  <FiSearch className="h-4 w-4" />
                  <input
                    className="w-full bg-transparent text-sm outline-none"
                    placeholder="Search templates"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-2xl border border-black/10">
                {isLoading ? (
                  <div className="px-4 py-4 text-sm text-black/40">
                    Loading templates…
                  </div>
                ) : filteredTemplates.length === 0 ? (
                  <div className="px-4 py-4 text-sm text-black/40">
                    No templates yet. Create your first one.
                  </div>
                ) : (
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#f7f7f9] text-xs font-semibold uppercase tracking-[0.2em] text-black/50">
                      <tr>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Topics</th>
                        <th className="px-4 py-3">Total time</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/10 bg-white">
                      {filteredTemplates.map((template) => {
                        const totalMinutes = template.topics.reduce(
                          (sum, topic) => sum + (topic.minutes ?? 0),
                          0
                        );
                        return (
                          <tr key={template.id} className="text-sm">
                            <td className="px-4 py-3 font-semibold">
                              {template.title}
                            </td>
                            <td className="px-4 py-3 text-black/60">
                              {template.topics.length}
                            </td>
                            <td className="px-4 py-3 text-black/60">
                              {totalMinutes} min
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-3">
                                <button
                                  className="inline-flex items-center justify-center text-black/60 transition hover:text-black"
                                  onClick={() => openEditTemplate(template)}
                                  aria-label="Edit template"
                                >
                                  <FiEdit2 className="h-4 w-4" />
                                </button>
                                <button
                                  className="inline-flex items-center justify-center text-red-500 transition hover:text-red-600"
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
            </div>
          </section>
        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl rounded-3xl bg-[#f7f6f4] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.25)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-black/40">
                  {editingTemplate ? "Edit template" : "New template"}
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  {editingTemplate ? "Edit template" : "Create a template"}
                </h2>
              </div>
              <button
                className="rounded-full px-3 py-1 text-sm text-black/50"
                onClick={() => {
                  setShowModal(false);
                  setEditingTemplate(null);
                }}
              >
                Close
              </button>
            </div>

            <div className="mt-6">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-black/40">
                Template name
              </label>
              <input
                className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/40"
                value={templateTitle}
                onChange={(event) => setTemplateTitle(event.target.value)}
                placeholder="Policy Roundtable"
              />
            </div>

            <div className="mt-6">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-black/40">
                Topics
              </label>
              <div className="mt-3 grid gap-3 rounded-2xl border border-dashed border-black/10 bg-white p-4">
                <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
                  <input
                    className="rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-black/40"
                    value={topicTitle}
                    onChange={(event) => setTopicTitle(event.target.value)}
                    placeholder="Topic title"
                  />
                  <select
                    className="rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm outline-none"
                    value={topicMinutes}
                    onChange={(event) =>
                      setTopicMinutes(Number(event.target.value))
                    }
                  >
                    {durationOptions.map((minutes) => (
                      <option key={minutes} value={minutes}>
                        {minutes} min
                      </option>
                    ))}
                  </select>
                  <button
                    className="inline-flex items-center justify-center rounded-2xl bg-black px-3 py-2 text-xs font-semibold text-white"
                    onClick={addTopic}
                  >
                    <FiPlus className="h-4 w-4" />
                  </button>
                </div>

                {topics.length > 0 && (
                  <div className="grid gap-2">
                    {topics.map((topic) => (
                      <div
                        key={topic.id}
                        className="flex items-center justify-between rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm"
                      >
                        <div>
                          <p className="font-semibold">{topic.title}</p>
                          <p className="text-xs text-black/40">
                            {topic.minutes} min
                          </p>
                        </div>
                        <button
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-red-500 hover:bg-red-50"
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
                className="rounded-full px-4 py-2 text-sm font-semibold text-black/60"
                onClick={() => {
                  setShowModal(false);
                  setEditingTemplate(null);
                }}
              >
                Cancel
              </button>
              <button
                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                  canCreate
                    ? "bg-black text-white hover:bg-black/90"
                    : "bg-black/10 text-black/40"
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
          </div>
        </div>
      )}
    </div>
  );
}
