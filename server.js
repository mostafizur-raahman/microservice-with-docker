const express = require("express");
const redis = require("redis");

const port = 8000;
const app = express();

const client = redis.createClient({
    url: "redis://redis:6379",
    socket: {
        reconnectStrategy: (retries) => {
            console.log(`Redis reconnect attempt #${retries}`);
            return Math.min(retries * 100, 3000); // Max 3s delay
        },
    },
});

client.on("error", (err) => {
    console.error("❌ Redis error:", err.message);
});

app.get("/", async (req, res) => {
    try {
        const count = await client.incr("hits");
        res.send(`Hello World! This page has been visited ${count} times.\n`);
    } catch (err) {
        res.status(500).send(`Error: ${err.message}`);
    }
});

app.get("/health", async (req, res) => {
    try {
        await client.ping();
        res.json({ status: "ok", redis: "connected" });
    } catch (err) {
        res.status(503).json({ status: "error", redis: err.message });
    }
});

async function startServer() {
    try {
        await client.connect();
        console.log("✅ Redis connected");

        app.listen(port, "0.0.0.0", () => {
            console.log(`🚀 Server on port ${port}`);
        });
    } catch (err) {
        console.error("❌ Startup failed:", err.message);
        process.exit(1);
    }
}

startServer();
