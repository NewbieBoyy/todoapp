import { Resolver, Mutation, Arg } from "type-graphql";
import { prisma } from "../prismaClient";
import { RegisterInput } from "../graphql/UserType";
import bcrypt from "bcrypt";
import { UserInputError } from "apollo-server-errors";

@Resolver() 
export class UserResolver {
  @Mutation(() => String)
  async register(
    @Arg("data") data: RegisterInput 
  ): Promise<string> {
    const { email, password, confirmPassword } = data;

    // 1️⃣ Check for required fields
    if (!email || !password || !confirmPassword) {
      throw new UserInputError("All fields are required!");
    }

    // 2️⃣ Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new UserInputError("Invalid email format!");
    }

    // 3️⃣ Check password strength
    if (password.length < 8) {
      throw new UserInputError("Password must be at least 8 characters long!");
    }
    // Optional: Add more complexity checks if needed (numbers, symbols, uppercase)

    // 4️⃣ Passwords match
    if (password !== confirmPassword) {
      throw new UserInputError("Passwords do not match!");
    }

    // 5️⃣ Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new UserInputError("Email is already in use!");
    }

    // 6️⃣ Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 7️⃣ Create the user
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      }, 
    });

    // 8️⃣ Return success message
    return "User registered successfully!";
  }
}
