import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.DATABASE_URL;

if (!MONGODB_URI) {
  console.error("Please define DATABASE_URL in your .env file!");
  process.exit(1);
}

const AdminUserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    name: { type: String },
    role: { type: String, default: "admin" },
  },
  { timestamps: true }
);

const AdminUser = mongoose.models.AdminUser || mongoose.model("AdminUser", AdminUserSchema);

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    
    const email = "admin@resetmusic.com";
    const password = "password123";
    
    // Check if exists
    const existing = await AdminUser.findOne({ email });
    if (existing) {
      console.log(`Admin user ${email} already exists!`);
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await AdminUser.create({
      email,
      passwordHash,
      name: "Super Admin",
      role: "admin",
    });

    console.log(`\n✅ Admin user created successfully!`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`\nYou can now login at /login and access /admin.\n`);
    
    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin user:", error);
    process.exit(1);
  }
}

seed();
