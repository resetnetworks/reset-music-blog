import dbConnect from "@/lib/mongoose";
import Category from "@/models/Category";
import CategoriesClient from "./CategoriesClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Categories | Reset Music Admin",
};

export default async function CategoriesPage() {
  await dbConnect();
  const categories = await Category.find().sort({ createdAt: -1 }).lean();

  const serializedCategories = categories.map((c: any) => ({
    id: c._id.toString(),
    name: c.name,
    slug: c.slug,
    description: c.description,
  }));

  return <CategoriesClient initialCategories={serializedCategories} />;
}
