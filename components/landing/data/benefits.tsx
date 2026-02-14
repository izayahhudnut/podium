import {
  FiBarChart2,
  FiClock,
  FiClipboard,
  FiMessageSquare,
  FiTarget,
  FiUser,
} from "react-icons/fi";

import { IBenefit } from "@/components/landing/types";

export const benefits: IBenefit[] = [
  {
    title: "Control the room",
    description:
      "Create rooms, set agendas, and manage speakers with tools built for structured conversations.",
    bullets: [
      {
        title: "Agenda timing",
        description: "Keep every topic on schedule with clear time controls.",
        icon: <FiClock size={26} />,
      },
      {
        title: "Speaker queue",
        description: "Bring the right voices on stage at the right moment.",
        icon: <FiUser size={26} />,
      },
      {
        title: "Moderator tools",
        description: "Guide the discussion without losing momentum.",
        icon: <FiTarget size={26} />,
      },
    ],
    imageSrc: "/images/mockup-1.webp",
  },
  {
    title: "Go live in minutes",
    description:
      "Launch a room, add topics, and moderate the stage in minutes.",
    bullets: [
      {
        title: "Create a room",
        description: "Name the debate and choose a format that fits.",
        icon: <FiClipboard size={26} />,
      },
      {
        title: "Add topics",
        description: "Build the agenda so conversations stay focused.",
        icon: <FiMessageSquare size={26} />,
      },
      {
        title: "Go live",
        description: "Bring speakers on stage and start the session.",
        icon: <FiBarChart2 size={26} />,
      },
    ],
    imageSrc: "/images/mockup-2.webp",
  },
  {
    title: "Stay on track",
    description:
      "Templates, timers, and insights keep every debate running smoothly.",
    bullets: [
      {
        title: "Reusable formats",
        description: "Save structures for recurring debate styles.",
        icon: <FiClipboard size={26} />,
      },
      {
        title: "Real-time timers",
        description: "Track speaking time with clear visual cues.",
        icon: <FiClock size={26} />,
      },
      {
        title: "Post-session insights",
        description: "Review performance and improve the next debate.",
        icon: <FiBarChart2 size={26} />,
      },
    ],
    imageSrc: "/images/mockup-1.webp",
  },
];
