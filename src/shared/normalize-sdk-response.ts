export function normalizeSDKResponse<TData>(
  response: unknown,
): TData {
  if (response == null) {
    throw new Error("SDK response was nullish")
  }

  if (typeof response === "object" && "data" in response) {
    const data = (response as { data?: unknown }).data
    if (data != null) {
      return data as TData
    }

    throw new Error("SDK response.data was missing")
  }

  throw new Error("SDK response must use { data: ... } envelope")
}
