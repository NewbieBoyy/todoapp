import "reflect-metadata";
import { prisma } from "../src/prismaClient";

async function main() {
  const u = await prisma.user.create({
    data: { email: "test@example.com", password: "dummy", name: "Tester" },
  });
  const t = await prisma.todo.create({
    data: { title: "Seed todo", userId: u.id },
  });
  console.log({ u, t });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
