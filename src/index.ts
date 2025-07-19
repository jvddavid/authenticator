import crypto from 'crypto'
import notp, { VerifyResult } from 'notp'

const b32 = {
  encode: (bin: string | Buffer) => {
    // Base32 encoding implementation
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
    let bits = ''
    let result = ''

    let bytes: number[]
    if (typeof bin === 'string') {
      bytes = Array.from(Buffer.from(bin, 'utf8'))
    }
    else {
      bytes = Array.from(bin)
    }

    for (const byte of bytes) {
      bits += byte.toString(2).padStart(8, '0')
    }

    while (bits.length >= 5) {
      const chunk = bits.slice(0, 5)
      bits = bits.slice(5)
      const index = parseInt(chunk, 2)
      result += alphabet[index]
    }

    if (bits.length > 0) {
      result += alphabet[parseInt(bits.padEnd(5, '0'), 2)]
    }

    return Buffer.from(result, 'utf8')
  },
  decode: (base32: string | Buffer) => {
    // Base32 decoding implementation
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
    let bits = ''
    let result = ''

    let chars: string[]
    if (typeof base32 === 'string') {
      chars = base32.split('')
    }
    else {
      chars = Array.from(base32.toString('utf8'))
    }

    for (const charRaw of chars) {
      const char = charRaw.toUpperCase()
      const index = alphabet.indexOf(char)
      if (index === -1) continue // Skip invalid characters
      bits += index.toString(2).padStart(5, '0')
    }

    while (bits.length >= 8) {
      const byte = bits.slice(0, 8)
      bits = bits.slice(8)
      result += String.fromCharCode(parseInt(byte, 2))
    }

    return result
  },
}

// Generate a key
function generateOtpKey() {
  // 20 cryptographically random binary bytes (160-bit key)
  const key = crypto.randomBytes(20)
  return key
}

// Text-encode the key as base32 (in the style of Google Authenticator - same as Facebook, Microsoft, etc)
function encodeGoogleAuthKey(bin: string | Buffer) {
  // 32 ascii characters without trailing '='s
  const base32 = b32.encode(bin).toString('utf8').replace(/=/g, '')

  // lowercase with a space every 4 characters
  const key = base32.toLowerCase().replace(/(\w{4})/g, '$1 ').trim()

  return key
}

function generateGoogleAuthKey() {
  return encodeGoogleAuthKey(generateOtpKey())
}

// Binary-decode the key from base32 (Google Authenticator, FB, M$, etc)
function decodeGoogleAuthKey(key: string): string {
  // decode base32 google auth key to binary
  const unformatted = key.replace(/\W+/g, '').toUpperCase()
  const bin = b32.decode(unformatted)
  return bin
}

// Generate a Google Auth Token
function generateGoogleAuthToken(key: string): string {
  const bin = decodeGoogleAuthKey(key)

  return notp.totp.gen(bin)
}

// Verify a Google Auth Token
function verifyGoogleAuthToken(key: string, token: string): VerifyResult | null {
  const bin = decodeGoogleAuthKey(key)

  token = token.replace(/\W+/g, '')

  // window is +/- 1 period of 30 seconds
  return notp.totp.verify(token, bin, { window: 1, time: 30 })
}

function generateTotpUri(secret: string, accountName = '', issuer = '', algo = 'SHA1', digits = 6, period = 30): string {
  // Full OTPAUTH URI spec as explained at
  // https://github.com/google/google-authenticator/wiki/Key-Uri-Format
  const name = encodeURIComponent(accountName)
  const issuerEncoded = encodeURIComponent(issuer)
  const secretEncoded = secret.replace(/[\s._-]+/g, '').toUpperCase()
  return `otpauth://totp/${
    issuerEncoded
  }:${
    name
  }?secret=${
    secretEncoded
  }&issuer=${
    issuerEncoded
  }&algorithm=${
    algo
  }&digits=${
    digits
  }&period=${
    period
  }`
}

export {
  generateGoogleAuthKey,
  generateGoogleAuthToken,
  generateTotpUri,
  verifyGoogleAuthToken,
}
