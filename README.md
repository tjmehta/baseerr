# BaseError

A solid BaseError class that supports custom properties and wrapping

# Installation

```sh
npm i --save baseerror
```

# Usage

#### Extend BaseError class

```js
import BaseError from 'baseerror'

class CustomError extends BaseError {}

const err = new CustomError('boom')
console.log(err.name)
// 'CustomError'
console.log(err.stack)
// CustomError: boom
//     anonymous (filename:1:1)
```

#### Create custom error instance with data

```js
import BaseError from 'baseerror'

class CustomError extends BaseError {}

const err = new CustomError('boom', { foo: 10, bar: 20 })
console.log(err.stack)
// CustomError: boom
//     anonymous (filename:1:1)
// {
//   "foo": 10,
//   "bar": 20
// }
```

# License

MIT
