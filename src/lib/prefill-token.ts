import crypto from "crypto";

export type PrefillPayload = {
  appId: string;
  exp: number; // ms epoch
};

const SECRET = process.env.PREFILL_SECRET;

function b64urlEncode(input: string) {
  return Buffer.from(input, "utf8").toString("base64url");
}
function b64urlDecode(input: string) {
  return Buffer.from(input, "base64url").toString("utf8");
}

export function createPrefillToken(appId: string, ttlMinutes = 20) {
  if (!SECRET) throw new Error("Missing PREFILL_SECRET");

  const payload: PrefillPayload = {
    appId,
    exp: Date.now() + ttlMinutes * 60 * 1000,
  };

  const payloadB64 = b64urlEncode(JSON.stringify(payload));
  const sig = crypto.createHmac("sha256", SECRET).update(payloadB64).digest("base64url");

  return `${payloadB64}.${sig}`;
}

export function verifyPrefillToken(token: string): PrefillPayload | null {
  if (!SECRET) throw new Error("Missing PREFILL_SECRET");

  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payloadB64, sigB64] = parts;

  const expectedSig = crypto.createHmac("sha256", SECRET).update(payloadB64).digest("base64url");

  // constant-time compare
  try {
    if (!crypto.timingSafeEqual(Buffer.from(expectedSig), Buffer.from(sigB64))) return null;
  } catch {
    return null;
  }

  let payload: PrefillPayload;
  try {
    payload = JSON.parse(b64urlDecode(payloadB64));
  } catch {
    return null;
  }

  if (!payload?.appId || !payload?.exp) return null;
  if (Date.now() > payload.exp) return null;

  return payload;
}

