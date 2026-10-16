/** Keep editorial punctuation consistent without changing saved product data. */
export function displayText(value: string | null | undefined): string {
  return (value ?? "").replaceAll("\u2014", ",");
}