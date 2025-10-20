import { Resolver, Mutation, Arg } from "type-graphql";
import { prisma } from "../prismaClient";
import { RegisterInput, LoginInput } from "../graphql/UserType";
import bcrypt from "bcrypt";
import { UserInputError } from "apollo-server-errors";
import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;

@Resolver()
export class UserResolver {

   // Register mutation (already implemented)
  @Mutation(() => String)
  async register(@Arg("data") data: RegisterInput): Promise<string> {
    const { email, password, confirmPassword } = data;

    if (password !== confirmPassword) {
      throw new UserInputError("Passwords do not match!");
    }

    if (!email || !password || !confirmPassword) {
      throw new UserInputError("All fields are required!");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new UserInputError("Invalid email format!");
    }

    if (password.length < 8) {
      throw new UserInputError("Password must be at least 8 characters long!");
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new UserInputError("Email is already in use!");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });   

    return "User registered successfully!";
  }

  // Login mutation (new)
  @Mutation(() => String)
  async login(@Arg("data") data: LoginInput): Promise<string> {
    const { email, password } = data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UserInputError("Invalid credentials!");
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new UserInputError("Invalid credentials!");
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, ACCESS_TOKEN_SECRET, { expiresIn: "1h" });

    return token;
  }
}
