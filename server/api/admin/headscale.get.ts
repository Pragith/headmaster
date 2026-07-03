import { getHeadscaleHealth, getHeadscaleVersion, runConfigTest } from '../../utils/headscale'

export default defineEventHandler(async () => {
  const [health, version, configtest] = await Promise.all([
    getHeadscaleHealth(),
    getHeadscaleVersion(),
    runConfigTest(),
  ])

  return {
    health,
    version,
    configtest,
  }
})
