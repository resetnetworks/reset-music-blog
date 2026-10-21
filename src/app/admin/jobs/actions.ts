"use server";

import dbConnect from "@/lib/mongoose";
import Job from "@/models/Job";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth";

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

export async function createJobAction(formData: any) {
  try {
    await requireAdminSession();
    await dbConnect();

    const title = formData.title?.trim();
    if (!title) {
      return { error: "Job title is required" };
    }

    let slug = slugify(formData.slug || title);
    // Ensure uniqueness
    const existing = await Job.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

    const job = await Job.create({
      title,
      slug,
      department: formData.department?.trim() || "General",
      type: formData.type || "Full-time",
      locationType: formData.locationType || "On-site",
      location: formData.location?.trim() || "Malviya Nagar, New Delhi",
      experience: formData.experience?.trim() || "Fresher",
      description: formData.description?.trim() || "",
      responsibilities: Array.isArray(formData.responsibilities)
        ? formData.responsibilities.filter((r: string) => r.trim() !== "")
        : [],
      requirements: Array.isArray(formData.requirements)
        ? formData.requirements.filter((r: string) => r.trim() !== "")
        : [],
      applyUrl: formData.applyUrl?.trim() || "",
      customQuestions: Array.isArray(formData.customQuestions) ? formData.customQuestions : [],
      atsKeywords: Array.isArray(formData.atsKeywords)
        ? formData.atsKeywords.map((k: string) => k.trim()).filter(Boolean)
        : [],
      salary: {
        min: Number(formData.salaryMin) || 20000,
        max: Number(formData.salaryMax) || undefined,
        currency: formData.currency || "INR",
        period: formData.salaryPeriod || "MONTH",
      },
      status: formData.status || "active",
      datePosted: new Date(),
      validThrough: formData.validThrough ? new Date(formData.validThrough) : oneYearFromNow,
    });

    revalidatePath("/careers");
    revalidatePath("/admin/jobs");

    return { success: true, id: job._id.toString() };
  } catch (error: any) {
    console.error("Error creating job:", error);
    return { error: error.message || "Failed to create job" };
  }
}

export async function updateJobAction(id: string, formData: any) {
  try {
    await requireAdminSession();
    await dbConnect();

    const title = formData.title?.trim();
    if (!title) {
      return { error: "Job title is required" };
    }

    const updateData: any = {
      title,
      department: formData.department?.trim() || "General",
      type: formData.type || "Full-time",
      locationType: formData.locationType || "On-site",
      location: formData.location?.trim() || "Malviya Nagar, New Delhi",
      experience: formData.experience?.trim() || "Fresher",
      description: formData.description?.trim() || "",
      responsibilities: Array.isArray(formData.responsibilities)
        ? formData.responsibilities.filter((r: string) => r.trim() !== "")
        : [],
      requirements: Array.isArray(formData.requirements)
        ? formData.requirements.filter((r: string) => r.trim() !== "")
        : [],
      applyUrl: formData.applyUrl?.trim() || "",
      customQuestions: Array.isArray(formData.customQuestions) ? formData.customQuestions : [],
      atsKeywords: Array.isArray(formData.atsKeywords)
        ? formData.atsKeywords.map((k: string) => k.trim()).filter(Boolean)
        : [],
      salary: {
        min: Number(formData.salaryMin) || 20000,
        max: Number(formData.salaryMax) || undefined,
        currency: formData.currency || "INR",
        period: formData.salaryPeriod || "MONTH",
      },
      status: formData.status || "active",
    };

    if (formData.validThrough) {
      updateData.validThrough = new Date(formData.validThrough);
    }

    const updated = await Job.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) {
      return { error: "Job posting not found" };
    }

    revalidatePath("/careers");
    revalidatePath("/admin/jobs");
    revalidatePath(`/admin/jobs/${id}/edit`);

    return { success: true };
  } catch (error: any) {
    console.error("Error updating job:", error);
    return { error: error.message || "Failed to update job" };
  }
}

export async function deleteJobAction(id: string) {
  try {
    await requireAdminSession();
    await dbConnect();
    await Job.findByIdAndDelete(id);

    revalidatePath("/careers");
    revalidatePath("/admin/jobs");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting job:", error);
    return { error: error.message || "Failed to delete job" };
  }
}

export async function toggleJobStatusAction(id: string, currentStatus: string) {
  try {
    await requireAdminSession();
    await dbConnect();
    const newStatus = currentStatus === "active" ? "closed" : "active";
    await Job.findByIdAndUpdate(id, { status: newStatus });

    revalidatePath("/careers");
    revalidatePath("/admin/jobs");
    return { success: true, newStatus };
  } catch (error: any) {
    console.error("Error toggling job status:", error);
    return { error: error.message || "Failed to toggle status" };
  }
}

export async function updateApplicationStatusAction(applicationId: string, status: string, jobId?: string) {
  try {
    await requireAdminSession();
    await dbConnect();
    const Application = (await import("@/models/Application")).default;
    await Application.findByIdAndUpdate(applicationId, { status });

    if (jobId) {
      revalidatePath(`/admin/jobs/${jobId}/applications`);
    }
    revalidatePath("/admin/jobs");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating application status:", error);
    return { error: error.message || "Failed to update status" };
  }
}

export async function updateApplicationNotesAction(applicationId: string, notes: string, jobId?: string) {
  try {
    await requireAdminSession();
    await dbConnect();
    const Application = (await import("@/models/Application")).default;
    await Application.findByIdAndUpdate(applicationId, { notes });

    if (jobId) {
      revalidatePath(`/admin/jobs/${jobId}/applications`);
    }
    return { success: true };
  } catch (error: any) {
    console.error("Error updating application notes:", error);
    return { error: error.message || "Failed to update notes" };
  }
}

export async function deleteApplicationAction(applicationId: string, jobId?: string) {
  try {
    await requireAdminSession();
    await dbConnect();
    const Application = (await import("@/models/Application")).default;
    await Application.findByIdAndDelete(applicationId);

    if (jobId) {
      revalidatePath(`/admin/jobs/${jobId}/applications`);
    }
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting application:", error);
    return { error: error.message || "Failed to delete application" };
  }
}

export async function getJobsListAction() {
  try {
    await requireAdminSession();
    await dbConnect();
    const jobs = await Job.find({})
      .sort({ createdAt: -1 })
      .select("title department type location status atsKeywords slug")
      .lean();

    return {
      success: true,
      jobs: jobs.map((j: any) => ({
        id: j._id.toString(),
        title: j.title,
        department: j.department,
        type: j.type,
        location: j.location,
        status: j.status || "active",
        atsKeywords: j.atsKeywords || [],
        slug: j.slug,
      })),
    };
  } catch (error: any) {
    console.error("Error fetching jobs list:", error);
    return { success: false, error: error.message || "Failed to fetch jobs" };
  }
}

