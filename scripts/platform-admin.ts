/**
 * Platforma egasini yaratish yoki parolini almashtirish.
 *
 *   npx tsx scripts/platform-admin.ts <login> <parol>
 *
 * Parol kamida 8 belgi bo'lsin — bu yerdan hamma korxona ko'rinadi.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const [loginRaw, password] = process.argv.slice(2);

  if (!loginRaw || !password) {
    console.error("Ishlatish: npx tsx scripts/platform-admin.ts <login> <parol>");
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("Parol kamida 8 belgi bo'lsin.");
    process.exit(1);
  }

  const login = loginRaw.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await db.platformAdmin.upsert({
    where: { login },
    update: { passwordHash },
    create: { login, passwordHash },
  });

  console.log(`Platforma egasi tayyor: ${admin.login}`);
  console.log("Kirish: /platform/login");

  await db.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});
