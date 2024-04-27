const serverless = require("serverless-http");
const express = require("express");
const { neon, neonConfig } = require("@neondatabase/serverless");
const app = express();

const dbClient = async () => {
    // For http connections
    // non-pooling
    neonConfig.fetchConnectionCache;
    const sql = await neon(process.env.DATABASE_URL);
    return sql;
};

app.get("/", async (req, res, next) => {
    const sql = await dbClient();
    const [results] = await sql`SELECT NOW()`;

    return res.status(200).json({
        message: "Hello from root!",
        results: results.now,
    });
});

app.get("/path", (req, res, next) => {
    return res.status(200).json({
        message: "Hello from path!",
    });
});

app.use((req, res, next) => {
    return res.status(404).json({
        error: "Not Found",
    });
});

module.exports.handler = serverless(app);
