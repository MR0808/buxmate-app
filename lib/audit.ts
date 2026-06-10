type AuditMeta = Record<string, string | number | boolean | null | undefined>;

/**
 * Lightweight structured audit logging for security-sensitive actions.
 * Logs to stdout as JSON for log aggregation in production.
 */
export function auditLog(action: string, meta: AuditMeta = {}) {
  const entry = {
    type: "audit",
    action,
    at: new Date().toISOString(),
    ...meta,
  };

  console.log(JSON.stringify(entry));
}
