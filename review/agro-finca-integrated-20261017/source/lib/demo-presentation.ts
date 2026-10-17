/** Limit only fictional samples after normal filtering. Real and founder rows always remain. */
export function visibleDemoRows<T extends {demo?: boolean}>(rows: readonly T[], expanded = false): T[] {
  if (expanded) return [...rows];
  let sampleShown = false;
  return rows.filter(row => {
    if (!row.demo) return true;
    if (sampleShown) return false;
    sampleShown = true;
    return true;
  });
}
