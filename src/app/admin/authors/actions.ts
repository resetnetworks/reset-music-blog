"use server";

import dbConnect from "@/lib/mongoose";
import Author from "@/models/Author";
import { revalidatePath } from "next/cache";

export async function createAuthorAction(formData: FormData) {
  try {
    await dbConnect();
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const bio = formData.get("bio") as string;
    const avatar = formData.get("avatar") as string;

    const existing = await Author.findOne({ slug });
    if (existing) return { error: "Slug already exists" };

    await Author.create({ name, slug, bio, avatar });
    revalidatePath("/admin/authors");
    revalidatePath("/admin/articles/new");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to create author" };
  }
}

export async function deleteAuthorAction(id: string) {
  try {
    await dbConnect();
    await Author.findByIdAndDelete(id);
    revalidatePath("/admin/authors");
    revalidatePath("/admin/articles/new");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete author" };
  }
}
