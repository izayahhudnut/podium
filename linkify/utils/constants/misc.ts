import { BarChart3Icon, FolderOpenIcon, WandSparklesIcon } from "lucide-react";

export const DEFAULT_AVATAR_URL = "https://api.dicebear.com/8.x/initials/svg?backgroundType=gradientLinear&backgroundRotation=0,360&seed=";

export const PAGINATION_LIMIT = 10;

export const COMPANIES = [
    {
        name: "Asana",
        logo: "/assets/company-01.svg",
    },
    {
        name: "Tidal",
        logo: "/assets/company-02.svg",
    },
    {
        name: "Innovaccer",
        logo: "/assets/company-03.svg",
    },
    {
        name: "Linear",
        logo: "/assets/company-04.svg",
    },
    {
        name: "Raycast",
        logo: "/assets/company-05.svg",
    },
    {
        name: "Labelbox",
        logo: "/assets/company-06.svg",
    }
] as const;

export const PROCESS = [
    {
        title: "Create a room",
        description: "Name your debate and choose the format that fits the session.",
        icon: FolderOpenIcon,
    },
    {
        title: "Add topics",
        description: "Build the agenda and timing so the conversation stays focused.",
        icon: WandSparklesIcon,
    },
    {
        title: "Go live",
        description: "Bring speakers on stage and moderate the debate in real time.",
        icon: BarChart3Icon,
    },
] as const;

export const FEATURES = [
    {
        title: "Link shortening",
        description: "Create short links that are easy to remember and share.",
    },
    {
        title: "Advanced analytics",
        description: "Track and measure the performance of your links.",
    },
    {
        title: "Password protection",
        description: "Secure your links with a password.",
    },
    {
        title: "Custom QR codes",
        description: "Generate custom QR codes for your links.",
    },
    {
        title: "Link expiration",
        description: "Set an expiration date for your links.",
    },
    {
        title: "Team collaboration",
        description: "Share links with your team and collaborate in real-time.",
    },
] as const;

export const REVIEWS = [
    {
        name: "Michael Smith",
        username: "@moderator_mike",
        avatar: "https://randomuser.me/api/portraits/men/1.jpg",
        rating: 5,
        review: "Podium gave our debates structure overnight. Timing and stage control are perfect."
    },
    {
        name: "Emily Johnson",
        username: "@emilytalks",
        avatar: "https://randomuser.me/api/portraits/women/1.jpg",
        rating: 4,
        review: "We can finally keep every speaker on track. The agenda flow is great."
    },
    {
        name: "Daniel Williams",
        username: "@debatelead",
        avatar: "https://randomuser.me/api/portraits/men/2.jpg",
        rating: 5,
        review: "Templates save our team hours every week. Launching sessions is fast."
    },
    {
        name: "Sophia Brown",
        username: "@campusdebate",
        avatar: "https://randomuser.me/api/portraits/women/2.jpg",
        rating: 4,
        review: "Podium keeps our campus debates respectful and on schedule."
    },
    {
        name: "James Taylor",
        username: "@policyhost",
        avatar: "https://randomuser.me/api/portraits/men/3.jpg",
        rating: 5,
        review: "The moderator tools are a game changer. We can manage the stage easily."
    },
    {
        name: "Olivia Martinez",
        username: "@oliviadebates",
        avatar: "https://randomuser.me/api/portraits/women/3.jpg",
        rating: 4,
        review: "Clean interface, clear structure. Our speakers love it."
    },
    {
        name: "William Garcia",
        username: "@liveforums",
        avatar: "https://randomuser.me/api/portraits/men/4.jpg",
        rating: 5,
        review: "We finally have one place to run multi-speaker debates with control."
    },
    {
        name: "Mia Rodriguez",
        username: "@miarooms",
        avatar: "https://randomuser.me/api/portraits/women/4.jpg",
        rating: 4,
        review: "Podium keeps every session flowing. No more chaos."
    },
    {
        name: "Henry Lee",
        username: "@henrymoderates",
        avatar: "https://randomuser.me/api/portraits/men/5.jpg",
        rating: 5,
        review: "Timing tools and speaker controls make our debates feel professional."
    },
] as const;
