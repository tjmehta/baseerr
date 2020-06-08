import BaseError from '../index'
import regExpEscape from 'escape-string-regexp'

describe('BaseError', () => {
  it('should create an error', () => {
    const err = new BaseError('message')
    // @ts-ignore
    // err.cachedStack = cleanStack(err.cachedStack)
    expect(err).toBeInstanceOf(Error)
    expect(err).toBeInstanceOf(BaseError)
    expect(cleanStack(err.stack).trimRight()).toMatchInlineSnapshot(`
      "BaseError: message
          at Object.<anonymous> (/src/__tests__/index.test.ts:6:17)
          at Object.asyncJestTest (/node_modules/jest-jasmine2/build/jasmineAsyncInstall.js:100:37)
          at /node_modules/jest-jasmine2/build/queueRunner.js:47:12
          at new Promise (<anonymous>)
          at mapper (/node_modules/jest-jasmine2/build/queueRunner.js:30:19)
          at /node_modules/jest-jasmine2/build/queueRunner.js:77:41"
    `)
  })

  it('should create an error w/ data', () => {
    const err = new BaseError('message', { foo: 10 })
    expect(err).toBeInstanceOf(Error)
    expect(err).toBeInstanceOf(BaseError)
    expect(cleanStack(err.stack)).toMatchInlineSnapshot(`
      "BaseError: message
          at Object.<anonymous> (/src/__tests__/index.test.ts:23:17)
          at Object.asyncJestTest (/node_modules/jest-jasmine2/build/jasmineAsyncInstall.js:100:37)
          at /node_modules/jest-jasmine2/build/queueRunner.js:47:12
          at new Promise (<anonymous>)
          at mapper (/node_modules/jest-jasmine2/build/queueRunner.js:30:19)
          at /node_modules/jest-jasmine2/build/queueRunner.js:77:41
      {
        \\"foo\\": 10
      }
      "
    `)
  })

  describe('assert', () => {
    it('should assert condition as false and throw', async () => {
      expect(() =>
        BaseError.assert(false, 'boom'),
      ).toThrowErrorMatchingInlineSnapshot(`"boom"`)
      try {
        BaseError.assert(false, 'boom')
      } catch (err) {
        expect(cleanStack(err.stack)).toMatchInlineSnapshot(`
          "BaseError: boom
              at Object.<anonymous> (/src/__tests__/index.test.ts:47:19)
              at Object.asyncJestTest (/node_modules/jest-jasmine2/build/jasmineAsyncInstall.js:100:37)
              at /node_modules/jest-jasmine2/build/queueRunner.js:47:12
              at new Promise (<anonymous>)
              at mapper (/node_modules/jest-jasmine2/build/queueRunner.js:30:19)
              at /node_modules/jest-jasmine2/build/queueRunner.js:77:41
          {
            \\"condition\\": false
          }
          "
        `)
      }
    })
  })

  describe('wrap', () => {
    it('should wrap error', async () => {
      const err = BaseError.wrap(new Error('baboom'), 'boom', { foo: 10 })
      expect(cleanStack(err.stack)).toMatchInlineSnapshot(`
        "BaseError: boom
            at Function.wrap (/src/index.ts:45:12)
            at Object.<anonymous> (/src/__tests__/index.test.ts:68:29)
            at Object.asyncJestTest (/node_modules/jest-jasmine2/build/jasmineAsyncInstall.js:100:37)
            at /node_modules/jest-jasmine2/build/queueRunner.js:47:12
            at new Promise (<anonymous>)
            at mapper (/node_modules/jest-jasmine2/build/queueRunner.js:30:19)
            at /node_modules/jest-jasmine2/build/queueRunner.js:77:41
        {
          \\"foo\\": 10
        }
        ----
        Error: baboom
            at Object.<anonymous> (/src/__tests__/index.test.ts:68:34)
            at Object.asyncJestTest (/node_modules/jest-jasmine2/build/jasmineAsyncInstall.js:100:37)
            at /node_modules/jest-jasmine2/build/queueRunner.js:47:12
            at new Promise (<anonymous>)
            at mapper (/node_modules/jest-jasmine2/build/queueRunner.js:30:19)
            at /node_modules/jest-jasmine2/build/queueRunner.js:77:41
        "
      `)
    })
  })

  describe('wrapAndThrow', () => {
    it('should wrapAndThrow error', async () => {
      expect(() =>
        BaseError.wrapAndThrow(new Error('baboom'), 'boom', { foo: 10 }),
      ).toThrowErrorMatchingInlineSnapshot(`"boom"`)
      try {
        BaseError.wrapAndThrow(new Error('baboom'), 'boom', { foo: 10 })
      } catch (err) {
        expect(cleanStack(err.stack)).toMatchInlineSnapshot(`
          "BaseError: boom
              at Function.wrap (/src/index.ts:45:12)
              at Function.wrapAndThrow (/src/index.ts:53:16)
              at Object.<anonymous> (/src/__tests__/index.test.ts:100:19)
              at Object.asyncJestTest (/node_modules/jest-jasmine2/build/jasmineAsyncInstall.js:100:37)
              at /node_modules/jest-jasmine2/build/queueRunner.js:47:12
              at new Promise (<anonymous>)
              at mapper (/node_modules/jest-jasmine2/build/queueRunner.js:30:19)
              at /node_modules/jest-jasmine2/build/queueRunner.js:77:41
          {
            \\"foo\\": 10
          }
          ----
          Error: baboom
              at Object.<anonymous> (/src/__tests__/index.test.ts:100:32)
              at Object.asyncJestTest (/node_modules/jest-jasmine2/build/jasmineAsyncInstall.js:100:37)
              at /node_modules/jest-jasmine2/build/queueRunner.js:47:12
              at new Promise (<anonymous>)
              at mapper (/node_modules/jest-jasmine2/build/queueRunner.js:30:19)
              at /node_modules/jest-jasmine2/build/queueRunner.js:77:41
          "
        `)
      }
    })
  })
})

function cleanStack(stack: string) {
  return stack
    .replace(new RegExp(regExpEscape(process.cwd()), 'g'), '')
    .replace(/.*\/wallaby\/.*\n/g, '')
    .replace(/.* processTicksAndRejections .*(\n|$)/g, '')
}
