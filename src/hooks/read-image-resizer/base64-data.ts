export function extractBase64Data(imageData: string): string {
  if (imageData.startsWith("data:")) {
    const commaIndex = imageData.indexOf(",")
    if (commaIndex !== -1) {
      return imageData.slice(commaIndex + 1)
    }
  }

  return imageData
}
