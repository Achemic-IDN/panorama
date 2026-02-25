const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

// now our staff record can contain an array of roles (AdminRole[])
async function upsertStaff({ name, username, password, roles }) {
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.staff.upsert({
    where: { username },
    create: {
      name,
      username,
      passwordHash,
      roles,
    },
    update: {
      name,
      passwordHash,
      roles,
    },
  });
}

async function main() {
  // create a super‑admin with all roles (UTAMA) plus entry for demonstrations
  await upsertStaff({
    name: "Administrator Utama",
    username: "admin",
    password: "admin123",
    roles: ["UTAMA"],
  });

  // separate accounts for each station
  await upsertStaff({
    name: "Staff Entry",
    username: "entry",
    password: "entry123",
    roles: ["ENTRY"],
  });

  await upsertStaff({
    name: "Staff Transport",
    username: "transport",
    password: "transport123",
    roles: ["TRANSPORT"],
  });

  await upsertStaff({
    name: "Staff Packaging",
    username: "packaging",
    password: "pack123",
    roles: ["PACKAGING"],
  });

  await upsertStaff({
    name: "Staff Penyerahan",
    username: "penyerahan",
    password: "pen123",
    roles: ["PENYERAHAN"],
  });

  // (the previous multi‑role demo account has been removed to avoid confusion)
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

