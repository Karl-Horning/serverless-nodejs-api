const serverless = require("serverless-http");
const express = require("express");
const AWS = require("aws-sdk");
const { neon, neonConfig } = require("@neondatabase/serverless");

const AWS_REGION = "eu-central-1";
const STAGE = process.env.STAGE || "prod";

const app = express();
const ssm = new AWS.SSM({ region: AWS_REGION });

DATABASE_URL_SSM_PARAM = `/serverless-nodejs-api/${STAGE}/database-url`;

const dbClient = async () => {
    // For http connections
    // non-pooling
    const paramStoreData = await ssm
        .getParameter({
            Name: DATABASE_URL_SSM_PARAM,
            WithDecryption: true,
        })
        .promise();
    neonConfig.fetchConnectionCache;
    const sql = await neon(paramStoreData.Parameter.Value);
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
