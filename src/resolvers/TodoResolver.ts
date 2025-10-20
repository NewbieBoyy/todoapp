// src/resolvers/TodoResolver.ts
import { Resolver, Mutation, Arg, Query, Ctx } from "type-graphql";
import { prisma } from "../prismaClient";
import { Todo, CreateTodoInput } from "../graphql/TodoType";
import { AuthRequest } from "../middleware/auth";
import { UserInputError } from "apollo-server-errors";

@Resolver()
export class TodoResolver {
  @Mutation(() => String)
async createTodo(
  @Arg("data") data: CreateTodoInput,
  @Ctx() ctx: AuthRequest
): Promise<string> {
  if (!ctx.userId) throw new UserInputError("Not authenticated!");

  await prisma.todo.create({
    data: {
      title: data.note,
      userId: ctx.userId,
    },
  });

  return "Todo created successfully!";
}


@Query(() => [Todo])
async myTodos(@Ctx() ctx: AuthRequest): Promise<Todo[]> {
  if (!ctx.userId) throw new UserInputError("Not authenticated!");

  const todos = await prisma.todo.findMany({
    where: { userId: ctx.userId },
    orderBy: { createdAt: "desc" },
  });

  return todos.map((todo: { id: string; title: string; done: boolean; userId: string; createdAt: Date; updatedAt: Date }) => ({
    id: todo.id,
    note: todo.title,
    complete: todo.done,
    userId: todo.userId,
    createdAt: todo.createdAt,
    updatedAt: todo.updatedAt,
  }));
}
@Mutation(() => String) 
async deleteTodo(
  @Arg("id") id: string,
  @Ctx() ctx: AuthRequest
): Promise<string> {
  // 1️⃣ Check authentication
  if (!ctx.userId) throw new UserInputError("Not authenticated!");

  // 2️⃣ Find the todo by ID
  const todo = await prisma.todo.findUnique({
    where: { id },
  });

  // 3️⃣ If not found, throw
  if (!todo) throw new UserInputError("Todo not found!");

  // 4️⃣ Check if this user owns the todo
  if (todo.userId !== ctx.userId)
    throw new UserInputError("You are not authorized to delete this todo!");

  // 5️⃣ Delete it
  await prisma.todo.delete({
    where: { id },
  });

  // 6️⃣ Return a success message
  return "Todo deleted successfully!";
}

@Mutation(() => String)
async toggleTodo(
  @Arg("id") id: string,
  @Ctx() ctx: AuthRequest
): Promise<string> {
  if (!ctx.userId) throw new UserInputError("Not authenticated!");

  const todo = await prisma.todo.findUnique({
    where: { id },
  });

  if (!todo) throw new UserInputError("Todo not found!");
  if (todo.userId !== ctx.userId)
    throw new UserInputError("You are not authorized to modify this todo!");

  // Toggle the 'done' field
  const updated = await prisma.todo.update({
    where: { id },
    data: { done: !todo.done },
  });

  return `Todo marked as ${updated.done ? "complete" : "incomplete"}!`;
}

}


