# BaseErr

A solid BaseError class that supports custom properties and wrapping errors

# Installation

```sh
npm i --save baseerr
```

# Usage

#### Create a custom error class

```js
import BaseError from 'baseerr'

class CustomError extends BaseError {}

const err = new CustomError('boom')
console.log(err.name // 'CustomError'
console.log(err.stack)
// CustomError: boom
//     anonymous (filename:5:17)
```

#### Wrap an error with a custom error class

```js
import BaseError from 'baseerr'

class CustomError extends BaseError {}

try {
  throw new Error('pow')
} catch (_err) {
  const err = CustomError.wrap(_err, 'caught error')
  console.log(err.stack)
  // CustomError: caught error
  //     anonymous (filename:8:17)
  // ----
  // Error: pow
  //     anonymous (filename:6:9)
}
```

#### Wrap an error with a custom error class in promise chain

```js
import BaseError from 'baseerr'

class CustomError extends BaseError {}

Promise.reject(new Error('pow')).catch((err) =>
  CustomError.wrapAndThrow('caught error', err),
)
// rejects with:
// CustomError: caught error
//     anonymous (filename:6:3)
// ----
// Error: pow
//     anonymous (filename:5:16)
```

#### Create custom error instance with data properties

```js
import BaseError from 'baseerr'

class CustomError extends BaseError {}

const err = new CustomError('boom', { foo: 10, bar: 20 })
console.log(err.foo) // 10
console.log(err.bar) // 20
console.log(err.stack)
// CustomError: boom
//     anonymous (filename:5:17)
// {
//   "foo": 10,
//   "bar": 20
// }

// TypeScripters use BaseError.create if you want to access extended properties with proper typing:
const err = CustomError.create('boom', { foo: 10, bar: 20 })
console.log(err.foo) // 10
console.log(err.bar) // 20
```

#### Create custom api client with robust error handling

```js
import BaseError from 'baseerr'

class FetchError extends BaseError {}
class ResponseError extends BaseError {}
class ApiError extends BaseError {}

class ApiClient {
  getData() {
    const url = 'https://localhost:3000'
    try {
      const res = await Promise.race([
        timeout(2000).then(() => {
          throw new TimeoutError('request timed out', { statusCode: 504, url })
        }),
        fetch(url).catch(
          FetchError.wrapAndThrow('network error', { statusCode: 503, url }),
        ),
      ])
      if (res.statusCode !== 200) {
        throw new ResponseError('status: ${res.statusCode}', {
          statusCode: res.statusCode,
          url,
        })
      }
      return await res.json()
    } catch (err) {
      throw ApiError.wrap(err, { url, statusCode: err.statusCode || 500 })
      // ApiError: boom
      //     anonymous (filename:row:col)
      // {
      //   "url": 'https://localhost:3000',
      //   "statusCode": 504
      // }
      // ----
      // TimedoutError: request timed out
      //     anonymous (filename:row:col)
      // {
      //   "url": 'https://localhost:3000',
      //   "statusCode": 504
      // }
    }
  }
}
```

#### Checkout the tests for more examples..

# License

MIT
