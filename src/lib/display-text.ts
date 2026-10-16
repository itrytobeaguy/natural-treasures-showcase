/** Keep editorial punctuation consistent without changing saved product data. */
export function displayText(value: string | null | undefined): string {
  return (value ?? "").replace(/\s*\u2014\s*/g, ", ");
}