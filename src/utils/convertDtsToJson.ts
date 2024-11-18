
export default function convertDtsToJson(inputCode: string) {
  try {
    // Remove the TypeScript-specific syntax
    const cleanedInput = inputCode
      .replace(/^declare\s+const\s+_default:\s*/, '') // Remove declare const _default:
      .replace(/;\s*export\s+default\s+_default;\s*$/, '') // Remove export default _default;
      .replace(/"([^"]+)":/g, '$1:') // Remove quotes from keys
      .replace(/({|,)\s*"(label)":/g, '$1 $2:') // Remove quotes specifically around "label" keys
      .replace(/:\s*"(.*?)"/g, ': $1'); // Remove quotes around string values

    return cleanedInput;
  } catch (error) {
    console.error('Error converting DTS to JSON:', error);
  }
}
