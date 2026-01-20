import express from "express";
import crypto from "crypto";

const router = express.Router();

// 🔑 خريطة المفاتيح
const STREAMS = {
  B1: "/B1/index.m3u8",
  B2: "/B2/index.m3u8",
  B3: "/B3/index.m3u8",
  B4: "/B4/index.m3u8",
  B5: "/B5/index.m3u8",
  B6: "/B6/index.m3u8",
};

function generateToken(streamPath, ip) {
  const exp = Math.floor(Date.now() / 1000) + 30;
  const payload = `${streamPath}${ip}${exp}`;

  const token = crypto
    .createHmac("sha256", process.env.FLUSSONIC_SECRET)
    .update(payload)
    .digest("hex");

  return { token, exp };
}

router.get("/stream-url", (req, res) => {
  const key = req.query.key; // B1, B2, ...
  const streamPath = STREAMS[key];

  if (!streamPath) {
    return res.status(400).json({ error: "Invalid key" });
  }

  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;

  const { token, exp } = generateToken(streamPath, ip);

  const url =
    `${process.env.STREAM_DOMAIN}${streamPath}` +
    `?token=${token}&exp=${exp}&ip=${ip}`;

  res.json({ url });
});

export default router;
