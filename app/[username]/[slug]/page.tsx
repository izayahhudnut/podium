"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import HardBreak from "@tiptap/extension-hard-break";
import {
  FiArrowUpCircle,
  FiArrowDownCircle,
  FiCheckSquare,
  FiCornerDownLeft,
  FiLink,
  FiList,
  FiMenu,
  FiMic,
  FiMicOff,
  FiMove,
  FiPause,
  FiTrash2,
  FiUsers,
  FiVideoOff,
} from "react-icons/fi";
import { HiOutlineSpeakerphone, HiSparkles } from "react-icons/hi";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  IRemoteVideoTrack,
} from "agora-rtc-sdk-ng";

const toolItems = [
  { label: "Stage", icon: "/stage.svg" },
  { label: "Facts", icon: "/facts.svg" },
  { label: "Chat", icon: "/chat.svg" },
  { label: "Notes", icon: "/notes.svg" },
];

const durationOptions = [1, 2, 3, 5, 10];

type Topic = {
  id: string;
  title: string;
  minutes: number;
};

const seedTopics: Topic[] = [];


function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

type AgoraTokenResponse = {
  appId: string;
  channel: string;
  uid: string;
  rtcToken: string;
  rtmToken: string;
};

type RoomResponse = {
  room: {
    owner_id: string;
    owner_username: string;
    template: string | null;
    is_public: boolean | null;
  };
};

type VideoTileProps = {
  uid: string;
  name?: string;
  avatarUrl?: string | null;
  isLocal?: boolean;
  track?: ICameraVideoTrack | IRemoteVideoTrack | null;
  micMuted?: boolean;
  cameraOff?: boolean;
  audioLevel?: number;
};

