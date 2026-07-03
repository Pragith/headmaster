export function getClaimValue(subject: Record<string, any>, path: string) {
  return path.split('.').reduce<any>((value, key) => {
    if (value && typeof value === 'object' && key in value) {
      return value[key]
    }
    return undefined
  }, subject)
}
