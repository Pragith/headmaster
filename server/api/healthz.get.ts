export default defineEventHandler(async () => {
  return {
    ok: true,
    app: useHeadmasterConfig().appName,
  }
})
