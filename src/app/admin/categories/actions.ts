"use server";

import dbConnect from "@/lib/mongoose";
import Category from "@/models/Category";
import { revalidatePath } from "next/cache";

export async function createCategoryAction(formData: FormData) {
  try {
    await dbConnect();
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;

    const existing = await Category.findOne({ slug });
    if (existing) return { error: "Slug already exists" };

    await Category.create({ name, slug, description });
    revalidatePath("/admin/categories");
    revalidatePath("/admin/articles/new");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to create category" };
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    await dbConnect();
    await Category.findByIdAndDelete(id);
    revalidatePath("/admin/categories");
    revalidatePath("/admin/articles/new");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete category" };
  }
}
