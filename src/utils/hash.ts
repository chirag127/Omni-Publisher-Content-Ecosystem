import crypto from "crypto";

export function calculateHash(content: string): string {
  return crypto.createHash("md5").update(content).digest("hex");
}
