export function useHeadmasterConfig() {
  const runtime = useRuntimeConfig().headmaster

  return {
    ...runtime,
    appName: process.env.HEADMASTER_APP_NAME || runtime.appName,
    publicBaseUrl: process.env.HEADMASTER_PUBLIC_BASE_URL || runtime.publicBaseUrl,
    sessionSecret: process.env.HEADMASTER_SESSION_SECRET || runtime.sessionSecret,
    authEnabled: process.env.HEADMASTER_AUTH_ENABLED ? process.env.HEADMASTER_AUTH_ENABLED !== 'false' : runtime.authEnabled,
    authIssuer: process.env.HEADMASTER_AUTH_ISSUER || runtime.authIssuer,
    authClientId: process.env.HEADMASTER_AUTH_CLIENT_ID || runtime.authClientId,
    authClientSecret: process.env.HEADMASTER_AUTH_CLIENT_SECRET || runtime.authClientSecret,
    authRedirectUri: process.env.HEADMASTER_AUTH_REDIRECT_URI || runtime.authRedirectUri,
    authScope: process.env.HEADMASTER_AUTH_SCOPE || runtime.authScope,
    authAdminGroup: process.env.HEADMASTER_AUTH_ADMIN_GROUP || runtime.authAdminGroup,
    authGroupsClaim: process.env.HEADMASTER_AUTH_GROUPS_CLAIM || runtime.authGroupsClaim,
    authNameClaim: process.env.HEADMASTER_AUTH_NAME_CLAIM || runtime.authNameClaim,
    authEmailClaim: process.env.HEADMASTER_AUTH_EMAIL_CLAIM || runtime.authEmailClaim,
    execMode: process.env.HEADMASTER_HEADSCALE_EXEC_MODE || runtime.execMode,
    dockerBin: process.env.HEADMASTER_HEADSCALE_DOCKER_BIN || runtime.dockerBin,
    headscaleContainer: process.env.HEADMASTER_HEADSCALE_CONTAINER || runtime.headscaleContainer,
    headscaleBinary: process.env.HEADMASTER_HEADSCALE_BINARY || runtime.headscaleBinary,
    headscaleConfig: process.env.HEADMASTER_HEADSCALE_CONFIG || runtime.headscaleConfig,
    headscaleConfigFile: process.env.HEADMASTER_HEADSCALE_CONFIG_FILE || runtime.headscaleConfigFile,
    headscalePublicUrl: process.env.HEADMASTER_HEADSCALE_PUBLIC_URL || runtime.headscalePublicUrl,
    auditLogPath: process.env.HEADMASTER_AUDIT_LOG_PATH || runtime.auditLogPath,
    readOnly: process.env.HEADMASTER_READ_ONLY ? process.env.HEADMASTER_READ_ONLY === 'true' : runtime.readOnly,
  }
}
