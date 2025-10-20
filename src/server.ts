import "reflect-metadata";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { buildSchema } from "type-graphql";
import dotenv from "dotenv";
import { json } from "body-parser";

import { authMiddleware, AuthRequest } from "./middleware/auth";
import { HelloResolver } from "./resolvers/HelloResolver";
import { UserResolver } from "./resolvers/UserResolver";
import { TodoResolver } from "./resolvers/TodoResolver";

dotenv.config();

async function startServer() {
  const app = express();

  // Security middlewares
  app.use(cors());
  app.use(helmet());
  app.use(express.json());
  app.use(rateLimit({ windowMs: 60 * 1000, max: 100 }));

  // Add auth middleware to populate req.userId
  app.use(authMiddleware);

  // Build GraphQL schema
  const schema = await buildSchema({
    resolvers: [HelloResolver, UserResolver, TodoResolver],
    validate: false,
  });

  const server = new ApolloServer({
    schema,
    formatError: (err) => ({ message: err.message }), // Only return message
  });

  await server.start();

  // Use express middleware with context function
  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req }: { req: AuthRequest }) => ({ userId: req.userId }), 

    })
  );

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}/graphql`);
  });
}

startServer().catch(console.error);
