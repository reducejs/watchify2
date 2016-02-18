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

