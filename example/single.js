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
  b.bundle().pipe(fs.createWriteStream('build/bundle.js'))
}

