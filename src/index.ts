import stringify from 'fast-safe-stringify'

type ErrorShape = { message: string; stack?: string }

type BaseErrorDataType = {} | undefined | null
type BaseErrorStaticDataType = {} | undefined | null //BaseErrorDataType

export default class BaseError<
  DataType extends BaseErrorDataType = undefined
> extends Error {
  readonly name: string
  readonly source?: ErrorShape
  private cachedStack?: string | null

  constructor(message: string, data?: DataType) {
    super(message)
    this.name = this.constructor.name
    const err = Object.create(this, {
      stack: {
        get() {
          const originalStack =
            Object.getPrototypeOf(this).stack || '<no stack>'
          return this.getStack(originalStack)
        },
        set(val: string) {
          this.cachedStack = val
        },
      },
      cachedStack: {
        configurable: true,
        enumerable: false,
        value: null,
        writable: true,
      },
      source: {
        configurable: true,
        enumerable: false,
        value: null,
        writable: true,
      },
    })
    if (data) Object.assign(err, data)
    return err
  }

  static create<
    DataType extends BaseErrorStaticDataType = BaseErrorStaticDataType
  >(message: string, data?: DataType): BaseError<DataType> & DataType {
    return new BaseError(message, data) as BaseError<DataType> & DataType
  }

  static wrap<
    DataType extends BaseErrorStaticDataType = BaseErrorStaticDataType
  >(source: ErrorShape, message: string, data?: DataType) {
    const Class = this.prototype.constructor
    // @ts-ignore
    return new Class(message, data).wrap(
      source,
      /*passedCachedStack*/ data ? 'cachedStack' in (data as {}) : false,
    )
  }

  static wrapAndThrow<
    DataType extends BaseErrorStaticDataType = BaseErrorStaticDataType
  >(source: ErrorShape, message: string, data?: DataType): never {
    throw this.wrap(source, message, data)
  }

  static assert<
    DataType extends BaseErrorStaticDataType = BaseErrorStaticDataType
  >(condition: any, message: string, data?: DataType): asserts condition {
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
    const { message: _, name: __, ...data } = this
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

  wrap(source: ErrorShape, passedCachedStack?: boolean): this {
    // @ts-ignore
    this.source = source
    if (!passedCachedStack) {
      this.cachedStack = null
    }
    return this
  }
}

function hasKey(obj: {}): boolean {
  for (const key in obj) {
    return true
  }
  return false
}
