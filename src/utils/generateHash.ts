function generateHash(value: string, prefix = '') {
  const encoder = new TextEncoder()
  const encodedValue = encoder.encode(value)
  const hash = encodedValue.reduce((acc, byte) => acc * 31 + byte)
  const hashHex = hash.toString(16)
  return `${prefix}${hashHex.substring(0, 16)}`
}

export default generateHash
