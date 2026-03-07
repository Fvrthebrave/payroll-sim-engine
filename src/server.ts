import app from './app';
import { verifyPostgresConnection } from './db/pool';

const PORT = process.env.PORT || 3000;

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

verifyPostgresConnection();

async function start() {
  try {
    await verifyPostgresConnection();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch(err) {
    console.error("Failed to connect to Postgres:", err);
    process.exit(1);
  }
}

start();