import { getHeadscaleHealth, listNodes, listPreauthKeys, listRoutes, listUsers } from '../../utils/headscale'
import { readAuditEntries } from '../../utils/audit'

export default defineEventHandler(async () => {
  const [health, users, nodes, keys, routes, audit] = await Promise.all([
    getHeadscaleHealth(),
    listUsers(),
    listNodes(),
    listPreauthKeys(),
    listRoutes(),
    readAuditEntries(8),
  ])

  return {
    health,
    totals: {
      users: users?.length || 0,
      nodes: nodes?.length || 0,
      onlineNodes: (nodes || []).filter((node) => Boolean(node.online)).length,
      preauthKeys: keys?.length || 0,
      routes: routes?.length || 0,
    },
    recentNodes: nodes || [],
    audit,
  }
})
