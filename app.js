import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import "dotenv/config";
import streamRoute from "./routes/stream.route.js";

const app = express();
const domainsPath = path.resolve("config/allowed-domains.json");

function corsOptionsDelegate(req, callback) {
  const data = fs.readFileSync(domainsPath, "utf8");
  const allowedDomains = JSON.parse(data).domains;

  const origin = req.header("Origin");
  const corsOptions = allowedDomains.includes(origin)
    ? { origin: true }
    : { origin: false };

  callback(null, corsOptions);
}

app.use(cors(corsOptionsDelegate));
app.set("trust proxy", 1);

app.use("/api", streamRoute);

app.listen(3000, () => {
  console.log("🔐 Token server running on port 3000");
});