function VideoTile({
  uid,
  name,
  avatarUrl,
  isLocal,
  track,
  micMuted,
  cameraOff,
  audioLevel,
}: VideoTileProps) {
  const videoRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!track || !videoRef.current) {
      return;
    }
    track.play(videoRef.current);
    return () => {
      track.stop();
    };
  }, [track]);

  const trackEnabled =
    (track as any)?.isEnabled ??
    (track as any)?.getMediaStreamTrack?.()?.enabled ??
    true;
  const showPlaceholder = !track || cameraOff || !trackEnabled;
  const initials =
    (name ?? uid)
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "G";

  return (
    <div
      className={`relative aspect-video w-full min-h-[220px] overflow-hidden rounded-3xl border border-white/10 ${
        showPlaceholder
          ? "bg-[linear-gradient(135deg,#0f172a,#111827)]"
          : "bg-black"
      }`}
    >
      {showPlaceholder ? (
        <div className="absolute inset-0 rounded-3xl">
          <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.22),transparent_60%)]" />
          <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_bottom,rgba(0,0,0,0.4),transparent_60%)]" />
          <div className="absolute inset-0 rounded-3xl backdrop-blur-[8px]" />
          <div className="relative z-10 flex h-full w-full items-center justify-center p-6">
            <div className="flex w-full max-w-[420px] items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={name ?? uid}
                  className="h-12 w-12 rounded-full object-cover shadow-[0_10px_24px_rgba(0,0,0,0.35)]"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-base font-semibold text-white">
                  {initials}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {name ?? uid}
                </p>
                <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-[11px] font-semibold text-white">
                  {micMuted ? (
                    <FiMicOff className="h-3 w-3" />
                  ) : (
                    <FiMic className="h-3 w-3" />
                  )}
                  <FiVideoOff className="h-3 w-3" />
                  <span>Camera off</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div ref={videoRef} className="absolute inset-0 h-full w-full rounded-3xl" />
      )}
      <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
        <div className="flex h-3 items-end gap-[2px]">
          {(() => {
            const level = micMuted ? 0 : Math.max(0, Math.min(1, audioLevel ?? 0));
            return (
              <>
                <span
                  className="w-[3px] rounded-full bg-white/80 transition-all"
                  style={{ height: `${2 + level * 8}px` }}
                />
                <span
                  className="w-[3px] rounded-full bg-white/80 transition-all"
                  style={{ height: `${3 + level * 10}px` }}
                />
                <span
                  className="w-[3px] rounded-full bg-white/80 transition-all"
                  style={{ height: `${2 + level * 9}px` }}
                />
              </>
            );
          })()}
        </div>
        <span>
          {name ?? uid}
          {isLocal ? " (you)" : ""}
        </span>
      </div>
      {micMuted && !showPlaceholder && (
        <div className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white">
          <FiMicOff className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}

type AgoraVideoGridProps = {
  localTrack: ICameraVideoTrack | null;
  localOnStage: boolean;
  localName: string;
  localAvatarUrl?: string | null;
  remoteUsers: {
    uid: string;
    name: string;
    avatarUrl?: string | null;
    track?: IRemoteVideoTrack | null;
  }[];
  cameraOn: boolean;
  micMuted: boolean;
  localAudioLevel: number;
};

function AgoraVideoGrid({
  localTrack,
  localOnStage,
  localName,
  localAvatarUrl,
  remoteUsers,
  cameraOn,
  micMuted,
  localAudioLevel,
}: AgoraVideoGridProps) {
  const tileCount = (localOnStage ? 1 : 0) + remoteUsers.length;
  return (
    <div
      className={`mx-auto grid h-full min-h-[420px] w-full max-w-[960px] gap-4 ${
        tileCount > 1 ? "lg:grid-cols-2" : "grid-cols-1"
      }`}
    >
      {localOnStage && (
        <VideoTile
          uid="local"
          name={localName}
          avatarUrl={localAvatarUrl}
          isLocal
          track={localTrack}
          micMuted={micMuted}
          cameraOff={!cameraOn}
          audioLevel={localAudioLevel}
        />
      )}
      {remoteUsers.map((user) => (
        <VideoTile
          key={user.uid}
          uid={user.uid}
          name={user.name}
          avatarUrl={user.avatarUrl}
          track={user.track ?? null}
          cameraOff={!user.track}
        />
      ))}
    </div>
  );
}

type SessionHeaderProps = {
  showTopics: boolean;
  onToggleTopics: () => void;
  onToggleDebate: () => void;
  onLeave: () => void;
  onShare: () => void;
  running: boolean;
  hasActiveTopic: boolean;
};

function SessionHeader({
  showTopics,
  onToggleTopics,
  onToggleDebate,
  onLeave,
  onShare,
  running,
  hasActiveTopic,
}: SessionHeaderProps) {
  const debateLabel = running
    ? "Pause debate"
    : hasActiveTopic
      ? "Resume debate"
      : "Start debate";
  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button
          className="inline-flex items-center gap-2 rounded-full bg-black px-3 py-2 text-xs font-semibold text-white transition hover:bg-black/90"
          onClick={onToggleTopics}
        >
          <FiList className="h-3.5 w-3.5" />
          {showTopics ? "Hide topics" : "Select topics"}
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-2 py-1 shadow-[0_8px_20px_rgba(15,15,15,0.08)]">
          <button
            className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition ${
              running
                ? "border border-emerald-200 bg-[#141419] text-emerald-600 hover:bg-emerald-50"
                : "bg-emerald-500 text-white hover:bg-emerald-600"
            }`}
            onClick={() => {
              if (!showTopics) {
                onToggleTopics();
              }
              onToggleDebate();
            }}
          >
            {running ? (
              <FiPause className="h-3.5 w-3.5" />
            ) : (
              <HiOutlineSpeakerphone className="h-3.5 w-3.5" />
            )}
            {debateLabel}
          </button>
          <button
            className="flex items-center rounded-full px-3 py-2 text-xs font-semibold transition hover:bg-white/10"
            onClick={onShare}
          >
            <span className="inline-flex items-center gap-2">
              <FiLink className="h-4 w-4" />
              Share debate
            </span>
          </button>
          <button
            className="rounded-full bg-[#f87171] px-3 py-2 text-xs font-semibold text-white"
            onClick={onLeave}
          >
            Leave
          </button>
        </div>
        <UserButton />
      </div>
    </header>
  );
}

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const usernameParam = Array.isArray(params?.username)
    ? params.username[0]
    : params?.username;
  const roomSlug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
  const [agoraTokens, setAgoraTokens] = useState<AgoraTokenResponse | null>(
    null
  );
  const [rtcClient, setRtcClient] = useState<IAgoraRTCClient | null>(null);
  const [localVideoTrack, setLocalVideoTrack] =
    useState<ICameraVideoTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] =
    useState<IMicrophoneAudioTrack | null>(null);
  const [localAudioLevel, setLocalAudioLevel] = useState(0);
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [rtmClient, setRtmClient] = useState<any>(null);
  const [roomOwnerId, setRoomOwnerId] = useState<string | null>(null);
  const [roomTemplateId, setRoomTemplateId] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [mediaRetryKey, setMediaRetryKey] = useState(0);
  const [mediaBlocked, setMediaBlocked] = useState(false);
  const [activePanel, setActivePanel] = useState<
    "topics" | "chat" | "notes" | "facts" | "stage" | null
  >("topics");
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [showMicMenu, setShowMicMenu] = useState(false);
  const [showCameraMenu, setShowCameraMenu] = useState(false);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>("");
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>("");
  const [topics, setTopics] = useState<Topic[]>(seedTopics);
  const [savedTopics, setSavedTopics] = useState<Topic[]>(seedTopics);
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newTopicMinutes, setNewTopicMinutes] = useState("5");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const { toast } = useToast();
  const [chatMessages, setChatMessages] = useState<
    { id: string; author: string; message: string; timestamp: string }[]
  >([]);
  const [chatInput, setChatInput] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestNameInput, setGuestNameInput] = useState("");
  const [canPublish, setCanPublish] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [requestQueued, setRequestQueued] = useState(false);
  const rtcJoinedRef = useRef(false);
  const [pendingRequests, setPendingRequests] = useState<string[]>([]);
  const [participantSearch, setParticipantSearch] = useState("");
  const [stageTab, setStageTab] = useState<"debate" | "invites">("debate");
  const pendingCount = pendingRequests.length;
  const [approvedParticipants, setApprovedParticipants] = useState<
    Record<string, boolean>
  >({});
  const [participantNames, setParticipantNames] = useState<
    Record<string, string>
  >({});
  const [facts, setFacts] = useState<
    { id: string; claim: string; source: string; submittedBy: string }[]
  >([]);
  const [factClaim, setFactClaim] = useState("");
  const [factSource, setFactSource] = useState("");
  const [stageMembers, setStageMembers] = useState<Record<string, boolean>>({});
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const markRoomEnded = async () => {
    if (!roomSlug || !usernameParam) {
      return;
    }
    try {
      await fetch(`/api/rooms/${usernameParam}/${roomSlug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ended" }),
      });
    } catch {
      return;
    }
  };

  const activeTopic = useMemo(
    () => (activeIndex === null ? null : topics[activeIndex]),
    [activeIndex, topics]
  );
  const topicsDirty = useMemo(
    () => JSON.stringify(topics) !== JSON.stringify(savedTopics),
    [topics, savedTopics]
  );
  const notesEditor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      HardBreak,
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "min-h-[280px] rounded-3xl border border-white/10 bg-[#141419] px-4 py-3 text-sm text-white/70 outline-none",
      },
    },
  });

  const sessionIdRef = useRef(crypto.randomUUID());
  const uidRef = useRef("guest");
  const agoraRTCRef = useRef<any>(null);
  const agoraRTMRef = useRef<any>(null);
  const stageInitializedRef = useRef(false);
  const stageBroadcastedRef = useRef(new Set<string>());
  const templateLoadedRef = useRef(false);
  const localTracksRef = useRef<{
    mic: IMicrophoneAudioTrack | null;
    cam: ICameraVideoTrack | null;
  }>({ mic: null, cam: null });

  useEffect(() => {
    const buildUid = (value: string) => {
      const safe = value.replace(/[^a-zA-Z0-9_-]/g, "");
      if (safe.length >= 4 && safe.length <= 48) {
        return safe;
      }
      let hash = 0;
      for (let i = 0; i < value.length; i += 1) {
        hash = (hash << 5) - hash + value.charCodeAt(i);
        hash |= 0;
      }
      const compact = Math.abs(hash).toString(36);
      return `u${compact}`.slice(0, 48);
    };

    if (user?.id) {
      uidRef.current = buildUid(`user-${user.id}-${sessionIdRef.current}`);
      return;
    }

    uidRef.current = buildUid(`guest-${sessionIdRef.current}`);
  }, [user?.id]);

  useEffect(() => {
    const storedName = window.localStorage.getItem("podium-guest-name");
    if (storedName) {
      setGuestNameInput(storedName);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchToken = async () => {
      if (!roomSlug) {
        return;
      }
      if (!user?.id && !guestName) {
        return;
      }

      setIsLoading(true);
      try {
        const uid = uidRef.current;
        const channelName = usernameParam
          ? `${usernameParam}-${roomSlug}`
          : roomSlug;
        const response = await fetch(
          `/api/agora-token?channel=${encodeURIComponent(channelName)}&uid=${encodeURIComponent(
            uid
          )}`,
          { credentials: "include" }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch token");
        }
        const data = (await response.json()) as AgoraTokenResponse;
        if (isMounted) {
          setAgoraTokens(data);
        }
      } catch {
        if (isMounted) {
          setAgoraTokens(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchToken();

    return () => {
      isMounted = false;
    };
  }, [roomSlug, user?.id, usernameParam, guestName]);

  useEffect(() => {
    let isMounted = true;
    const loadRoom = async () => {
      if (!roomSlug || !usernameParam) {
        return;
      }
      try {
        const response = await fetch(`/api/rooms/${usernameParam}/${roomSlug}`);
        if (!response.ok) {
          return;
        }
        const data = (await response.json()) as RoomResponse;
        if (isMounted) {
          setRoomOwnerId(data.room.owner_id);
          setRoomTemplateId(data.room.template ?? null);
          setIsPublic(Boolean(data.room.is_public));
        }
      } catch {
        return;
      }
    };

    loadRoom();

    return () => {
      isMounted = false;
    };
  }, [roomSlug, usernameParam]);

  const handleTogglePublic = async () => {
    if (!roomSlug || !usernameParam) {
      return;
    }
    const nextValue = !isPublic;
    setIsPublic(nextValue);
    try {
      const response = await fetch(`/api/rooms/${usernameParam}/${roomSlug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_public: nextValue }),
      });
      if (!response.ok) {
        throw new Error("Failed to update visibility");
      }
    } catch {
      setIsPublic(!nextValue);
      toast({
        title: "Update failed",
        description: "Please try again.",
      });
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadTemplateTopics = async () => {
      if (!roomTemplateId || templateLoadedRef.current) {
        return;
      }
      if (topics.length > 0) {
        templateLoadedRef.current = true;
        return;
      }

      try {
        const response = await fetch(
          `/api/topic-templates/${roomTemplateId}`
        );
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        const loadedTopics = Array.isArray(data?.template?.topics)
          ? data.template.topics.map((topic: Topic) => ({
              id: topic.id ?? crypto.randomUUID(),
              title: topic.title,
              minutes: topic.minutes,
            }))
          : [];
        if (isMounted && loadedTopics.length > 0) {
          setTopics(loadedTopics);
          setSavedTopics(loadedTopics);
        }
      } catch {
        return;
      } finally {
        templateLoadedRef.current = true;
      }
    };

    loadTemplateTopics();

    return () => {
      isMounted = false;
    };
  }, [roomTemplateId, topics.length]);

  useEffect(() => {
    if (!user?.id || !roomOwnerId) {
      setIsAdmin(false);
      return;
    }
    setIsAdmin(user.id === roomOwnerId);
  }, [roomOwnerId, user?.id]);

  useEffect(() => {
    if (isAdmin) {
      setCanPublish(true);
      return;
    }
    setCanPublish(false);
  }, [isAdmin]);

  useEffect(() => {
    const loadDevices = async () => {
      let devices: MediaDeviceInfo[] = [];
      try {
        devices =
          (await navigator.mediaDevices?.enumerateDevices?.()) ?? [];
      } catch {
        devices = [];
      }
      if (!devices.length) {
        if (!agoraRTCRef.current) {
          const module = await import("agora-rtc-sdk-ng");
          agoraRTCRef.current = module.default;
        }
        try {
          devices = await agoraRTCRef.current.getDevices();
        } catch {
          devices = [];
        }
      }
      const audios = devices.filter((device) => device.kind === "audioinput");
      const videos = devices.filter((device) => device.kind === "videoinput");
      setAudioDevices(audios);
      setVideoDevices(videos);
      if (audios[0] && !selectedAudioDevice) {
        setSelectedAudioDevice(audios[0].deviceId);
      }
      if (videos[0] && !selectedVideoDevice) {
        setSelectedVideoDevice(videos[0].deviceId);
      }
    };

    loadDevices();
  }, []);

  useEffect(() => {
    if (!agoraTokens) {
      return;
    }
    if (!isAdmin && !canPublish) {
      return;
    }
    if (rtcJoinedRef.current) {
      return;
    }
    if (mediaBlocked) {
      return;
    }

    let isMounted = true;
    let micTrack: IMicrophoneAudioTrack | null = null;
    let camTrack: ICameraVideoTrack | null = null;
    let rtcModule: any = null;
    let client: IAgoraRTCClient | null = null;

    const handleUserPublished = async (
      user: IAgoraRTCRemoteUser,
      mediaType: "audio" | "video"
    ) => {
      if (!client) {
        return;
      }
      await client.subscribe(user, mediaType);
      if (mediaType === "video") {
        setRemoteUsers((prev) => {
          const next = prev.filter((item) => item.uid !== user.uid);
          return [...next, user];
        });
      } else {
        user.audioTrack?.play();
      }
    };

    const handleUserUnpublished = (
      user: IAgoraRTCRemoteUser,
      mediaType: "audio" | "video"
    ) => {
      if (mediaType === "video") {
        setRemoteUsers((prev) => prev.filter((item) => item.uid !== user.uid));
      } else {
        user.audioTrack?.stop();
      }
    };

    const handleUserLeft = (user: IAgoraRTCRemoteUser) => {
      setRemoteUsers((prev) => prev.filter((item) => item.uid !== user.uid));
    };

    const init = async () => {
      rtcModule = agoraRTCRef.current;
      if (!rtcModule) {
        rtcModule = (await import("agora-rtc-sdk-ng")).default;
        agoraRTCRef.current = rtcModule;
      }
      const nextClient = rtcModule.createClient({ mode: "rtc", codec: "vp8" });
      client = nextClient;
      setRtcClient(nextClient);

      nextClient.on("user-published", handleUserPublished);
      nextClient.on("user-unpublished", handleUserUnpublished);
      nextClient.on("user-left", handleUserLeft);

      const joinRoom = async () => {
      try {
        await nextClient.join(
          agoraTokens.appId,
          agoraTokens.channel,
          agoraTokens.rtcToken,
          agoraTokens.uid
        );
        let mic: IMicrophoneAudioTrack | null = null;
        let cam: ICameraVideoTrack | null = null;
        let devices: MediaDeviceInfo[] = [];
        try {
          devices = await rtcModule.getDevices();
        } catch {
          devices = [];
        }
        let browserDevices: MediaDeviceInfo[] = [];
        try {
          browserDevices =
            (await navigator.mediaDevices?.enumerateDevices?.()) ?? [];
        } catch {
          browserDevices = [];
        }
        const hasAudioInput =
          devices.some((device) => device.kind === "audioinput") ||
          browserDevices.some((device) => device.kind === "audioinput");
        const hasVideoInput =
          devices.some((device) => device.kind === "videoinput") ||
          browserDevices.some((device) => device.kind === "videoinput");
        const audioDeviceId =
          selectedAudioDevice ??
          devices.find((device) => device.kind === "audioinput")?.deviceId ??
          null;
        const videoDeviceId =
          selectedVideoDevice ??
          devices.find((device) => device.kind === "videoinput")?.deviceId ??
          null;

        if (audioDeviceId || hasAudioInput) {
          try {
            if (audioDeviceId) {
              mic = await rtcModule.createMicrophoneAudioTrack({
                microphoneId: audioDeviceId,
              });
            } else {
              mic = await rtcModule.createMicrophoneAudioTrack();
            }
          } catch (error: any) {
            try {
              mic = await rtcModule.createMicrophoneAudioTrack();
            } catch (fallbackError: any) {
              mic = null;
            }
          }
        }

        if (videoDeviceId || hasVideoInput) {
          try {
            if (videoDeviceId) {
              cam = await rtcModule.createCameraVideoTrack({
                cameraId: videoDeviceId,
              });
            } else {
              cam = await rtcModule.createCameraVideoTrack();
            }
          } catch (error: any) {
            try {
              cam = await rtcModule.createCameraVideoTrack();
            } catch (fallbackError: any) {
              cam = null;
            }
          }
        }

        if (!mic && !cam) {
          setMediaError("No microphone or camera devices found.");
          setMediaBlocked(true);
          return;
        }

        micTrack = mic;
        camTrack = cam;
        if (!isMounted) {
          mic?.close();
          cam?.close();
          return;
        }
        setMediaError(null);
        setLocalAudioTrack(mic ?? null);
        setLocalVideoTrack(cam ?? null);
        localTracksRef.current = { mic, cam };
        if (isAdmin || canPublish) {
          const tracks = [mic, cam].filter(Boolean) as Array<
            IMicrophoneAudioTrack | ICameraVideoTrack
          >;
          if (tracks.length) {
          await client!.publish(tracks);
          }
          if (mic) {
            await mic.setEnabled(micOn);
          }
          if (cam) {
            await cam.setEnabled(cameraOn);
          }
        } else {
          if (mic) {
            await mic.setEnabled(false);
          }
          if (cam) {
            await cam.setEnabled(false);
          }
          setMicOn(false);
          setCameraOn(false);
        }
      } catch (error: any) {
        const isDeviceNotFound =
          error?.code === "DEVICE_NOT_FOUND" ||
          String(error?.message ?? "").includes("DEVICE_NOT_FOUND");
        const message =
          error?.message ?? "Unable to access microphone or camera.";
        setMediaError(message);
        if (isDeviceNotFound) {
          setMediaBlocked(true);
        }
        return;
      }
    };

      await joinRoom();
      if (isMounted) {
        rtcJoinedRef.current = true;
      }
    };

    void init();

    return () => {
      isMounted = false;
      if (!client) {
        return;
      }
      client.off("user-published", handleUserPublished);
      client.off("user-unpublished", handleUserUnpublished);
      client.off("user-left", handleUserLeft);
      client.leave();
      micTrack?.close();
      camTrack?.close();
      setRemoteUsers([]);
      rtcJoinedRef.current = false;
    };
  }, [agoraTokens, canPublish, isAdmin, mediaBlocked, mediaRetryKey]);

  useEffect(() => {
    localAudioTrack?.setEnabled(micOn);
  }, [localAudioTrack, micOn]);

  useEffect(() => {
    if (!localAudioTrack || !micOn) {
      setLocalAudioLevel(0);
      return;
    }

    let rafId = 0;
    const getLevel =
      (localAudioTrack as any).getVolumeLevel?.bind(localAudioTrack) ?? null;

    if (getLevel) {
      const tick = () => {
        const level = Math.max(0, Math.min(1, getLevel()));
        if (process.env.NODE_ENV !== "production") {
          console.debug("[audio-level] agora", level);
        }
        setLocalAudioLevel(level);
        rafId = window.requestAnimationFrame(tick);
      };
      tick();
      return () => {
        window.cancelAnimationFrame(rafId);
      };
    }

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    const data = new Uint8Array(analyser.frequencyBinCount);

    const track =
      (localAudioTrack as any).getMediaStreamTrack?.() ??
      (localAudioTrack as any).getMediaStream?.()?.getAudioTracks?.()?.[0];

    if (!track) {
      setLocalAudioLevel(0);
      audioContext.close().catch(() => undefined);
      return;
    }

    const source = audioContext.createMediaStreamSource(new MediaStream([track]));
    source.connect(analyser);

    const tick = () => {
      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i += 1) {
        const v = (data[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / data.length);
      if (process.env.NODE_ENV !== "production") {
        console.debug("[audio-level] analyser", rms);
      }
      setLocalAudioLevel(Math.min(1, rms * 2.5));
      rafId = window.requestAnimationFrame(tick);
    };

    tick();

    return () => {
      window.cancelAnimationFrame(rafId);
      source.disconnect();
      audioContext.close().catch(() => undefined);
    };
  }, [localAudioTrack, micOn]);

  useEffect(() => {
    localVideoTrack?.setEnabled(cameraOn);
  }, [localVideoTrack, cameraOn]);

  useEffect(() => {
    if (!localAudioTrack || !selectedAudioDevice) {
      return;
    }
    void localAudioTrack.setDevice(selectedAudioDevice);
  }, [localAudioTrack, selectedAudioDevice]);

  useEffect(() => {
    if (!localVideoTrack || !selectedVideoDevice) {
      return;
    }
    void localVideoTrack.setDevice(selectedVideoDevice);
  }, [localVideoTrack, selectedVideoDevice]);

  useEffect(() => {
    if (!agoraTokens) {
      return;
    }
    let mounted = true;
    const startRTM = async () => {
      if (!agoraRTMRef.current) {
        const module = await import("agora-rtm-sdk");
        agoraRTMRef.current = module.default;
      }
      const { RTM } = agoraRTMRef.current as any;
      const client = new RTM(agoraTokens.appId, agoraTokens.uid);

      const pushChat = (author: string, message: string) => {
        setChatMessages((prev) => [
          ...prev,
          {
            id: `${Date.now()}`,
            author,
            message,
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
      };

      client.addEventListener("message", (event: any) => {
        if (event.channelName !== agoraTokens.channel) {
          return;
        }
        if (!mounted) {
          return;
        }
        const raw = event.message ?? "";
        let parsed: any = null;
        try {
          parsed = JSON.parse(raw);
        } catch {
          parsed = null;
        }

        if (!parsed || !parsed.type) {
          pushChat(event.publisher ?? "Guest", raw);
          return;
        }

        if (parsed.type === "chat") {
          pushChat(
            parsed.author ?? event.publisher ?? "Guest",
            parsed.message ?? ""
          );
        }

        if (parsed.type === "introduce" && parsed.uid && parsed.name) {
          setParticipantNames((prev) => ({
            ...prev,
            [parsed.uid]: parsed.name,
          }));
        }

        if (parsed.type === "request_join" && parsed.uid) {
          if (parsed.name) {
            setParticipantNames((prev) => ({
              ...prev,
              [parsed.uid]: parsed.name,
            }));
          }
          setPendingRequests((prev) =>
            prev.includes(parsed.uid) ? prev : [...prev, parsed.uid]
          );
          if (isAdmin) {
            toast({
              title: "New join request",
              description: `${parsed.name ?? parsed.uid} requested to join.`,
            });
          }
        }

        if (parsed.type === "approve_join" && parsed.uid) {
          if (parsed.uid === agoraTokens.uid) {
            setCanPublish(true);
            setApprovedParticipants((prev) => ({ ...prev, [parsed.uid]: true }));
          }
        }

        if (parsed.type === "stage_update" && parsed.uid) {
          setStageMembers((prev) => ({
            ...prev,
            [parsed.uid]: Boolean(parsed.onStage),
          }));
        }

        if (parsed.type === "mute" && parsed.uid) {
          if (parsed.uid === agoraTokens.uid) {
            setMicOn(false);
            localAudioTrack?.setEnabled(false);
          }
        }
      });

      try {
        await client.login({ token: agoraTokens.rtmToken });
        await client.subscribe(agoraTokens.channel);
        if (mounted) {
          setRtmClient(client);
        }
        const displayName =
          user?.fullName || user?.username || guestName || "Guest";
        await client.publish(
          agoraTokens.channel,
          JSON.stringify({
            type: "introduce",
            uid: agoraTokens.uid,
            name: displayName,
          })
        );
        setParticipantNames((prev) => ({
          ...prev,
          [agoraTokens.uid]: displayName,
        }));

        if (!isAdmin && !canPublish && requestQueued && displayName) {
          await client.publish(
            agoraTokens.channel,
            JSON.stringify({
              type: "request_join",
              uid: agoraTokens.uid,
              name: displayName,
            })
          );
          setRequestQueued(false);
          setRequestSent(true);
        }
      } catch {
        return;
      }

      return () => {
        mounted = false;
        client.unsubscribe(agoraTokens.channel).catch(() => undefined);
        client.logout().catch(() => undefined);
        setRtmClient(null);
      };
    };

    let cleanup: (() => void) | undefined;
    startRTM().then((fn) => {
      cleanup = fn;
    });

    return () => {
      if (cleanup) {
        cleanup();
      } else {
        mounted = false;
      }
    };
  }, [agoraTokens, guestName, user?.fullName, user?.username]);


  useEffect(() => {
    if (!running || remainingSeconds <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setRemainingSeconds((prev) => prev - 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [running, remainingSeconds]);

  useEffect(() => {
    if (!running || remainingSeconds > 0) {
      return;
    }

    const nextIndex = activeIndex === null ? 0 : activeIndex + 1;
    if (nextIndex < topics.length) {
      setActiveIndex(nextIndex);
      setRemainingSeconds(topics[nextIndex].minutes * 60);
    } else {
      setRunning(false);
      setActiveIndex(null);
    }
  }, [activeIndex, remainingSeconds, running, topics]);

  const toggleDebate = () => {
    if (running) {
      setRunning(false);
      return;
    }

    if (!topics.length) {
      return;
    }

    if (activeIndex === null) {
      setActiveIndex(0);
      setRemainingSeconds(topics[0].minutes * 60);
    }

    setRunning(true);
  };

  const skipTopic = () => {
    if (activeIndex === null) {
      return;
    }

    const nextIndex = activeIndex + 1;
    if (nextIndex < topics.length) {
      setActiveIndex(nextIndex);
      setRemainingSeconds(topics[nextIndex].minutes * 60);
    } else {
      setRunning(false);
      setActiveIndex(null);
    }
  };

  const updateTopic = (id: string, key: "title" | "minutes", value: string) => {
    setTopics((prev) =>
      prev.map((topic) =>
        topic.id === id
          ? {
              ...topic,
              [key]: key === "minutes" ? Number(value) : value,
            }
          : topic
      )
    );
  };

  const addTopic = () => {
    const title = newTopicTitle.trim();
    if (!title) {
      return;
    }
    setTopics((prev) => [
      ...prev,
      {
        id: `${Date.now()}`,
        title,
        minutes: Number(newTopicMinutes),
      },
    ]);
    toast({ title: "Topic added" });
    setNewTopicTitle("");
    setNewTopicMinutes("5");
  };

  const moveTopic = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) {
      return;
    }
    setTopics((prev) => {
      if (toIndex < 0 || toIndex >= prev.length) {
        return prev;
      }
      const next = [...prev];
      const [item] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, item);
      return next;
    });
    toast({ title: "Topic reordered" });
  };

  const deleteTopic = (id: string) => {
    setTopics((prev) => prev.filter((topic) => topic.id !== id));
    toast({ title: "Topic deleted" });
  };

  const handleSaveTopics = () => {
    setSavedTopics(topics);
    toast({ title: "Topics saved" });
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !rtmClient || !agoraTokens) {
      return;
    }

    const message = chatInput.trim();
    setChatInput("");
    try {
      const author = user?.fullName || user?.username || guestName || "You";
      await rtmClient.publish(
        agoraTokens.channel,
        JSON.stringify({ type: "chat", author, message })
      );
      setChatMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}`,
          author,
          message,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } catch {
      toast({ title: "Message failed", description: "Please try again." });
    }
  };

  const handleRequestJoin = async () => {
    if (!rtmClient || !agoraTokens) {
      setRequestQueued(true);
      return;
    }
    try {
      const name = user?.fullName || user?.username || guestName || "Guest";
      await rtmClient.publish(
        agoraTokens.channel,
        JSON.stringify({ type: "request_join", uid: agoraTokens.uid, name })
      );
      setRequestSent(true);
      toast({ title: "Join request sent" });
    } catch {
      toast({ title: "Request failed", description: "Please try again." });
    }
  };

  const handleApproveJoin = async (uid: string) => {
    if (!rtmClient || !agoraTokens) {
      return;
    }
    try {
      await rtmClient.publish(
        agoraTokens.channel,
        JSON.stringify({ type: "approve_join", uid })
      );
      await rtmClient.publish(
        agoraTokens.channel,
        JSON.stringify({ type: "stage_update", uid, onStage: true })
      );
      setApprovedParticipants((prev) => ({ ...prev, [uid]: true }));
      setPendingRequests((prev) => prev.filter((id) => id !== uid));
      setStageMembers((prev) => ({ ...prev, [uid]: true }));
    } catch {
      toast({ title: "Approval failed", description: "Please try again." });
    }
  };

  const handleSetStageForParticipant = async (uid: string, onStage: boolean) => {
    if (!rtmClient || !agoraTokens) {
      setStageMembers((prev) => ({ ...prev, [uid]: onStage }));
      return;
    }
    try {
      if (onStage && !approvedParticipants[uid]) {
        await rtmClient.publish(
          agoraTokens.channel,
          JSON.stringify({ type: "approve_join", uid })
        );
        setApprovedParticipants((prev) => ({ ...prev, [uid]: true }));
        setPendingRequests((prev) => prev.filter((id) => id !== uid));
      }
      await rtmClient.publish(
        agoraTokens.channel,
        JSON.stringify({ type: "stage_update", uid, onStage })
      );
      setStageMembers((prev) => ({ ...prev, [uid]: onStage }));
      if (uid === agoraTokens.uid) {
        if (onStage) {
          stageBroadcastedRef.current.add(uid);
        } else {
          stageBroadcastedRef.current.delete(uid);
        }
      }
    } catch {
      toast({ title: "Stage update failed", description: "Please try again." });
    }
  };

  const handleMuteParticipant = async (uid: string) => {
    if (!rtmClient || !agoraTokens) {
      return;
    }
    try {
      await rtmClient.publish(
        agoraTokens.channel,
        JSON.stringify({ type: "mute", uid })
      );
    } catch {
      toast({ title: "Mute failed", description: "Please try again." });
    }
  };

  useEffect(() => {
    if (!canPublish || !rtcClient) {
      return;
    }
    const { mic, cam } = localTracksRef.current;
    if (!mic && !cam) {
      return;
    }
    const publishNow = async () => {
      try {
        const tracks = [mic, cam].filter(Boolean) as Array<
          IMicrophoneAudioTrack | ICameraVideoTrack
        >;
        if (!tracks.length) {
          return;
        }
        await rtcClient.publish(tracks);
        if (mic) {
          await mic.setEnabled(micOn);
        }
        if (cam) {
          await cam.setEnabled(cameraOn);
        }
      } catch {
        return;
      }
    };
    publishNow();
  }, [canPublish, rtcClient, micOn, cameraOn]);

  useEffect(() => {
    if (!rtmClient || !agoraTokens) {
      return;
    }
    if (isAdmin || canPublish || requestSent) {
      return;
    }
    const name = user?.fullName || user?.username || guestName;
    if (!name) {
      return;
    }
    void handleRequestJoin();
  }, [
    agoraTokens,
    canPublish,
    guestName,
    isAdmin,
    requestSent,
    rtmClient,
    user?.fullName,
    user?.username,
  ]);

  useEffect(() => {
    if (!rtmClient || !agoraTokens) {
      return;
    }
    if (isAdmin || canPublish) {
      return;
    }
    const name = user?.fullName || user?.username || guestName;
    if (!name) {
      return;
    }
    const interval = window.setInterval(() => {
      void rtmClient.publish(
        agoraTokens.channel,
        JSON.stringify({ type: "request_join", uid: agoraTokens.uid, name })
      );
    }, 15000);

    return () => window.clearInterval(interval);
  }, [agoraTokens, canPublish, guestName, isAdmin, rtmClient, user?.fullName, user?.username]);

  const handleAddFact = () => {
    if (!factClaim.trim() || !factSource.trim()) {
      return;
    }

    const submittedBy =
      user?.fullName || user?.username || guestName || "Guest";
    setFacts((prev) => [
      ...prev,
      {
        id: `${Date.now()}`,
        claim: factClaim.trim(),
        source: factSource.trim(),
        submittedBy,
      },
    ]);
    setFactClaim("");
    setFactSource("");
  };

  const handleLeaveRoom = async (destination: "/rooms" | "/home" = "/rooms") => {
    try {
      await rtcClient?.leave();
    } catch {
      // ignore
    }
    localAudioTrack?.close();
    localVideoTrack?.close();
    setRemoteUsers([]);
    try {
      await rtmClient?.logout();
    } catch {
      // ignore
    }
    void markRoomEnded();
    router.push(destination);
  };

  const handleShareDebate = async () => {
    if (!roomSlug || !usernameParam) {
      return;
    }
    const url = `${window.location.origin}/${usernameParam}/${roomSlug}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied" });
    } catch {
      toast({ title: "Copy failed", description: "Please try again." });
    }
  };

  const handleRequestMedia = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      setMediaBlocked(false);
      setMediaRetryKey((prev) => prev + 1);
      return;
    } catch (error: any) {
      // If camera fails, still try to unlock the microphone.
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setMediaBlocked(false);
        setMediaRetryKey((prev) => prev + 1);
        setMediaError("Camera unavailable. Microphone access granted.");
        return;
      } catch (fallbackError: any) {
        setMediaError(
          fallbackError?.message ?? "Browser blocked camera/microphone access."
        );
      }
    }
  };

  const stageParticipants = useMemo(() => {
    const local = {
      id: agoraTokens?.uid ?? "you",
      name: user?.fullName || user?.username || guestName || "You",
      isLocal: true,
      avatarUrl: user?.imageUrl ?? null,
    };
    const remotes = remoteUsers.map((participant) => ({
      id: String(participant.uid),
      name: participantNames[String(participant.uid)] ?? String(participant.uid),
      isLocal: false,
      avatarUrl: null,
    }));
    return [local, ...remotes];
  }, [
    agoraTokens?.uid,
    guestName,
    participantNames,
    remoteUsers,
    user?.imageUrl,
    user?.fullName,
    user?.username,
  ]);

  const stageVisibleParticipants = useMemo(() => {
    return stageParticipants.filter(
      (participant) => stageMembers[participant.id]
    );
  }, [stageMembers, stageParticipants]);

  const filteredParticipants = useMemo(() => {
    const query = participantSearch.trim().toLowerCase();
    const list = query
      ? stageParticipants.filter((participant) =>
          participant.name.toLowerCase().includes(query)
        )
      : stageParticipants;
    return [...list].sort((a, b) => {
      const aOnStage = stageMembers[a.id] ? 1 : 0;
      const bOnStage = stageMembers[b.id] ? 1 : 0;
      if (aOnStage !== bOnStage) {
        return bOnStage - aOnStage;
      }
      return a.name.localeCompare(b.name);
    });
  }, [participantSearch, stageMembers, stageParticipants]);

  useEffect(() => {
    if (!agoraTokens?.uid) {
      return;
    }
    if (!stageInitializedRef.current && isAdmin) {
      stageInitializedRef.current = true;
      setStageMembers((prev) =>
        prev[agoraTokens.uid] ? prev : { ...prev, [agoraTokens.uid]: true }
      );
    }
  }, [agoraTokens?.uid, isAdmin]);

  useEffect(() => {
    if (!agoraTokens?.uid || !isAdmin || !rtmClient) {
      return;
    }
    if (!stageMembers[agoraTokens.uid]) {
      return;
    }
    if (stageBroadcastedRef.current.has(agoraTokens.uid)) {
      return;
    }
    stageBroadcastedRef.current.add(agoraTokens.uid);
    void rtmClient.publish(
      agoraTokens.channel,
      JSON.stringify({
        type: "stage_update",
        uid: agoraTokens.uid,
        onStage: true,
      })
    );
  }, [agoraTokens?.uid, isAdmin, rtmClient, stageMembers]);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "G";

  const needsGuestName = !user?.id && !guestName;
  const waitingForApproval = !isAdmin && !canPublish;

  return (
    <div className="min-h-screen bg-[#0b0b0c] text-white">
      {needsGuestName && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-3xl bg-[#141419] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.3)]">
            <h2 className="text-2xl font-semibold">
              Join {roomSlug ? `"${roomSlug.replace(/-/g, " ")}"` : "this debate"}{" "}
              as guest
            </h2>
            <p className="mt-2 text-sm text-white/50">
              Enter a name to request access to the debate.
            </p>
            <input
              value={guestNameInput}
              onChange={(event) => setGuestNameInput(event.target.value)}
              placeholder="Your name"
              className="mt-4 w-full rounded-2xl border border-white/10 px-4 py-2 text-base outline-none"
            />
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                className="rounded-full px-4 py-2 text-sm font-semibold text-white/60"
                onClick={() => router.push("/")}
              >
                Leave
              </button>
              <button
                className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white"
                onClick={() => {
                  if (!guestNameInput.trim()) {
                    return;
                  }
                  const name = guestNameInput.trim();
                  setGuestName(name);
                  window.localStorage.setItem("podium-guest-name", name);
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex min-h-screen">
        <div className="relative hidden lg:flex">
          <aside className="flex w-24 flex-col items-center gap-5 border-r border-white/5 bg-[#141419] py-6">
            <div className="grid gap-3">
              <div className="relative">
                <button
                  className={`flex h-20 w-20 flex-col items-center justify-center gap-2 rounded-2xl text-xs font-semibold transition ${
                    micOn
                      ? "text-white/70"
                      : "bg-red-500/20 text-white/60"
                  }`}
                  onClick={async () => {
                    if (!isAdmin && !canPublish) {
                      toast({
                        title: "Request approval",
                        description: "Ask the host to add you to the stage.",
                      });
                      return;
                    }
                    const next = !micOn;
                    setMicOn(next);
                    await localAudioTrack?.setEnabled(next);
                  }}
                >
                  <img
                    src="/mic.svg"
                    alt="Mic"
                    className={`h-6 w-6 brightness-0 invert ${
                      micOn ? "" : "opacity-60"
                    }`}
                  />
                  <span>Mic</span>
                </button>
                <button
                  className="absolute bottom-2 right-2 text-[10px] text-white/50"
                  onClick={() => setShowMicMenu((prev) => !prev)}
                  aria-label="Select microphone"
                >
                  ▾
                </button>
                {showMicMenu && (
                  <div className="absolute left-24 top-0 z-50 w-56 rounded-2xl border border-white/10 bg-[#141419] p-3 text-xs shadow-[0_12px_30px_rgba(15,15,15,0.12)]">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                      Microphone
                    </p>
                    {audioDevices.length === 0 && (
                      <p className="mt-2 text-[11px] text-white/50">
                        No microphone detected.
                      </p>
                    )}
                    <select
                      value={selectedAudioDevice}
                      onChange={async (event) => {
                        const deviceId = event.target.value;
                        setSelectedAudioDevice(deviceId);
                        await localAudioTrack?.setDevice(deviceId);
                      }}
                      className="mt-2 w-full rounded-xl border border-white/10 px-2 py-2 text-xs"
                      disabled={audioDevices.length === 0}
                    >
                      {audioDevices.length === 0 ? (
                        <option value="">No microphone</option>
                      ) : (
                        audioDevices.map((device) => (
                          <option key={device.deviceId} value={device.deviceId}>
                            {device.label || "Microphone"}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                )}
              </div>
              <div className="relative">
                <button
                  className={`flex h-20 w-20 flex-col items-center justify-center gap-2 rounded-2xl text-xs font-semibold transition ${
                    cameraOn
                      ? "text-white/70"
                      : "bg-red-500/20 text-white/60"
                  }`}
                  onClick={async () => {
                    if (!isAdmin && !canPublish) {
                      toast({
                        title: "Request approval",
                        description: "Ask the host to add you to the stage.",
                      });
                      return;
                    }
                    const next = !cameraOn;
                    setCameraOn(next);
                    await localVideoTrack?.setEnabled(next);
                  }}
                >
                  <img
                    src="/video.svg"
                    alt="Video"
                    className={`h-6 w-6 ${cameraOn ? "" : "grayscale"}`}
                  />
                  <span>Video</span>
                </button>
                <button
                  className="absolute bottom-2 right-2 text-[10px] text-white/50"
                  onClick={() => setShowCameraMenu((prev) => !prev)}
                  aria-label="Select camera"
                >
                  ▾
                </button>
                {showCameraMenu && (
                  <div className="absolute left-24 top-0 z-50 w-56 rounded-2xl border border-white/10 bg-[#141419] p-3 text-xs shadow-[0_12px_30px_rgba(15,15,15,0.12)]">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                      Camera
                    </p>
                    <select
                      value={selectedVideoDevice}
                      onChange={async (event) => {
                        const deviceId = event.target.value;
                        setSelectedVideoDevice(deviceId);
                        await localVideoTrack?.setDevice(deviceId);
                      }}
                      className="mt-2 w-full rounded-xl border border-white/10 px-2 py-2 text-xs"
                    >
                      {videoDevices.map((device) => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label || "Camera"}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              {toolItems.map((item) => (
                <button
                  key={item.label}
                  className={`group relative flex h-20 w-20 flex-col items-center justify-center gap-2 rounded-2xl text-xs font-semibold transition ${
                    activePanel === item.label.toLowerCase()
                      ? "bg-white/10 text-white"
                      : "text-white/60"
                  }`}
                  title={item.label}
                  aria-label={item.label}
                  onClick={() =>
                    setActivePanel((prev) =>
                      prev === item.label.toLowerCase()
                        ? null
                        : (item.label.toLowerCase() as
                            | "chat"
                            | "notes"
                            | "facts"
                            | "stage")
                    )
                  }
                >
                  <img
                    src={item.icon}
                    alt={item.label}
                    className={`h-6 w-6 transition ${
                      activePanel === item.label.toLowerCase()
                        ? "opacity-100"
                        : "opacity-60 group-hover:opacity-100"
                    }`}
                  />
                  <span>{item.label}</span>
                  {isAdmin && pendingCount > 0 && item.label === "Stage" && (
                    <span className="absolute right-2 top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                      {pendingCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </aside>

          <div
            className={`flex h-full flex-col border-r border-white/10 bg-[#0f0f12] transition-all duration-300 ${
              activePanel ? "w-[420px] opacity-100" : "w-0 opacity-0"
            }`}
          >
            <div className="flex h-full flex-col overflow-hidden p-6">
              {activePanel === "topics" && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                        {isAdmin ? "Create topics" : "Topics"}
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold text-white">
                        Topics
                      </h2>
                      <p className="mt-1 text-sm text-white/50">
                        Create the agenda for the debate.
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                          running
                            ? "border border-emerald-500/40 bg-white/5 text-emerald-300 hover:bg-white/10"
                            : "bg-emerald-500 text-white hover:bg-emerald-600"
                        }`}
                        onClick={toggleDebate}
                        disabled={!isAdmin}
                      >
                        {running ? (
                          <FiPause className="h-4 w-4" />
                        ) : (
                          <HiOutlineSpeakerphone className="h-4 w-4" />
                        )}
                        {running
                          ? "Pause debate"
                          : activeIndex === null
                            ? "Start debate"
                            : "Resume debate"}
                      </button>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="mt-4 flex items-center justify-end">
                      <button className="flex items-center justify-center rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40 hover:text-white">
                        <span className="inline-flex items-center gap-2">
                          <HiSparkles className="h-5 w-5" />
                          Generate
                        </span>
                      </button>
                    </div>
                  )}

                  <div className="mt-6 grid gap-3 overflow-y-auto pr-1">
                    {topics.map((topic, index) => (
                      <div
                        key={topic.id}
                        className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#141419] px-4 py-4"
                        title={topic.title}
                        draggable={isAdmin}
                        onDragStart={(event) => {
                          setDragIndex(index);
                          event.dataTransfer.setDragImage(
                            event.currentTarget,
                            event.currentTarget.clientWidth / 2,
                            24
                          );
                        }}
                        onDragOver={(event) => {
                          event.preventDefault();
                        }}
                        onDrop={() => {
                          if (dragIndex === null) {
                            return;
                          }
                          moveTopic(dragIndex, index);
                          setDragIndex(null);
                        }}
                      >
                        <div>
                          {isAdmin ? (
                            <input
                              value={topic.title}
                              onChange={(event) =>
                                updateTopic(
                                  topic.id,
                                  "title",
                                  event.target.value
                                )
                              }
                              className="w-full bg-transparent text-base font-semibold text-white outline-none placeholder:text-white/40"
                              title={topic.title}
                            />
                          ) : (
                            <p
                              className="text-base font-semibold text-white"
                              title={topic.title}
                            >
                              {topic.title}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          {isAdmin ? (
                            <Select
                              value={String(topic.minutes)}
                              onValueChange={(value) =>
                                updateTopic(topic.id, "minutes", value)
                              }
                            >
                              <SelectTrigger className="h-9 w-[96px] rounded-xl px-3 text-xs">
                                <SelectValue placeholder="Time" />
                              </SelectTrigger>
                              <SelectContent>
                                {durationOptions.map((minutes) => (
                                  <SelectItem
                                    key={minutes}
                                    value={String(minutes)}
                                  >
                                    {minutes} min
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="text-xs text-white/50">
                              {topic.minutes} min
                            </span>
                          )}
                          {isAdmin && (
                            <div className="flex items-center gap-3 text-xs">
                              <button
                                className="text-red-400 hover:text-red-300"
                                onClick={() => {
                                  const confirmed = window.confirm(
                                    "Are you sure you want to delete this topic?"
                                  );
                                  if (confirmed) {
                                    deleteTopic(topic.id);
                                  }
                                }}
                                aria-label="Delete topic"
                                title="Delete"
                              >
                                <FiTrash2 className="h-4 w-4" />
                              </button>
                              <button
                                className="cursor-grab text-white/40 hover:text-white/60 active:cursor-grabbing"
                                draggable
                                onDragStart={() => setDragIndex(index)}
                                onMouseDown={() => setDragIndex(index)}
                                aria-label="Drag to reorder topic"
                                title="Drag to reorder"
                              >
                                <FiMenu className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>
                        {isAdmin && (
                          <div className="sr-only" />
                        )}
                      </div>
                    ))}

                    {isAdmin && (
                      <div className="rounded-2xl border border-white/20 bg-[#141419] px-4 py-3 transition focus-within:border-white/40">
                        <form
                          className="grid gap-2"
                          onSubmit={(event) => {
                            event.preventDefault();
                            if (!newTopicTitle.trim()) {
                              return;
                            }
                            addTopic();
                          }}
                        >
                          <label className="text-[11px] uppercase tracking-[0.2em] text-white/40">
                            New topic
                          </label>
                          <div className="flex flex-wrap items-center gap-3">
                            <input
                              value={newTopicTitle}
                              onChange={(event) =>
                                setNewTopicTitle(event.target.value)
                              }
                              placeholder="e.g. Opening statements"
                              className="min-w-[200px] flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/40"
                              aria-label="Topic title"
                            />
                            <Select
                              value={newTopicMinutes}
                              onValueChange={setNewTopicMinutes}
                            >
                              <SelectTrigger className="h-9 rounded-full px-3 text-xs">
                                <SelectValue placeholder="Time" />
                              </SelectTrigger>
                              <SelectContent>
                                {durationOptions.map((minutes) => (
                                  <SelectItem
                                    key={minutes}
                                    value={String(minutes)}
                                  >
                                    {minutes} min
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <button
                              type="submit"
                              className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/40"
                              disabled={!newTopicTitle.trim()}
                            >
                              Add topic
                            </button>
                          </div>
                          <p className="text-xs text-white/40">
                            Press Enter to add the topic.
                          </p>
                        </form>
                      </div>
                    )}

                    {isAdmin && (
                      <div className="flex items-center gap-3">
                        <button
                          className={`rounded-lg px-5 py-2.5 text-base font-semibold ${
                            topicsDirty
                              ? "bg-white text-black"
                              : "bg-white/10 text-white/40"
                          }`}
                          disabled={!topicsDirty}
                          onClick={handleSaveTopics}
                        >
                          Save
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}

              {activePanel === "chat" && (
                <>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                      Chat
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">
                      Room chat
                    </h2>
                    <p className="mt-1 text-sm text-white/50">
                      Keep the conversation flowing.
                    </p>
                  </div>
                  <div className="mt-6 flex-1 space-y-3 overflow-y-auto pr-1">
                    {chatMessages.length === 0 ? (
                      <p className="text-sm text-white/40">
                        No messages yet.
                      </p>
                    ) : (
                      chatMessages.map((message) => (
                        <div
                          key={message.id}
                          className="rounded-2xl border border-white/10 bg-[#15161a] px-4 py-3 text-sm"
                        >
                          <div className="flex items-center justify-between text-xs text-white/40">
                            <span>{message.author}</span>
                            <span>{message.timestamp}</span>
                          </div>
                          <p className="mt-2 text-sm text-white/70">
                            {message.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <input
                      value={chatInput}
                      onChange={(event) => setChatInput(event.target.value)}
                      placeholder="Send a message"
                      className="flex-1 rounded-full border border-white/10 bg-[#141419] px-4 py-2 text-sm text-white outline-none placeholder:text-white/40"
                    />
                    <button
                      className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90"
                      onClick={handleSendMessage}
                    >
                      Send
                    </button>
                  </div>
                </>
              )}

              {activePanel === "notes" && (
                <>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                      Notes
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold">Live notes</h2>
                    <p className="mt-1 text-sm text-white/50">
                      Capture highlights during the debate.
                    </p>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-2">
                    <button
                      className="inline-flex h-10 w-10 items-center justify-center text-white/60 transition hover:text-white"
                      onClick={() => notesEditor?.chain().focus().toggleBold().run()}
                      aria-label="Bold"
                      title="Bold"
                    >
                      <span className="text-base font-bold">B</span>
                    </button>
                    <button
                      className="inline-flex h-10 w-10 items-center justify-center text-white/60 transition hover:text-white"
                      onClick={() => notesEditor?.chain().focus().toggleItalic().run()}
                      aria-label="Italic"
                      title="Italic"
                    >
                      <span className="text-base italic">I</span>
                    </button>
                    <button
                      className="inline-flex h-10 w-10 items-center justify-center text-white/60 transition hover:text-white"
                      onClick={() =>
                        notesEditor?.chain().focus().toggleUnderline().run()
                      }
                      aria-label="Underline"
                      title="Underline"
                    >
                      <span className="text-base underline">U</span>
                    </button>
                    <button
                      className="inline-flex h-10 w-10 items-center justify-center text-white/60 transition hover:text-white"
                      onClick={() =>
                        notesEditor?.chain().focus().toggleTaskList().run()
                      }
                      aria-label="Checklist"
                      title="Checklist"
                    >
                      <FiCheckSquare className="h-5 w-5" />
                    </button>
                    <button
                      className="inline-flex h-10 w-10 items-center justify-center text-white/60 transition hover:text-white"
                      onClick={() =>
                        notesEditor?.chain().focus().setHardBreak().run()
                      }
                      aria-label="Line break"
                      title="Line break"
                    >
                      <FiCornerDownLeft className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="mt-4">
                    <EditorContent editor={notesEditor} />
                  </div>
                </>
              )}

              {activePanel === "facts" && (
                <>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                      Facts
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold">
                      Verify statements
                    </h2>
                    <p className="mt-1 text-sm text-white/50">
                      Add sourced facts for the room.
                    </p>
                  </div>
                  <div className="mt-6 rounded-3xl border border-white/10 bg-[#141419] px-4 py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-white">
                          <span className="inline-flex items-center gap-2">
                            <HiSparkles className="h-4 w-4 text-purple-400" />
                            AI fact checks
                          </span>
                        </p>
                        <p className="mt-1 text-xs text-white/50">
                          Auto-collects sources from a mix of publications across
                          different universities.
                        </p>
                      </div>
                      <button
                        className="flex h-6 w-11 items-center rounded-full border border-white/10 bg-white/10 p-1"
                        aria-label="Toggle AI fact checks"
                        type="button"
                      >
                        <span className="h-4 w-4 rounded-full bg-white shadow-sm" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-6 grid gap-3">
                    <input
                      value={factClaim}
                      onChange={(event) => setFactClaim(event.target.value)}
                      placeholder="Fact or claim"
                      className="rounded-2xl border border-white/10 bg-[#141419] px-4 py-2 text-sm text-white outline-none placeholder:text-white/40"
                    />
                    <input
                      value={factSource}
                      onChange={(event) => setFactSource(event.target.value)}
                      placeholder="Source link"
                      className="rounded-2xl border border-white/10 bg-[#141419] px-4 py-2 text-sm text-white outline-none placeholder:text-white/40"
                    />
                    <button
                      className="rounded-lg bg-white px-4 py-2.5 text-base font-semibold text-black transition hover:bg-white/90"
                      onClick={handleAddFact}
                    >
                      <span className="inline-flex items-center gap-2">
                        <img
                          src="/facts.svg"
                          alt=""
                          className="h-5 w-5 brightness-0"
                        />
                        Add fact
                      </span>
                    </button>
                  </div>
                  <div className="mt-6 space-y-3 overflow-y-auto pr-1">
                    {facts.length === 0 ? (
                      <p className="text-sm text-white/40">
                        No facts added yet.
                      </p>
                    ) : (
                      facts.map((fact) => (
                        <div
                          key={fact.id}
                          className="rounded-2xl border border-white/10 bg-[#141419] px-4 py-3 text-sm"
                        >
                          <p className="text-sm text-white/70">
                            {fact.claim}
                          </p>
                          <p className="mt-2 text-xs text-white/50">
                            Submitted by {fact.submittedBy}
                          </p>
                          <a
                            href={
                              /^https?:\/\//i.test(fact.source)
                                ? fact.source
                                : `https://${fact.source}`
                            }
                            className="mt-2 inline-block text-xs font-semibold text-white/50 underline"
                          >
                            <span className="inline-flex items-center gap-1">
                              Source
                              <span aria-hidden="true">↗</span>
                            </span>
                          </a>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}

              {activePanel === "stage" && (
                <>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                      Stage
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold">
                      Manage speakers
                    </h2>
                    <p className="mt-1 text-sm text-white/50">
                      Move participants on stage and toggle access.
                    </p>
                    {isAdmin && (
                      <div className="mt-4 rounded-2xl border border-white/10 bg-[#141419] px-4 py-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold">Make public</p>
                            <p className="mt-1 text-xs text-white/50">
                              Anyone on the platform can see this debate and ask
                              to join.
                            </p>
                            <p className="mt-1 text-xs text-white/40">
                              If off, you can still share via a private link.
                            </p>
                          </div>
                          <button
                            className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
                              isPublic ? "bg-emerald-500" : "bg-white/10"
                            }`}
                            onClick={handleTogglePublic}
                            aria-pressed={isPublic}
                            type="button"
                          >
                            <span
                              className={`h-5 w-5 rounded-full bg-[#141419] shadow transition ${
                                isPublic ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    )}
                    {!isAdmin && !canPublish && (
                      <button
                        className="mt-4 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black transition hover:bg-white/90"
                        onClick={handleRequestJoin}
                      >
                        Request to join
                      </button>
                    )}
                  </div>
                  <div className="mt-6 flex items-center gap-6 text-sm">
                    <button
                      className={`pb-2 font-semibold transition ${
                        stageTab === "debate"
                          ? "border-b-2 border-white/40 text-white"
                          : "text-white/50 hover:text-white"
                      }`}
                      onClick={() => setStageTab("debate")}
                    >
                      This debate
                    </button>
                    <button
                      className={`pb-2 font-semibold transition ${
                        stageTab === "invites"
                          ? "border-b-2 border-white/40 text-white"
                          : "text-white/50 hover:text-white"
                      }`}
                      onClick={() => setStageTab("invites")}
                    >
                      <span className="inline-flex items-center gap-2">
                        Join requests
                        {isAdmin && pendingCount > 0 && (
                          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                            {pendingCount}
                          </span>
                        )}
                      </span>
                    </button>
                  </div>
                  {stageTab === "invites" ? (
                    <div className="mt-6 space-y-3 overflow-y-auto pr-1">
                      {pendingRequests.length === 0 ? (
                        <div className="rounded-2xl bg-white/10 px-4 py-4">
                          <p className="text-sm font-semibold text-white">
                            Invite users
                          </p>
                          <p className="mt-1 text-xs text-white/50">
                            Share the room link to bring speakers into the debate.
                          </p>
                          <button
                            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1 text-xs font-semibold text-black transition hover:bg-white/90"
                            onClick={handleShareDebate}
                          >
                            <FiLink className="h-3.5 w-3.5" />
                            Copy shareable link
                          </button>
                        </div>
                      ) : (
                        pendingRequests.map((uid) => (
                          <div
                            key={uid}
                            className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3 text-sm"
                          >
                            <div>
                              <p className="text-sm font-semibold">
                                {participantNames[uid] ?? uid}
                              </p>
                              <p className="text-xs text-white/40">
                                Requesting to join
                              </p>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <button
                                className="rounded-full border border-white/10 px-3 py-1 text-xs"
                                onClick={() =>
                                  setPendingRequests((prev) =>
                                    prev.filter((id) => id !== uid)
                                  )
                                }
                              >
                                Reject
                              </button>
                              <button
                                className="rounded-lg bg-white px-3 py-1 text-xs font-semibold text-black transition hover:bg-white/90"
                                onClick={() => handleApproveJoin(uid)}
                              >
                                Accept
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    <div className="mt-6 space-y-3 overflow-y-auto pr-1">
                      <div className="rounded-2xl border border-white/10 bg-[#141419] px-3 py-2 text-xs text-white/60">
                        <input
                          value={participantSearch}
                          onChange={(event) =>
                            setParticipantSearch(event.target.value)
                          }
                          placeholder="Search participants"
                          className="w-full bg-transparent text-xs text-white outline-none placeholder:text-white/40"
                        />
                      </div>
                      {filteredParticipants.map((participant) => {
                        const onStage = stageMembers[participant.id] ?? false;
                        const isApproved =
                          approvedParticipants[participant.id] ?? false;
                        return (
                        <div
                          key={participant.id}
                          className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm ${
                            onStage
                              ? "border-white/20 bg-white/5"
                              : "border-white/10"
                          }`}
                        >
                          <div className="flex min-w-[180px] items-center gap-3">
                            {participant.avatarUrl ? (
                              <img
                                src={participant.avatarUrl}
                                alt={participant.name}
                                className="h-8 w-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white/60">
                                {getInitials(participant.name)}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-semibold">
                                {participant.name}
                                {participant.isLocal ? " (you)" : ""}
                              </p>
                              <p className="text-xs text-white/40">
                                {onStage
                                  ? "On stage"
                                  : isApproved
                                    ? "Approved"
                                    : "Audience"}
                                {participant.isLocal && !micOn ? " · Muted" : ""}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <button
                              className={`group relative inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-semibold text-white transition ${
                                onStage
                                  ? "bg-red-500 hover:bg-red-600"
                                  : "bg-emerald-500 hover:bg-emerald-600"
                              }`}
                              onClick={() => {
                                if (isAdmin) {
                                  void handleSetStageForParticipant(
                                    participant.id,
                                    !onStage
                                  );
                                  return;
                                }
                                setStageMembers((prev) => ({
                                  ...prev,
                                  [participant.id]: !onStage,
                                }));
                              }}
                              aria-label={
                                onStage ? "Remove from stage" : "Add to stage"
                              }
                            >
                              {onStage ? "Remove" : "Add"}
                              <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black px-2 py-1 text-[10px] font-semibold text-white opacity-0 transition group-hover:opacity-100">
                                {onStage ? "Remove from stage" : "Add to stage"}
                              </span>
                            </button>
                            {isAdmin && !participant.isLocal && (
                              <button
                                className="group relative flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/60 transition hover:text-white"
                                onClick={() => handleMuteParticipant(participant.id)}
                                aria-label="Mute participant"
                              >
                                <FiMicOff className="h-4 w-4" />
                                <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black px-2 py-1 text-[10px] font-semibold text-white opacity-0 transition group-hover:opacity-100">
                                  Mute participant
                                </span>
                              </button>
                            )}
                            {participant.isLocal && (
                              <button
                                className={`flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/60 transition hover:text-white ${
                                  micOn ? "" : "bg-red-100 text-red-600"
                                }`}
                                onClick={async () => {
                                  const next = !micOn;
                                  await localAudioTrack?.setEnabled(next);
                                  setMicOn(next);
                                }}
                                aria-label={micOn ? "Mute mic" : "Unmute mic"}
                                title={micOn ? "Mute mic" : "Unmute mic"}
                              >
                                {micOn ? (
                                  <FiMic className="h-4 w-4" />
                                ) : (
                                  <FiMicOff className="h-4 w-4" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <main className="flex-1 px-6 py-6 lg:px-10">
          {waitingForApproval ? (
            <div className="flex min-h-[70vh] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-6 flex items-center justify-center gap-3">
                  <img src="/small-logo.svg" alt="Podium" className="h-10 w-10" />
                  <span className="text-2xl font-semibold text-white">Podium</span>
                </div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                  Waiting room
                </p>
                <p className="mt-3 text-3xl font-semibold text-white">
                  Waiting for host approval
                </p>
                <p className="mt-2 text-sm text-white/50">
                  We’ve sent your request to join the stage.
                </p>
              </div>
            </div>
          ) : (
            <>
              <SessionHeader
                showTopics={activePanel === "topics"}
                onToggleTopics={() =>
                  setActivePanel((prev) => (prev === "topics" ? null : "topics"))
                }
                onToggleDebate={toggleDebate}
                onLeave={() => handleLeaveRoom()}
                onShare={handleShareDebate}
                running={running}
                hasActiveTopic={activeIndex !== null}
              />

              <section className="relative mt-8">
            <div className="relative overflow-hidden">
              <div className="flex h-full min-h-[420px] flex-col gap-4 p-6">
                {mediaError && (
                  <div className="rounded-3xl border border-dashed border-white/10 bg-[#15161a] px-6 py-6 text-sm text-white/60">
                    <p className="text-sm font-semibold">
                      Camera or mic not available
                    </p>
                    <p className="mt-2 text-xs text-white/50">{mediaError}</p>
                    <button
                      className="mt-4 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black transition hover:bg-white/90"
                      onClick={handleRequestMedia}
                    >
                      Request access again
                    </button>
                  </div>
                )}
                {isLoading && (
                  <div className="flex h-full min-h-[420px] items-center justify-center rounded-3xl border border-white/10 bg-[linear-gradient(135deg,#121214,#1a1a20)]">
                    <p className="text-sm text-white/50">Joining session…</p>
                  </div>
                )}

                {!isLoading && agoraTokens && (
                  <div className="grid gap-6">
                    {running && activeTopic && (
                      <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 shadow-[0_10px_40px_rgba(0,0,0,0.12)] backdrop-blur">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.3em] text-white/50">
                              Plan {activeIndex !== null ? activeIndex + 1 : 1}/
                              {topics.length}
                            </p>
                            <p className="text-sm font-medium">
                              {activeTopic.title}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-xl font-semibold">
                              {formatTime(remainingSeconds)}
                            </span>
                            <button
                              className="rounded-full border border-white/10 px-4 py-1 text-xs font-semibold"
                              onClick={skipTopic}
                            >
                              Skip
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="rounded-3xl p-4">
                      <div className="mt-1">
                        {stageVisibleParticipants.length > 0 ? (
                          <AgoraVideoGrid
                            localOnStage={stageVisibleParticipants.some(
                              (participant) => participant.isLocal
                            )}
                            localTrack={
                              stageVisibleParticipants.some(
                                (participant) => participant.isLocal
                              )
                                ? localVideoTrack
                                : null
                            }
                            localName={
                              user?.fullName ||
                              user?.username ||
                              guestName ||
                              "You"
                            }
                            localAvatarUrl={user?.imageUrl ?? null}
                            remoteUsers={remoteUsers
                              .filter((user) =>
                                stageVisibleParticipants.some(
                                  (participant) =>
                                    participant.id === String(user.uid)
                                )
                              )
                              .map((participant) => ({
                                uid: String(participant.uid),
                                name:
                                  participantNames[String(participant.uid)] ??
                                  String(participant.uid),
                                avatarUrl: null,
                                track: participant.videoTrack ?? null,
                              }))}
                            cameraOn={
                              stageVisibleParticipants.some(
                                (participant) => participant.isLocal
                              )
                                ? cameraOn
                                : false
                            }
                            micMuted={!micOn}
                            localAudioLevel={localAudioLevel}
                          />
                        ) : (
                          <div className="flex h-full min-h-[420px] items-center justify-center rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top,#1c1c22,#0f0f12)]">
                            <div className="text-center">
                              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-[#141419] shadow-[0_15px_35px_rgba(0,0,0,0.08)]">
                                <FiUsers className="h-6 w-6 text-white/70" />
                              </div>
                              <p className="mt-4 text-2xl font-semibold text-white">
                                Stage is empty
                              </p>
                              <p className="mt-2 text-sm text-white/50">
                                Add someone to the stage to start the debate.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {isAdmin && (
                      <div className="rounded-3xl p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                            Participants
                          </p>
                          <span className="text-xs text-white/40">
                            {stageParticipants.length} total
                          </span>
                        </div>
                        <div className="mt-4 grid gap-2 text-sm">
                          {stageParticipants.map((participant) => {
                            const onStage = stageMembers[participant.id] ?? false;
                            return (
                              <div
                                key={participant.id}
                                className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3 ${
                                  onStage
                                    ? "border-white/20 bg-white/5"
                                    : "border-white/10 bg-[#141419]"
                                }`}
                              >
                                <div className="flex min-w-[180px] items-center gap-3">
                                  {participant.avatarUrl ? (
                                    <img
                                      src={participant.avatarUrl}
                                      alt={participant.name}
                                      className="h-8 w-8 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white/60">
                                      {getInitials(participant.name)}
                                    </div>
                                  )}
                                  <div>
                                    <p className="text-sm font-semibold">
                                      {participant.name}
                                      {participant.isLocal ? " (you)" : ""}
                                    </p>
                                    <p className="text-xs text-white/40">
                                      {onStage ? "On stage" : "Audience"}
                                    </p>
                                  </div>
                                </div>
                                {isAdmin && !participant.isLocal && (
                                  <div className="flex items-center gap-2 text-xs">
                                  <button
                                    className={`group relative inline-flex items-center justify-center rounded-full px-3 py-1 text-[10px] font-semibold text-white transition ${
                                      onStage
                                        ? "bg-red-500 hover:bg-red-600"
                                        : "bg-emerald-500 hover:bg-emerald-600"
                                    }`}
                                    onClick={() =>
                                      handleSetStageForParticipant(
                                        participant.id,
                                        !onStage
                                      )
                                    }
                                    aria-label={
                                      onStage
                                        ? "Remove from stage"
                                        : "Add to stage"
                                    }
                                  >
                                    {onStage ? "Remove" : "Add"}
                                    <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black px-2 py-1 text-[10px] font-semibold text-white opacity-0 transition group-hover:opacity-100">
                                      {onStage ? "Remove from stage" : "Add to stage"}
                                    </span>
                                  </button>
                                  <button
                                    className="group relative flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/60 transition hover:text-white"
                                    onClick={() => handleMuteParticipant(participant.id)}
                                    aria-label="Mute participant"
                                  >
                                    <FiMicOff className="h-4 w-4" />
                                    <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black px-2 py-1 text-[10px] font-semibold text-white opacity-0 transition group-hover:opacity-100">
                                      Mute participant
                                    </span>
                                  </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {!isLoading && !agoraTokens && (
                  <div className="flex h-full min-h-[420px] items-center justify-center rounded-3xl border border-white/10 bg-[linear-gradient(135deg,#121214,#1a1a20)]">
                    <div className="text-center">
                      <p className="text-sm font-semibold">Session unavailable</p>
                      <button
                        className="mt-3 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black transition hover:bg-white/90"
                        onClick={() => window.location.reload()}
                      >
                        Rejoin
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
