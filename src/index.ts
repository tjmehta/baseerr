import stringify from 'fast-safe-stringify'

type ErrorShape = { message: string; stack?: string }

type _DataType = {} | undefined | null

export default class BaseError<DataType extends _DataType> extends Error {
  readonly name: string
  readonly source?: ErrorShape
  private cachedStack?: string | null

  constructor(message: string, data?: DataType) {
    super(message)
    this.name = this.constructor.name
    if (data) Object.assign(this, data)
    const originalStack = this.stack || '<no stack>'
    Object.defineProperty(this, 'stack', {
      get: () => this.getStack(originalStack),
      set: (val: string) => {
        this.cachedStack = val
      },
    })
    Object.defineProperty(this, 'cachedStack', {
      configurable: true,
      enumerable: false,
      value: null,
      writable: true,
    })
    Object.defineProperty(this, 'source', {
      configurable: true,
      enumerable: false,
      value: null,
      writable: true,
    })
  }

  static create<DataType extends _DataType>(
    message: string,
    data?: DataType,
  ): BaseError<DataType> & DataType {
    return new BaseError(message, data) as BaseError<DataType> & DataType
  }

  static wrap<DataType extends _DataType>(
    source: ErrorShape,
    message: string,
    data?: DataType,
  ) {
    const Class = this.prototype.constructor
    // @ts-ignore
    return new Class(message, data).wrap(source)
  }

  static wrapAndThrow<DataType extends _DataType>(
    source: ErrorShape,
    message: string,
    data?: DataType,
  ): never {
    throw this.wrap(source, message, data)
  }

  static assert<DataType extends _DataType>(
    condition: any,
    message: string,
    data?: DataType,
  ): asserts condition {
    const Class = this.prototype.constructor
    if (!condition) {
      // @ts-ignore
      const err = new Class(message, { ...data, condition })
      err.stack = err.stack.replace(/[ ]+at .*\n/, '')
      throw err
    }
  }

  private getStack(originalStack: string) {
    if (this.cachedStack) return this.cachedStack
    let cached = false
    let stack: string = originalStack
    const data: { message: string; name: string } = { ...this }
    delete data.message
    delete data.name
    if (hasKey(data)) {
      // hacks for better stringification
      // @ts-ignore: better regexp stringification
      RegExp.prototype.toJSON =
        // @ts-ignore: better regexp stringification
        RegExp.prototype.toJSON || RegExp.prototype.toString

      stack += '\n' + stringify(data, undefined, 2)
      this.cachedStack = stack
      cached = true

      // remove hacks for stringification
      // @ts-ignore: remove hack
      delete RegExp.prototype.toJSON
    }
    if (this.source) {
      stack += '\n----\n' + (this.source.stack || this.source.message)
      this.cachedStack = stack
      cached = true
    }
    if (cached) this.cachedStack += '\n'
    return this.cachedStack || stack
  }

  wrap(source: ErrorShape) {
    // @ts-ignore
    this.source = source
    this.cachedStack = null
    return this
  }
}

function hasKey(obj: {}): boolean {
  for (const key in obj) {
    return true
  }
  return false
}
