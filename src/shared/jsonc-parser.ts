import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { parse, ParseError, printParseErrorCode } from "jsonc-parser"

import { CONFIG_BASENAME } from "./plugin-identity"

function stripBom(content: string): string {
  return content.charCodeAt(0) === 0xfeff ? content.slice(1) : content
}

export function parseJsonc<T = unknown>(content: string): T {
  // Strip UTF-8 BOM if present (Windows UTF-8 with BOM files)
  content = content.replace(/^\uFEFF/, "")

  const errors: ParseError[] = []
  const result = parse(stripBom(content), errors, {
    allowTrailingComma: true,
    disallowComments: false,
  }) as T

  if (errors.length > 0) {
    const errorMessages = errors
      .map((e) => `${printParseErrorCode(e.error)} at offset ${e.offset}`)
      .join(", ")
    throw new SyntaxError(`JSONC parse error: ${errorMessages}`)
  }

  return result
}

export function detectConfigFile(basePath: string): {
  format: "jsonc" | "none"
  path: string
} {
  const jsoncPath = `${basePath}.jsonc`

  if (existsSync(jsoncPath)) {
    return { format: "jsonc", path: jsoncPath }
  }
  return { format: "none", path: jsoncPath }
}

export function detectPluginConfigFile(dir: string): {
  format: "jsonc" | "none"
  path: string
} {
  return detectConfigFile(join(dir, CONFIG_BASENAME))
}
