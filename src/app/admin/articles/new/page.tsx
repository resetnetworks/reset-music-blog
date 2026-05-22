import dbConnect from "@/lib/mongoose";
import Author from "@/models/Author";
import Category from "@/models/Category";
import Tag from "@/models/Tag";
import EditorClient from "../EditorClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "New Article | Reset Music",
};

export default async function NewArticlePage() {
  await dbConnect();
  
  const [authors, categories, tags] = await Promise.all([
    Author.find().lean(),
    Category.find().lean(),
    Tag.find().lean(),
  ]);

  const mapToId = (arr: any[]) => arr.map(a => ({ id: a._id.toString(), name: a.name }));

  return (
    <EditorClient
      initialData={null}
      authors={mapToId(authors)}
      categories={mapToId(categories)}
      tags={mapToId(tags)}
    />
  );
}
