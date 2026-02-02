"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FiCopy,
  FiInfo,
  FiMoreHorizontal,
  FiPlus,
  FiSearch,
  FiTrash,
} from "react-icons/fi";
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
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@clerk/nextjs";

const defaultHeaderImages = [
  "/Rectangle.jpg",
  "/Rectangle%20(1).jpg",
  "/Rectangle%20(2).jpg",
  "/Rectangle%20(3).jpg",
  "/Rectangle%20(4).jpg",
  "/Rectangle%20(5).jpg",
  "/Rectangle%20(6).jpg",
  "/Rectangle%20(7).jpg",
  "/Rectangle%20(8).jpg",
  "/Rectangle%20(9).jpg",
  "/Rectangle%20(10).jpg",
  "/Rectangle%20(11).jpg",
  "/Rectangle%20(12).jpg",
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40);
}

type Room = {
  id: string;
  owner_username: string;
  title: string;
  slug: string;
  template: string | null;
  header_image_url: string | null;
  created_at: string;
  status: "active" | "ended";
  ended_at?: string | null;
};

type TopicTemplate = {
  id: string;
  title: string;
  topics: { id: string; title: string; minutes: number }[];
};

function SearchParamsHandler({ onCreateParam }: { onCreateParam: (value: boolean) => void }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("create") === "1") {
      onCreateParam(true);
    }
  }, [searchParams, onCreateParam]);

  return null;
}

