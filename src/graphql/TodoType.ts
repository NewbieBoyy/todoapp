// src/graphql/TodoType.ts
import { ObjectType, Field, ID, InputType } from "type-graphql";

@ObjectType()
export class Todo {
  @Field(() => ID)
  id!: string;

  // Map 'title' from DB to 'note' in GraphQL
  @Field()
  note!: string;

  @Field()
  complete!: boolean; // Map 'done' from DB to 'complete'

  @Field()
  userId!: string;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}

// Input type to create a new Todo
@InputType()
export class CreateTodoInput {
  @Field()
  note!: string; // client sends 'note' instead of 'title'
}
