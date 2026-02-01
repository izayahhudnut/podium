"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiCopy, FiMoreHorizontal, FiPlus, FiSearch } from "react-icons/fi";
import AppSidebar from "../components/AppSidebar";
import AppTopbar from "../components/AppTopbar";
import { useToast } from "@/components/ui/use-toast";
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

export default function RoomsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
    if (searchParams.get("create") === "1") {
      setShowModal(true);
    }
  }, [searchParams]);

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
    <div className="min-h-screen bg-[#f7f6f4] text-[#1f1c17]">
      <div className="flex min-h-screen">
        <AppSidebar />
        <main className="flex-1 px-6 py-6 lg:px-10">
          <AppTopbar />

          <section className="mt-10">
            <h1 className="text-3xl font-semibold">Rooms</h1>
            <div className="mt-6 rounded-3xl bg-white px-6 py-5 text-sm text-black/60 shadow-[0_20px_60px_rgba(15,15,15,0.06)]">
              Here you can view the rooms you’ve created, rooms you’ve been
              invited to, and past debates that have been archived.
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-6 text-sm text-black/40">
                <button className="border-b-2 border-black pb-2 text-black">
                  My rooms
                </button>
                <button className="pb-2">Shared with me</button>
              </div>
              <button
                className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-black/90"
                onClick={() => setShowModal(true)}
              >
                <FiPlus className="h-4 w-4" />
                Create new room
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm">
                <FiSearch className="h-4 w-4 text-black/40" aria-hidden />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search"
                  className="bg-transparent text-sm outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {isLoading && (
                <div className="flex flex-wrap gap-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={`skeleton-${index}`}
                      className="w-full max-w-[360px] overflow-hidden rounded-3xl border border-black/10 bg-white"
                    >
                      <div className="relative h-36 animate-pulse bg-black/5">
                        <div className="absolute right-3 top-3 h-9 w-9 rounded-full bg-black/10" />
                      </div>
                      <div className="px-4 pb-4 pt-4">
                        <div className="h-4 w-44 animate-pulse rounded-full bg-black/5" />
                        <div className="mt-3 h-3 w-28 animate-pulse rounded-full bg-black/5" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {filteredRooms.map((room) => (
                <article
                  key={room.id}
                  className="group w-full max-w-[360px] cursor-pointer overflow-hidden rounded-3xl border border-black/10 bg-white transition hover:-translate-y-1 hover:border-black/20 hover:shadow-[0_18px_40px_rgba(0,0,0,0.12)]"
                  onClick={() =>
                    router.push(`/${room.owner_username}/${room.slug}`)
                  }
                >
                  <div className="relative h-36 bg-[#f2f2f2]">
                    {room.header_image_url ? (
                      <img
                        src={room.header_image_url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <img src="/globe.svg" alt="" className="h-16 w-16" />
                      </div>
                    )}
                    <div className="absolute right-3 top-3">
                      <button
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white/90 text-black/50 transition hover:bg-white"
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
                          className="absolute right-0 top-10 z-10 w-44 rounded-2xl border border-black/10 bg-white p-2 text-xs shadow-[0_12px_30px_rgba(15,15,15,0.12)]"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <button
                            className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-red-600 transition hover:bg-red-50"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDeleteRoom(
                                room.id,
                                room.owner_username,
                                room.slug
                              );
                            }}
                          >
                            Delete room
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="px-4 pb-4 pt-4">
                    <p className="text-lg font-semibold">{room.title}</p>
                    <p className="mt-2 text-sm text-black/50">
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
                <div className="rounded-3xl border border-dashed border-black/10 bg-white px-6 py-10 text-center text-sm text-black/50">
                  No sessions yet. Create your first room to see it here.
                </div>
              )}
            </div>
          </section>
        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-xl overflow-hidden rounded-3xl bg-[#f7f6f4] shadow-[0_30px_80px_rgba(0,0,0,0.25)]">
            <div className="relative h-40 border-b border-black/10 bg-[#f2f2f2]">
              {headerImageUrl && (
                <img
                  src={headerImageUrl}
                  alt="Debate header"
                  className="h-full w-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black/20" />
              <label className="absolute bottom-3 right-3 inline-flex cursor-pointer items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-black">
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
              <p className="text-3xl text-black/30">Room name</p>
              <div className="mt-4 flex items-center rounded-2xl border border-black/10 bg-[#f7f6f4] px-3 py-1 text-sm">
              <span className="text-black/50">
                https://join.podium.com/{ownerUsername}/
              </span>
              <input
                value={slug}
                readOnly
                className="w-full bg-transparent text-sm outline-none"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                disabled={!slug}
                className="flex h-8 w-8 items-center justify-center rounded-full text-black/60 transition hover:bg-black/5 hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Copy room link"
              >
                <FiCopy />
              </button>
              </div>
              <input
                value={roomName}
                onChange={(event) => setRoomName(event.target.value)}
                placeholder="Room name"
                className="mt-4 w-full rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm outline-none"
              />

              <div className="mt-4">
                <p className="text-sm font-semibold">Topics</p>
                <select
                  value={templateId}
                  onChange={(event) => setTemplateId(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-3 py-2 pr-10 text-sm"
                  disabled={templatesLoading}
                >
                  <option value="">
                    {templatesLoading ? "Loading templates..." : "No template"}
                  </option>
                  {topicTemplates.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-black/40">
                  Create templates in the Topics tab to reuse them here.
                </p>
              </div>

              <div className="mt-5 rounded-2xl border border-black/10 bg-white px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">Make public</p>
                    <p className="mt-1 text-xs text-black/50">
                      Anyone on the platform can see this debate and ask to join.
                    </p>
                    <p className="mt-1 text-xs text-black/40">
                      If off, you can still share via a private link.
                    </p>
                  </div>
                  <button
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
                      isPublic ? "bg-emerald-500" : "bg-black/10"
                    }`}
                    onClick={() => setIsPublic((prev) => !prev)}
                    aria-pressed={isPublic}
                    type="button"
                  >
                    <span
                      className={`h-5 w-5 rounded-full bg-white shadow transition ${
                        isPublic ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  className="rounded-full px-4 py-2 text-sm font-semibold text-black/60"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white"
                  onClick={handleCreateRoom}
                  disabled={isCreating}
                >
                  {isCreating ? "Creating..." : "Create room"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
