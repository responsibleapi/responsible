# Responsible

OpenAPI toolkit

## Why

### Custom DSL

- OpenAPI DSL is extremely verbose and hard to read. It's also hard to maintain. This library provides a custom DSL that
is much more readable and maintainable.
- Advanced Types
  - newtype
  - template type
  - external type (defined outside of the contract)

## Tutorial

- `touch api.js`
- copy this:
  ```js
  module.exports = service({ foo: "bar" }, {})
  ```
- `responsible api.js`
