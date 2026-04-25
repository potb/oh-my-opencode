export type ConfigLoadError = {
  path: string
  error: string
}

let configLoadErrors: ConfigLoadError[] = []

function getConfigLoadErrors(): ConfigLoadError[] {
  return configLoadErrors
}

function clearConfigLoadErrors(): void {
  configLoadErrors = []
}

export function addConfigLoadError(error: ConfigLoadError): void {
  configLoadErrors.push(error)
}
