type TransformHooks = Record<string, never>

export function createTransformHooks(args: {
  isHookEnabled: (hookName: string) => boolean
  safeHookEnabled?: boolean
}): TransformHooks {
  void args
  return {}
}
