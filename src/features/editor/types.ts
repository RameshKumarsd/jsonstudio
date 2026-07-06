export type MarkerSeverity = 'error' | 'warning' | 'info'

/**
 * Framework-neutral editor marker. Features (validation) produce these from
 * character offsets; the editor controller maps them onto Monaco positions.
 */
export interface EditorMarker {
  startOffset: number
  endOffset: number
  message: string
  severity: MarkerSeverity
}
