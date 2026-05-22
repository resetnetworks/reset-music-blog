"use server";

import dbConnect from "@/lib/mongoose";
import AdminUser from "@/models/AdminUser";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  await dbConnect();

  // For initial setup: if no admin users exist, create the first one automatically
  const adminCount = await AdminUser.countDocuments();
  if (adminCount === 0) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    await AdminUser.create({
      email,
      passwordHash,
      name: "Super Admin",
      role: "admin",
    });
  }

  const user = await AdminUser.findOne({ email }).lean();
  if (!user) {
    return { error: "Invalid credentials" };
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash as string);
  if (!isMatch) {
    return { error: "Invalid credentials" };
  }

  await createSession(user._id.toString(), user.role as string);
  return { success: true };
}
