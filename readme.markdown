# watchify2
[![version](https://img.shields.io/npm/v/watchify2.svg)](https://www.npmjs.org/package/watchify2)
[![status](https://travis-ci.org/reducejs/watchify2.svg?branch=master)](https://travis-ci.org/reducejs/watchify2)

This is a clone for [watchify]
to support detecting new entries.

It is based on this [pr](https://github.com/substack/watchify/pull/297),
and once [watchify] handles watching adding/removing entry files,
this package will be deprecated.

## Example

### Command line

```bash
cd example/files
../../bin/cmd.js main.js -o bundle.js --entry-glob='main*.js'

# new entry
cp main.js main2.js

# edit `main2.js` and save to see the change

# delete entry
rm main2.js

```

### API

```js
var fs = require('fs')
var browserify = require('browserify')

var b = browserify({
  basedir: __dirname + '/files',
  cache: {},
  packageCache: {},
  entries: './main.js',
})

b.plugin(__dirname + '/../', { entryGlob: 'main*.js' })

b.on('update', bundle)

bundle()

function bundle() {
  console.log('UPDATE')
  b.bundle().pipe(fs.createWriteStream('bundle.js'))
}

```

## Creating multiple bundles

```js
var vfs = require('vinyl-fs')
var del = require('del')
var browserify = require('browserify')
var through = require('through2')

var b = browserify({
  basedir: __dirname + '/files',
  cache: {},
  packageCache: {},
  entries: './main.js',
})

b.plugin(__dirname + '/../', { entryGlob: 'main*.js' })
b.plugin(dedupify)
b.plugin('common-bundle', { groups: '**/main*.js' })

b.on('update', bundle)
bundle()

function bundle() {
  console.log('UPDATE')
  var build = __dirname + '/build'
  del(build)
  b.bundle().pipe(vfs.dest(build))
}

function dedupify(b) {
  var undef
  b.on('reset', hook)
  hook()

  function hook() {
    b.pipeline.get('dedupe').unshift(through.obj(function (row, enc, next) {
      if (row.entry && row.dedupe) {
        row.dedupe = undef
        row.dedupeIndex = undef
      }
      next(null, row)
    }))
  }
}

```

The `dedupify` plugin in the example above is used to fix a known problem with browserify (see [substack/factor-bundle#51]).

Right now it is a little tricky to detect new entries with [factor-bundle],
so [common-bundle] is used instead.

[watchify]: https://github.com/substack/watchify
[common-bundle]: https://github.com/reducejs/common-bundle
[substack/factor-bundle#51]: https://github.com/substack/factor-bundle/issues/51
[factor-bundle]: https://github.com/substack/factor-bundle
