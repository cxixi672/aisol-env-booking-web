import assert from 'node:assert/strict'
import { once } from 'node:events'
import { createServer } from 'node:http'
import { test } from 'node:test'
import { createServer as createViteServer } from 'vite'

test('cancel APIs send an exact JSON int64 field over HTTP', async t => {
  const requests = []
  const server = createServer(async (request, response) => {
    const chunks = []
    for await (const chunk of request) chunks.push(chunk)
    requests.push({
      method: request.method,
      url: request.url,
      contentType: request.headers['content-type'],
      body: Buffer.concat(chunks),
    })
    response.writeHead(200, { 'Content-Type': 'application/json' })
    response.end('{"code":"000000","data":null}')
  })
  server.listen(0, '127.0.0.1')
  t.after(() => new Promise(resolve => server.close(resolve)))
  await once(server, 'listening')

  process.env.VITE_API_PREFIX = `http://127.0.0.1:${server.address().port}/api`
  const vite = await createViteServer({ server: { middlewareMode: true, ws: false } })
  t.after(() => vite.close())
  const { cancelBooking } = await vite.ssrLoadModule('/src/api/bookings/index.js')
  const { cancelMaintenance } = await vite.ssrLoadModule('/src/api/maintenance/index.js')

  for (const [module, cancel] of [['bookings', cancelBooking], ['maintenance', cancelMaintenance]]) {
    for (const id of [34, '34', '9007199254740993', '9223372036854775807']) {
      await t.test(`${module}: ${typeof id} ${id}`, async () => {
        await cancel(id, 'admin')
        const request = requests.pop()
        assert.equal(request.method, 'POST')
        assert.equal(request.url, `/api/${module}/cancel`)
        assert.equal(request.contentType, 'application/json')
        assert.equal(request.body.toString('utf8'), `{"id":${id}}`)
      })
    }
    await t.test(`${module}: rejects invalid IDs before sending`, () => {
      for (const id of [0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1, '34e1', '9223372036854775808']) {
        assert.throws(() => cancel(id, 'admin'), /记录编号无效/)
      }
      assert.deepEqual(requests, [])
    })
  }
})
