/**
 * Default permission configuration for child sessions (sync delegation + background tasks).
 *
 * In ACP mode (e.g., Zed editor), child sessions created by the plugin are NOT
 * registered in OpenCode's ACPSessionManager. When a child session triggers a
 * tool permission (e.g., file write/edit), ACP's handler silently drops the
 * permission request because the session is unrecognized. The child session then
 * blocks forever waiting for a permission reply, causing the polling loop to hang.
 *
 * Fix: Auto-allow all tool permissions at session creation time. This means
 * permissions are resolved locally without going through ACP's permission handler,
 * preventing the deadlock entirely.
 *
 * SDK expects permission field as an object with tool keys (edit, bash, webfetch, etc.)
 * mapping to action strings ("allow", "deny", "ask"), NOT an array of rules.
 */

export const CHILD_SESSION_PERMISSIONS = {
  edit: "allow" as const,
  bash: "allow" as const,
  webfetch: "allow" as const,
  doom_loop: "allow" as const,
  external_directory: "allow" as const,
}
