import { app } from "./app";
import { connectDatabase } from "./config/db";
import { env } from "./config/env";

async function startServer() {
  await connectDatabase();

  app.listen(env.port, () => {
    console.log(`API server listening on port ${env.port}`);
  });
}

startServer().catch((error) => {
  console.error("Server startup failed", error);
  process.exit(1);
});
