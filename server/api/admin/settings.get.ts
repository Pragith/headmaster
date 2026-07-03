import { getHeadscaleHealth, getHeadscaleVersion, runConfigTest } from '../../utils/headscale'

export default defineEventHandler(async () => {
  const config = useHeadmasterConfig()
  const [health, version, configtest] = await Promise.all([
    getHeadscaleHealth(),
    getHeadscaleVersion(),
    runConfigTest(),
  ])

  return {
    items: [
      { key: 'HEADMASTER_APP_NAME', value: config.appName },
      { key: 'HEADMASTER_PUBLIC_BASE_URL', value: config.publicBaseUrl },
      { key: 'HEADMASTER_AUTH_ENABLED', value: String(config.authEnabled) },
      { key: 'HEADMASTER_HEADSCALE_EXEC_MODE', value: config.execMode },
      { key: 'HEADMASTER_HEADSCALE_CONTAINER', value: config.headscaleContainer },
      { key: 'HEADMASTER_HEADSCALE_PUBLIC_URL', value: config.headscalePublicUrl || '' },
      { key: 'HEADMASTER_AUTH_ISSUER', value: config.authIssuer || '' },
      { key: 'HEADMASTER_AUTH_ADMIN_GROUP', value: config.authAdminGroup || '' },
      { key: 'HEADMASTER_READ_ONLY', value: String(config.readOnly) },
    ],
    headscale: {
      health,
      version,
      configtest,
    },
  }
})
