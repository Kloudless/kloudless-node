# Change Log

## 1.0.5

* The Management API is now supported, along with DeveloperKey auth.
* Kloudless Bearer token auth is now supported.

## 1.0.5

* Resolving encoding issues with downloaded content. (#10)

## 1.0.4

* The upload endpoint now uses the v1 format and accepts `ReadStream` objects
  as well as `Buffer` objects.

## 1.0.3

* The response object is now returned in the callback.

## 1.0.1

* The multipart upload endpoints now correctly use `v1` instead of `v0`.

## 1.0.0

* The API version has been updated to `v1`. This introduces backwards
  incompatible changes. Please review the
  [migration guide](https://developers.kloudless.com/docs/v1/migration)
  for more information on migrating from `v0` to `v1`.
