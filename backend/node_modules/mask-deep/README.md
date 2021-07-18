# mask-deep

### For recursively masking sensitive data within Javascript objects or query strings

A simple function that, given an object or a url with a query string along with a list of properties to mask, will crawl through it and cover most of the length of these properties with asterisks.

Useful in avoiding the display of passwords or personally-identifiable information (PII) in your logging software.

Written with help from @glasseyes42

#### Simple usage
```
const maskDeep = require('mask-deep');

const maskMe = {
  prop1: 'abcdef',
  prop2: 'ghijkl',
  deepProp: {
    prop1: '123456',
    deeperProp: {
      prop1: 876543
    }
  },
  prop3: 'kmnopqr'
};

const maskedObject = maskDeep(maskMe, ['prop1', 'prop3']);

console.log(maskedObject);
/* will log:
{
  prop1: '*****f',
  prop2: 'ghijkl',
  deepProp: {
    prop1: '*****6',
    deeperProp: {
      prop1: '*****3'
    }
  },
  prop3: '******r'
}
*/
```

```
const url = 'https://www.npmjs.com/search?prop1=maskthis&prop2=dontmaskthis';

const maskedUrl = maskDeep(url, ['prop1', 'prop3']);

console.log(maskedUrl);
/* will log:
'https://www.npmjs.com/search?prop1=******is&prop2=dontmaskthis'
*/
```

### API
#### `maskDeep(source, keysToMask, [options])`
Masks the values of the provided keys within an object (recursively) or within a url's query string. Non-string properties will be coerced into strings; however, see the 'Time props' note below if your object includes properties with 'time' or 'date' within their keys.
- `source` [object|string] - the entity containing the properties to be masked
- `keysToMask` [array] - the properties whose values should be masked. Should include only strings
- `options` [object] - an optional object with these optional keys:
  - `percentage` [integer] - how much of each property to mask. Should be an integer between 0 and 100 (inclusive). Defaults to `80`
  - `maskFromRight` [boolean] - mask values starting from the right, e.g. `'mask-this'` becomes `'ma*******'`. Defaults to `false`
  - `maskTimePropsNormally` [boolean] - see 'Time props' note below. Defaults to `false`
  - `isMaskable` [function(value)] - a callback that decides whether types are maskable. Should return `true|false`. Default function says no to objects and functions, yes to other types.

### Important notes about behaviour
#### Properties that are arrays or objects
When the value of a key to mask is an array or an object, mask-deep will mask **all values** within it, recursively, even if they do not share the key. For example:
```
const maskMe = {
  prop1: {
    deepProp: {
      deeperProp: 'abcdefghi',
      arrayOfStrings: ['abcdefghi', 'abcdefghi', 'abcdefghi']
    },
    arrayOfObjects: [{ foo: 'abcdefghi' }, { bar: 'abcdefghi' }]
  },
  prop2: 'jklmnop',
  prop3: 'qrstuvw'
};

const maskedObject = maskDeep(maskMe, ['prop1', 'prop3']);

/* value of maskedObject:
{
  prop1: {
    deepProp: {
      deeperProp: '*******hi',
      arrayOfStrings: ['*******hi', '*******hi', '*******hi']
    },
    arrayOfObjects: [{ foo: '*******hi' }, { bar: '*******hi' }]
  },
  prop2: 'jklmnop',
  prop3: '******w'
}
*/
```

#### Short props
Strings or integers with a character length of 3 or below will be fully masked, regardless of the configured `percentage`.

#### Time props

mask-deep can handle values that are Date objects without any problem. However, logging applications (e.g. Kibana) sometimes call `new Date()` on properties whose keys make them look like times/dates e.g. `'timeStamp'` or `'createDate'`. If called on an asterisked string this can lead to a wrong but misleading (and unmasked) date.

Therefore, to be on the safe side, if asked to mask properties like this maskDeep will return an empty string unless the option `maskTimePropsNormally` is set to true. If it is, properties with 'time' or 'date' in their keys will be masked normally as strings, e.g. masking `{ createTime: new Date(2013, 13, 1) }` will return `{ createTime: '*******************************00 (GMT)' }`.

Date objects with keys that do not have 'time' or 'date' in them will always be masked in this way regardless of the configured options.

#### Query strings
mask-deep will mask query string properties within urls in the same way as it would values in an object. It will also seek out query strings that have keys to mask within wider objects. Notice how `prop2` within the `foo` property is masked in the example below, even though `foo` was not provided within `keysToMask`:

```
const maskMe = {
  prop1: 'abcdef',
  prop2: 'ghijkl',
  prop3: 'kmnopqr',
  foo: 'https://www.npmjs.com/search?prop1=abcdef&prop2=thiswillbemasked'
};

const maskedObject = maskDeep(maskMe, ['prop2']);

console.log(maskedObject);
/* will log:
{
  prop1: 'abcdef',
  prop2: '*****l',
  prop3: 'kmnopqr',
  foo: 'https://www.npmjs.com/search?prop1=abcdef&prop2=*************ked'
}
*/
```

Pull requests are welcome. If you find a bug please open an issue.
