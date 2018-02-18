import KloudlessSDK from '../../lib/kloudless'

let kloudless = new KloudlessSDK(process.env.API_KEY || 'your-api-key-here')

if (process.env.API_HOST)
  kloudless.setHost(process.env.API_HOST, process.env.API_PORT || 443)
if (process.env.API_CA != null)
  kloudless.setCA(process.env.API_CA)

test('account base test...', () => {
  expect(true).toBe(true)
})