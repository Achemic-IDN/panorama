const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function upsertStaff({ name, username, password, role }) {
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.staff.upsert({
    where: { username },
    create: {
      name,
      username,
      passwordHash,
      role,
    },
    update: {
      name,
      passwordHash,
      role,
    },
  });
}

async function main() {
  await upsertStaff({
    name: "Administrator",
    username: "admin",
    password: "admin123",
    role: "ADMIN",
  });

  await upsertStaff({
    name: "Entry Staff",
    username: "entry",
    password: "entry123",
    role: "ENTRY",
  });

  await upsertStaff({
    name: "Transport Staff",
    username: "transport",
    password: "transport123",
    role: "TRANSPORT",
  });

  await upsertStaff({
    name: "Packaging Staff",
    username: "packaging",
    password: "pack123",
    role: "PACKAGING",
  });

  await upsertStaff({
    name: "Pickup Staff",
    username: "pickup",
    password: "pick123",
    role: "PICKUP",
  });
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

