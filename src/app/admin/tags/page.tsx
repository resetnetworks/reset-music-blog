import dbConnect from "@/lib/mongoose";
import Tag from "@/models/Tag";
import TagsClient from "./TagsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tags | Reset Music Admin",
};

export default async function TagsPage() {
  await dbConnect();
  const tags = await Tag.find().sort({ createdAt: -1 }).lean();

  const serializedTags = tags.map((t: any) => ({
    id: t._id.toString(),
    name: t.name,
    slug: t.slug,
  }));

  return <TagsClient initialTags={serializedTags} />;
}
