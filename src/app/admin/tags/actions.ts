"use server";

import dbConnect from "@/lib/mongoose";
import Tag from "@/models/Tag";
import { revalidatePath } from "next/cache";

export async function createTagAction(formData: FormData) {
  try {
    await dbConnect();
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;

    const existing = await Tag.findOne({ slug });
    if (existing) return { error: "Slug already exists" };

    await Tag.create({ name, slug });
    revalidatePath("/admin/tags");
    revalidatePath("/admin/articles/new");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to create tag" };
  }
}

export async function deleteTagAction(id: string) {
  try {
    await dbConnect();
    await Tag.findByIdAndDelete(id);
    revalidatePath("/admin/tags");
    revalidatePath("/admin/articles/new");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete tag" };
  }
}
