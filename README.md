# @jvddavid/authenticator

Biblioteca para geração e verificação de códigos TOTP (Google Authenticator, Microsoft Authenticator, etc.) em Node.js.

## Instalação

```sh
pnpm add @jvddavid/authenticator
```

## Uso Básico

```typescript
import {
  generateGoogleAuthKey,
  generateGoogleAuthToken,
  verifyGoogleAuthToken,
  generateTotpUri,
} from '@jvddavid/authenticator'

// Gerar uma chave secreta formatada para Google Authenticator
const secret = generateGoogleAuthKey()
console.log('Chave:', secret)

// Gerar um token TOTP (válido por 30 segundos)
const token = generateGoogleAuthToken(secret)
console.log('Token:', token)

// Verificar se o token é válido
const result = verifyGoogleAuthToken(secret, token)
if (result) {
  console.log('Token válido!')
} else {
  console.log('Token inválido!')
}

// Gerar URI para cadastro em apps autenticadores
const uri = generateTotpUri(secret, 'usuario@exemplo.com', 'MinhaApp')
console.log('URI:', uri)
```

## API

### `generateGoogleAuthKey()`
Gera uma chave secreta base32 formatada para uso em apps autenticadores.

### `generateGoogleAuthToken(secret: string): string`
Gera um token TOTP de 6 dígitos usando a chave informada.

### `verifyGoogleAuthToken(secret: string, token: string): VerifyResult | null`
Verifica se o token informado é válido para a chave. Retorna um objeto com informações ou `null` se inválido.

### `generateTotpUri(secret: string, accountName?: string, issuer?: string, algo?: string, digits?: number, period?: number): string`
Gera uma URI no padrão otpauth para cadastro em apps autenticadores.

## Testes

Execute os testes com:
```sh
pnpm test
```

## Licença
MIT
