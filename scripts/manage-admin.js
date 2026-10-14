import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import readline from "readline";

const MONGODB_URI = process.env.DATABASE_URL;

if (!MONGODB_URI) {
  console.error("❌ Error: DATABASE_URL is not defined in your environment (.env).");
  process.exit(1);
}

const AdminUserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    name: { type: String, default: "Admin" },
    role: { type: String, default: "admin" },
  },
  { timestamps: true }
);

const AdminUser = mongoose.models.AdminUser || mongoose.model("AdminUser", AdminUserSchema);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function main() {
  try {
    console.log("\n🔒 --- Reset Music Admin Security Management --- 🔒\n");
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected successfully.\n");

    const existingAdmins = await AdminUser.find({}, "email name role").lean();
    if (existingAdmins.length > 0) {
      console.log("Existing Admin Users in DB:");
      existingAdmins.forEach((a, i) => {
        console.log(`  [${i + 1}] ${a.email} (${a.name || "No name"})`);
      });
      console.log("");
    } else {
      console.log("⚠️ No admin users currently exist in database.\n");
    }

    let email = process.argv[2];
    let password = process.argv[3];

    if (!email) {
      email = (await askQuestion("Enter admin email address: ")).trim();
    }
    if (!password) {
      password = (await askQuestion("Enter new secure password (min 8 chars): ")).trim();
    }

    if (!email || !email.includes("@")) {
      console.error("❌ Invalid email address provided.");
      process.exit(1);
    }

    if (!password || password.length < 8) {
      console.error("❌ Password must be at least 8 characters long for security.");
      process.exit(1);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    let role = process.argv[4];
    if (!role) {
      const roleChoice = (await askQuestion("Enter role (admin / hr) [default: admin]: ")).trim().toLowerCase();
      role = roleChoice === "hr" ? "hr" : "admin";
    }

    const existing = await AdminUser.findOne({ email });
    if (existing) {
      existing.passwordHash = passwordHash;
      if (role) existing.role = role;
      await existing.save();
      console.log(`\n✅ Password and role (${existing.role}) successfully updated for: ${email}`);
    } else {
      await AdminUser.create({
        email,
        passwordHash,
        name: role === "hr" ? "HR Manager" : "Super Admin",
        role,
      });
      console.log(`\n✅ New user (${role}) successfully created: ${email}`);
    }

    console.log("🔒 Credentials securely hashed and saved. You can now log in at /login.\n");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to manage admin credentials:", error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
