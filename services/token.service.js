import crypto from "crypto";

export function generateFlussonicToken({
  secret,
  streamPath,
  clientIp,
  ttlSeconds = 30,
}) {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = `${streamPath}${clientIp}${exp}`;

  const hash = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return { token: hash, exp, ip: clientIp };
}
