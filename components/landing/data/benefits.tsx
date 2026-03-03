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
    imageSrc: "/debate.svg",
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
    imageSrc: "/factcheck.svg",
  },
  {
    title: "Practice mode",
    description:
      "Practice a debate or speech before you go live. Set your goal and get real-time assistance while you speak.",
    bullets: [
      {
        title: "Goal-based practice",
        description: "Enter what you want to improve and tailor each practice session to that outcome.",
        icon: <FiClipboard size={26} />,
      },
      {
        title: "Live coaching prompts",
        description: "Get real-time guidance during delivery to improve clarity, pacing, and structure.",
        icon: <FiClock size={26} />,
      },
      {
        title: "Debate and speech prep",
        description: "Rehearse both formal speeches and debate rounds with feedback before the real session.",
        icon: <FiBarChart2 size={26} />,
      },
    ],
    imageSrc: "/practice.svg",
  },
];
