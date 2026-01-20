import express from "express";
import crypto from "crypto";

const router = express.Router();

/* ===============================
   0️⃣ STREAM KEYS MAP
================================ */
const STREAMS = {
  B1: "/B1/index.m3u8",
  B2: "/B2/index.m3u8",
  B3: "/B3/index.m3u8",
  B4: "/B4/index.m3u8",
  B5: "/B5/index.m3u8",
  B6: "/B6/index.m3u8",
};

/* ===============================
   1️⃣ USER-AGENT WHITELIST
================================ */
function isBrowserUA(ua = "") {
  return /(Chrome|Firefox|Safari|Edg)/i.test(ua);
}

/* ===============================
   2️⃣ USER-AGENT BLACKLIST
================================ */
function isBlockedUA(ua = "") {
  return /(VLC|FFmpeg|Lavf|IPTV|Kodi|ExoPlayer|PlayerCoreFactory)/i.test(ua);
}

/* ===============================
   TOKEN GENERATION
================================ */
function generateToken(streamPath, ip) {
  const exp = Math.floor(Date.now() / 1000) + 30;
  const payload = `${streamPath}${ip}${exp}`;

  const token = crypto
    .createHmac("sha256", process.env.FLUSSONIC_SECRET)
    .update(payload)
    .digest("hex");

  return { token, exp };
}

/* ===============================
   MAIN ENDPOINT
================================ */
router.get("/stream-url", (req, res) => {
  const ua = req.headers["user-agent"] || "";
  const origin = req.headers.origin || "";

  /* 1️⃣ Browser only */
  if (!isBrowserUA(ua)) {
    return res.status(403).json({ error: "Non-browser client blocked" });
  }

  /* 2️⃣ Block known players */
  if (isBlockedUA(ua)) {
    return res.status(403).json({ error: "Player not allowed" });
  }

  /* Stream key */
  const key = req.query.key;
  const streamPath = STREAMS[key];

  if (!streamPath) {
    return res.status(400).json({ error: "Invalid key" });
  }

  /* Client IP */
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;

  /* Token */
  const { token, exp } = generateToken(streamPath, ip);

  const url =
    `${process.env.STREAM_DOMAIN}${streamPath}` +
    `?token=${token}&exp=${exp}&ip=${ip}`;

  res.json({ url });
});

export default router;
