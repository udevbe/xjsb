import { ChildProcessWithoutNullStreams } from 'child_process'
import { connect, XConnectionOptions } from '../src'
import { setupXvfb } from './setupXvfb'

describe('Connection', () => {

  const displayNum = '0'
  const display = `:${displayNum}`
  let testOptions: XConnectionOptions
  let xvfbProc: ChildProcessWithoutNullStreams

  beforeAll(async (done) => {
    const { xProc, xAuthority } = await setupXvfb(display)
    xvfbProc = xProc
    testOptions = { display, xAuthority }
    done()
  })

  afterAll(done => {
    xvfbProc.kill()
    done()
  })

  it('performs a setup handshake with the X server.', async done => {
    // Given

    // When
    const connection = await connect(testOptions)

    // Then
    expect.any(connection.setup.roots[0])
    expect.any(connection.setup.roots[0].root)
    expect.any(connection.setup.protocolMajorVersion)
    connection.close()
    done()
  })

  it('can receive a reply from a request.', async done => {
    // Given
    const connection = await connect(testOptions)

    // When
    const windowId = connection.allocateID()
    connection.createWindow(0, windowId, connection.setup.roots[0].root, 0, 0, 1, 1, 0, 0, 0, {})
    const queryTreeReply = await connection.queryTree(windowId)

    // Then
    expect(queryTreeReply.parent).toBe(connection.setup.roots[0].root)
    expect(queryTreeReply.root).toBe(connection.setup.roots[0].root)
    expect(queryTreeReply.childrenLen).toBe(0)
    expect(queryTreeReply.children.length).toBe(0)
    done()
  })
})
