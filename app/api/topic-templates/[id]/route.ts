import { NextResponse } from "next/server";
import { getTopicTemplateById } from "@/lib/topic-templates";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id?: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "Missing template id" }, { status: 400 });
  }

  const template = await getTopicTemplateById(id);
  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  return NextResponse.json({ template });
}
