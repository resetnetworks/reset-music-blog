import dbConnect from "@/lib/mongoose";
import Author from "@/models/Author";
import AuthorsClient from "./AuthorsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Authors | Reset Music Admin",
};

export default async function AuthorsPage() {
  await dbConnect();
  const authors = await Author.find().sort({ createdAt: -1 }).lean();

  const serializedAuthors = authors.map((a: any) => ({
    id: a._id.toString(),
    name: a.name,
    slug: a.slug,
    bio: a.bio,
    avatar: a.avatar,
  }));

  return <AuthorsClient initialAuthors={serializedAuthors} />;
}
