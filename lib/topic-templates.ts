import "server-only";

import { supabaseRequest } from "./supabase";

export type TemplateTopic = {
  id: string;
  title: string;
  minutes: number;
};

export type TopicTemplate = {
  id: string;
  owner_id: string;
  owner_username: string;
  title: string;
  topics: TemplateTopic[];
  created_at: string;
};

type CreateTopicTemplateInput = {
  ownerId: string;
  ownerUsername: string;
  title: string;
  topics: TemplateTopic[];
};

export async function getTopicTemplatesByOwner(
  ownerId: string
): Promise<TopicTemplate[]> {
  return supabaseRequest<TopicTemplate[]>("topic_templates", {
    query: {
      select: "id,owner_id,owner_username,title,topics,created_at",
      owner_id: `eq.${ownerId}`,
      order: "created_at.desc",
    },
  });
}

export async function getTopicTemplateById(
  id: string
): Promise<TopicTemplate | null> {
  const templates = await supabaseRequest<TopicTemplate[]>("topic_templates", {
    query: {
      select: "id,owner_id,owner_username,title,topics,created_at",
      id: `eq.${id}`,
      limit: "1",
    },
  });
  return templates[0] ?? null;
}

export async function createTopicTemplate(
  input: CreateTopicTemplateInput
): Promise<TopicTemplate> {
  const templates = await supabaseRequest<TopicTemplate[]>("topic_templates", {
    method: "POST",
    headers: {
      Prefer: "return=representation",
    },
    body: {
      owner_id: input.ownerId,
      owner_username: input.ownerUsername,
      title: input.title,
      topics: input.topics,
    },
  });

  const template = templates[0];
  if (!template) {
    throw new Error("Supabase did not return created template");
  }
  return template;
}
