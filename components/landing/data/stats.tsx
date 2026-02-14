import { BsFillStarFill } from "react-icons/bs";
import { FiClock, FiUsers } from "react-icons/fi";

import { IStats } from "@/components/landing/types";

export const stats: IStats[] = [
  {
    title: "3 steps",
    icon: <FiClock size={34} className="text-blue-500" />,
    description: "Create a room, add topics, and go live in minutes.",
  },
  {
    title: "5.0",
    icon: <BsFillStarFill size={34} className="text-yellow-500" />,
    description: "Hosts rate Podium for clarity and control.",
  },
  {
    title: "Teams",
    icon: <FiUsers size={34} className="text-green-600" />,
    description: "Built for campus, community, and professional debates.",
  },
];
