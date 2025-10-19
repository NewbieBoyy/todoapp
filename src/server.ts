import "reflect-metadata";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { buildSchema } from "type-graphql";

import { HelloResolver } from "./resolvers/HelloResolver";
import { UserResolver } from "./resolvers/UserResolver"; // ✅ Add UserResolver

async function startServer() {
  const app = express();

  // Security middlewares
  app.use(cors());
  app.use(helmet());
  app.use(express.json());
  app.use(rateLimit({ windowMs: 60 * 1000, max: 100 }));

  // Build GraphQL schema with all resolvers
  const schema = await buildSchema({
    resolvers: [
      HelloResolver,
      UserResolver, // ✅ Include here so mutations like register are recognized
    ],
    validate: false,
  });
   
const server = new ApolloServer({
  schema,
  formatError: (err) => {
    // Only return the message for client errors
    return { message: err.message };
  },
});

  await server.start();

  // Express integration
  app.use("/graphql", expressMiddleware(server));

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}/graphql`);
  });
}

startServer().catch(console.error);
