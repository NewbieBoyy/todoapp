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
}
