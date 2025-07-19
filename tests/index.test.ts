import {
  describe,
  expect,
  it,
} from 'vitest'
import {
  generateGoogleAuthKey,
  generateGoogleAuthToken,
  generateTotpUri,
  verifyGoogleAuthToken,
} from '../src/index'

describe('Authenticator', () => {
  it('generateGoogleAuthKey should return a formatted base32 key', () => {
    const key = generateGoogleAuthKey()
    expect(key).toMatch(/^([a-z0-9]{4} ?)+$/)
    expect(key.replace(/\s/g, '').length).toBe(32)
  })

  it('generateGoogleAuthToken should generate a 6-digit token', () => {
    const key = generateGoogleAuthKey()
    const token = generateGoogleAuthToken(key)
    expect(token).toMatch(/^\d{6}$/)
  })

  it('verifyGoogleAuthToken should verify a valid token', () => {
    const key = generateGoogleAuthKey()
    const token = generateGoogleAuthToken(key)
    const result = verifyGoogleAuthToken(key, token)
    expect(result).not.toBeNull()
    expect(result?.delta).toBe(0)
  })

  it('verifyGoogleAuthToken should fail for invalid token', () => {
    const key = generateGoogleAuthKey()
    const invalidToken = '123456'
    const result = verifyGoogleAuthToken(key, invalidToken)
    expect(result).toBeNull()
  })

  it('generateTotpUri should generate a valid otpauth URI', () => {
    const secret = generateGoogleAuthKey()
    const uri = generateTotpUri(secret, 'user@example.com', 'MyApp')
    expect(uri).toMatch(/^otpauth:\/\/totp\//)
    expect(uri).toContain('secret=')
    expect(uri).toContain('issuer=MyApp')
    expect(uri).toContain('user%40example.com')
  })
})
