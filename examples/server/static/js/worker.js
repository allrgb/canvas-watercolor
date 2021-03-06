'use strict'

this.importScripts(/* '{{url}}' */)

const { OffscreenCanvas, Watercolor, close, performance, postMessage } = this

/* polyfill for `toBlob()` from Chrome-specific non-standard `convertToBlob()` */
Object.defineProperty(OffscreenCanvas.prototype, 'toBlob', {
  configurable: true,
  value: OffscreenCanvas.prototype.toBlob || OffscreenCanvas.prototype.convertToBlob,
  writable: true
})

this.addEventListener('message', async function (event) {
  const canvas = event.data.canvas
  const context = canvas.getContext('2d')
  const config = Object.assign(/* {{config}}, */{ context })

  function * generator (now, interval = 30, last = now()) {
    while (true) {
      while (now() - last < interval) {
        yield false
      }

      yield true
      last = now()
    }
  }

  const iterator = generator(performance.now.bind(performance), config.interval)
  const shouldCommit = function shouldCommit () {
    return this().value
  }.bind(iterator.next.bind(iterator))

  const watercolor = new Watercolor(config)

  await watercolor.process(shouldCommit)

  postMessage(await canvas.toBlob())

  close()
})
