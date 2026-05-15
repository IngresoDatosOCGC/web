const requestLog = new Map<string, number[]>();

const CLEANUP_INTERVAL = 60_000;

setInterval(() => {
  const now = Date.now();
  for (const [key, timestamps] of requestLog.entries()) {
    const recent = timestamps.filter(t => now - t < 60_000);
    if (recent.length === 0) {
      requestLog.delete(key);
    } else {
      requestLog.set(key, recent);
    }
  }
}, CLEANUP_INTERVAL);

export function checkRateLimit(key: string, maxRequests: number): boolean {
  const now = Date.now();
  const timestamps = requestLog.get(key) || [];
  const recent = timestamps.filter(t => now - t < 60_000);

  if (recent.length >= maxRequests) {
    return false;
  }

  recent.push(now);
  requestLog.set(key, recent);
  return true;
}

export function getClientIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}
