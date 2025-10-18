import "reflect-metadata";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5"; // Updated import
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/HelloResolver";

async function startServer() {
  const app = express();

  // Security middlewares
  app.use(cors());
  app.use(helmet());
  app.use(express.json());
  app.use(rateLimit({ windowMs: 60 * 1000, max: 100 }));

  // Build GraphQL schema
  const schema = await buildSchema({
    resolvers: [HelloResolver],
    validate: false,
  });

  const server = new ApolloServer({ schema });
  await server.start();

  // Express integration
  app.use("/graphql", expressMiddleware(server));

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}/graphql`);
  });
}

startServer().catch(console.error);