function RoomsPageContent() {
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [topicTemplates, setTopicTemplates] = useState<TopicTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [isPublic, setIsPublic] = useState(false);
  const [headerImageUrl, setHeaderImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [menuOpenForId, setMenuOpenForId] = useState<string | null>(null);

  const slug = useMemo(() => slugify(roomName), [roomName]);
  const ownerUsername =
    user?.username ??
    (user?.firstName ? user.firstName.toLowerCase() : null) ??
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ??
    "guest";

  const filteredRooms = rooms.filter((room) =>
    room.title.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    let isMounted = true;

    const loadRooms = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/rooms", {
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Failed to load rooms");
        }
        const data = await response.json();
        if (isMounted) {
          setRooms(data.rooms ?? []);
        }
      } catch {
        if (isMounted) {
          setRooms([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadRooms();

    return () => {
      isMounted = false;
    };
  }, []);


  useEffect(() => {
    if (!showModal || headerImageUrl) {
      return;
    }
    const pick =
      defaultHeaderImages[
        Math.floor(Math.random() * defaultHeaderImages.length)
      ];
    setHeaderImageUrl(pick);
  }, [showModal, headerImageUrl]);

  useEffect(() => {
    let isMounted = true;

    const loadTemplates = async () => {
      setTemplatesLoading(true);
      try {
        const response = await fetch("/api/topic-templates", {
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Failed to load templates");
        }
        const data = await response.json();
        if (isMounted) {
          setTopicTemplates(data.templates ?? []);
        }
      } catch {
        if (isMounted) {
          setTopicTemplates([]);
        }
      } finally {
        if (isMounted) {
          setTemplatesLoading(false);
        }
      }
    };

    loadTemplates();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      return;
    }

    const newSlug = slugify(roomName);
    setIsCreating(true);
    try {
      const resolvedHeader =
        headerImageUrl ||
        defaultHeaderImages[
          Math.floor(Math.random() * defaultHeaderImages.length)
        ];
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: roomName.trim(),
          slug: newSlug,
          template: templateId || null,
          is_public: isPublic,
          header_image_url: resolvedHeader,
        }),
      });

      if (response.status === 401) {
        router.push("/");
        return;
      }

      if (response.status === 409) {
        toast({
          title: "Room already exists",
          description: "Try a different name.",
        });
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to create room");
      }

      const data = await response.json();
      const createdRoom = data.room as Room;
      setRooms((prev) => [createdRoom, ...prev]);
      setRoomName("");
      setTemplateId("");
      setIsPublic(false);
      setHeaderImageUrl("");
      setShowModal(false);
      router.push(`/${createdRoom.owner_username}/${createdRoom.slug}`);
    } catch {
      toast({
        title: "Could not create room",
        description: "Please try again.",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyLink = async () => {
    if (!slug) {
      return;
    }

    const url = `${window.location.origin}/${ownerUsername}/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied" });
    } catch {
      toast({ title: "Copy failed", description: "Please try again." });
    }
  };

  const handleDeleteRoom = async (
    roomId: string,
    owner: string,
    slugValue: string
  ) => {
    try {
      const response = await fetch(`/api/rooms/${owner}/${slugValue}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.status === 401) {
        toast({
          title: "Sign in required",
          description: "Please sign in again to delete rooms.",
        });
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to delete room");
      }

      setRooms((prev) => prev.filter((room) => room.id !== roomId));
      toast({ title: "Room deleted" });
    } catch {
      toast({ title: "Delete failed", description: "Please try again." });
    } finally {
      setMenuOpenForId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0b0c] text-white">
      <Suspense fallback={null}>
        <SearchParamsHandler onCreateParam={setShowModal} />
      </Suspense>
      <div className="flex min-h-screen">
        <AppSidebar />
        <main className="flex-1 px-8 py-6 lg:px-14">
          <AppTopbar />

          <section className="mt-10">
            <h1 className="text-3xl font-semibold text-white">Rooms</h1>
            <div className="mt-6 flex items-start gap-2 rounded-2xl border border-white/10 bg-[#141419] px-6 py-5 text-sm text-white/60 shadow-[0_14px_40px_rgba(0,0,0,0.4)]">
              <button
                type="button"
                className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/10 text-white/50 transition hover:text-white"
                title="Rooms let you create structured debates with topics and participants."
                aria-label="Room info"
              >
                <FiInfo className="h-4 w-4" />
              </button>
              <span className="leading-6">
                Creating a room starts a debate where people can join, you can
                add topics, and keep the conversation structured.
              </span>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-6 text-sm text-white/50">
                <button className="border-b-2 border-white/40 pb-2 text-white">
                  My rooms
                </button>
              </div>
              <button
                className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-transparent px-4 py-2 text-sm font-medium text-white transition hover:bg-white/5"
                onClick={() => setShowModal(true)}
              >
                <FiPlus className="h-4 w-4" />
                Create new room
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#141419] px-4 py-2 text-sm">
                <FiSearch className="h-4 w-4 text-white/40" aria-hidden />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search"
                  className="bg-transparent text-sm text-white outline-none placeholder:text-white/40"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {isLoading &&
                Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={`skeleton-${index}`}
                    className="w-full max-w-[360px] overflow-hidden rounded-3xl border border-white/10 bg-[#141419]"
                  >
                    <div className="relative h-36 bg-[#1b1b20]">
                      <Skeleton className="h-full w-full rounded-none" />
                    </div>
                    <div className="px-4 pb-4 pt-4">
                      <Skeleton className="h-5 w-48 rounded-full" />
                      <Skeleton className="mt-2 h-4 w-28 rounded-full" />
                    </div>
                  </div>
                ))}
              {filteredRooms.map((room) => (
                <article
                  key={room.id}
                  className="group w-full max-w-[360px] cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-[#141419] transition hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_18px_40px_rgba(0,0,0,0.5)]"
                  onClick={() =>
                    router.push(`/${room.owner_username}/${room.slug}`)
                  }
                >
                  <div className="relative h-36 bg-[#1b1b20]">
                    {room.header_image_url ? (
                      <img
                        src={room.header_image_url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <img
                          src="/globe.svg"
                          alt=""
                          className="h-16 w-16 opacity-70"
                        />
                      </div>
                    )}
                    <div className="absolute right-3 top-3">
                      <button
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-[#1b1b20] text-white/50 transition hover:bg-[#23232a] hover:text-white"
                        onClick={(event) => {
                          event.stopPropagation();
                          setMenuOpenForId((prev) =>
                            prev === room.id ? null : room.id
                          );
                        }}
                        aria-label="Room actions"
                      >
                        <FiMoreHorizontal />
                      </button>
                      {menuOpenForId === room.id && (
                        <div
                          className="absolute right-0 top-10 z-10 w-44 rounded-2xl border border-white/10 bg-[#141419] p-2 text-xs shadow-[0_12px_30px_rgba(0,0,0,0.6)]"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <button
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-red-400 transition hover:bg-red-500/10"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDeleteRoom(
                                room.id,
                                room.owner_username,
                                room.slug
                              );
                            }}
                          >
                            <FiTrash className="h-4 w-4" aria-hidden />
                            Delete room
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="px-4 pb-4 pt-4">
                    <p className="text-lg font-semibold text-white">
                      {room.title}
                    </p>
                    <p className="mt-2 text-sm text-white/50">
                      {new Intl.DateTimeFormat("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }).format(new Date(room.created_at))}
                    </p>
                  </div>
                </article>
              ))}
              {!isLoading && filteredRooms.length === 0 && (
                <div className="rounded-3xl border border-dashed border-white/10 bg-[#141419] px-6 py-10 text-center text-sm text-white/50">
                  No sessions yet. Create your first room to see it here.
                </div>
              )}
            </div>
          </section>
        </main>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="w-full max-w-2xl overflow-hidden rounded-[28px] border border-white/10 bg-[#121214] p-0">
          <div className="relative h-40 border-b border-white/10 bg-[#1b1b20]">
            {headerImageUrl && (
              <img
                src={headerImageUrl}
                alt="Debate header"
                className="h-full w-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black/20" />
            <label className="absolute bottom-3 right-3 inline-flex cursor-pointer items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
              Upload header
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) {
                    return;
                  }
                  const reader = new FileReader();
                  reader.onload = () => {
                    if (typeof reader.result === "string") {
                      setHeaderImageUrl(reader.result);
                    }
                  };
                  reader.readAsDataURL(file);
                }}
              />
            </label>
          </div>
          <div className="p-6">
            <p className="text-lg font-semibold text-white">Create room</p>
            <p className="mt-1 text-sm text-white/50">
              Set the basics and open a new debate.
            </p>

            <div className="mt-6 grid gap-5">
              <div className="grid gap-2">
                <label className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
                  Room name
                </label>
                <input
                  value={roomName}
                  onChange={(event) => setRoomName(event.target.value)}
                  placeholder="Add a room title"
                  className="w-full rounded-2xl border border-white/10 bg-[#141419] px-4 py-3 text-sm text-white outline-none transition focus:border-white/30 placeholder:text-white/40"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
                  Share link
                </label>
                <div className="flex items-center rounded-2xl border border-white/10 bg-[#15161a] px-3 py-2 text-sm">
                  <span className="text-white/50">
                    https://join.podium.com/{ownerUsername}/
                  </span>
                  <input
                    value={slug}
                    readOnly
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    disabled={!slug}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Copy room link"
                  >
                    <FiCopy />
                  </button>
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
                  Topics template
                </label>
                <Select
                  value={templateId || "none"}
                  onValueChange={(value) =>
                    setTemplateId(value === "none" ? "" : value)
                  }
                  disabled={templatesLoading}
                >
                  <SelectTrigger>
                    <SelectValue
                      className="truncate"
                      placeholder={
                        templatesLoading ? "Loading templates..." : "No template"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No template</SelectItem>
                    {topicTemplates.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-white/40">
                  Create templates in the Topics tab to reuse them here.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#141419] px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Make public
                    </p>
                    <p className="mt-1 text-xs text-white/50">
                      Anyone on the platform can see this debate and ask to join.
                    </p>
                    <p className="mt-1 text-xs text-white/40">
                      If off, you can still share via a private link.
                    </p>
                  </div>
                  <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                className="rounded-full px-4 py-2 text-sm font-semibold text-white/60"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90"
                onClick={handleCreateRoom}
                disabled={isCreating}
              >
                {isCreating ? "Creating..." : "Create room"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function RoomsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0b0b0c]" />}>
      <RoomsPageContent />
    </Suspense>
  );
}
