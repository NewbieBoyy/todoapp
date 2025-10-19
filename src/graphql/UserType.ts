import { ObjectType, Field, ID, InputType } from "type-graphql";

@ObjectType()
export class User {
  @Field(() => ID)
  id!: string;

  @Field()
  email!: string;

  // Don't expose password in GraphQL responses
  password!: string;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}

// Input type for registering
@InputType()
export class RegisterInput {
  @Field()
  email!: string;

  @Field()
  password!: string;

  @Field()
  confirmPassword!: string; // Only for validation, not stored in DB
}
