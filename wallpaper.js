#!/usr/bin/env node
const commander = require('commander-plus')
const wallpaper = require('wallpaper')
const chalk = require('chalk')
const request = require('request')
const path = require('path')
const fs = require('fs')
const http = require('http')
const url = require('url')
const home = require('os').homedir()
const mkpath = require('mkpath')
const del = require('del')
const figlet = require('figlet')
const clear = require('clear')

let HOST = 'https://api.unsplash.com/'
let lastarg = '2 '
let clientkey = ''
let change = false
const errorHandle = /errors\"\:\["(.*)"]}/g

console.log(
  chalk.blue(
    figlet.textSync('JackPaper', { horizontalLayout: 'full' })
  )
)

commander
.version('1.1.0')
.command('change')
.description('Change Background')
.action((q) => {
  if (typeof(q) !== 'object') {
    applyImage(q)
  } else {
    applyImage()
  }
})

commander
.command('key')
.description('Set your UnSplash Developer ID')
.action((key) => {
  setKey()
})

commander.on('--help', () => {
  console.log('  ')
  console.log('  Examples:')
  console.log('  ')
  console.log('    $ jackpaper key')
  console.log('    $ jackpaper change')
  console.log('    $ jackpaper change galaxy')
  console.log('')
});
commander.parse(process.argv)

function setKey() {
  commander.prompt('Unsplash Application ID: ', (key) => {
    clientkey = key
    mkpath.sync(path.join(home, '/.jackpaper'))
    const keypath = path.join(home, '/.jackpaper/key.txt')
    fs.writeFile(keypath, key, (err) => {
      if (err) throw err
      clear()
      console.log(chalk.bold.blue('\n Key Saved!', keypath))
      process.exit()
    })
  })
}

function applyImage (query) {
  fs.readFile(path.join(home, '/.jackpaper/key.txt'), "utf8", function read(err, data) {
    if (err) {
      console.log(chalk.bold.red('You need to set your key first!'))
      setKey()
    } else {
      clientkey = data
      getPhotos('random', query, (error, photos, link) => {
        if (!error) {
          download(photos.urls.full, './assets/image.jpg').then(() => {
            process.exit()
          })
        } else {
          let err = error.toString()
          let m = errorHandle.exec(err)
          if (m[1] == "OAuth error: The access token is invalid") {
            console.log(chalk.bold.red('Your Key is Not Valid! Please Run this Command: ', chalk.bold.green('$ jackpaper key')))
          } else {
            console.log(m[1])
          }
          process.exit()
        }
      })
    }
  })
}

function download (_href, _filepath) {
  return new Promise((resolve, reject) => {
      del.sync([path.join(home,'/.jackpaper/*.jpg')], {force: true})
      const hrefStartsWithHttp = _href.indexOf('http') !== 0
      const href = hrefStartsWithHttp ? ('http://' + _href) : _href
      const parsedURL = url.parse(href)
      const filepath = path.join(home,'/.jackpaper/' + Date.now() + '.jpg') || parsedURL.pathname.split('/').join('_')
      mkpath.sync(path.join(home, '/.jackpaper'))
      console.log('downloading', href, '...')
      http.get({
        host: parsedURL.host,
        path: parsedURL.pathname
      }, (res) => {
        let chunks = []
        res.on('data', (chunk) => {
          chunks.push(chunk)
        })
        res.on('end', () => {
          const buffer = Buffer.concat(chunks)
          fs.writeFile(filepath, buffer, (err) => {
            if (err) throw err
            console.log('saved', filepath)
            wallpaper.set(filepath).then(() => {
              console.log(chalk.bold.blue('Wallpaper Set!'))
              resolve()
            })
          })
        })
      })
  })
}

function getPhotos(page, query, callback) {

   let params = {}

   if (page != null)
      params.page = page

   if (query != null)
      params.query = query

   request({
      url: (HOST + path.join('photos/random')),
      method: 'GET',
      qs: params,
      headers: {
         'Content-type': 'application/json',
         'Authorization': 'Client-ID ' + clientkey
      }
   },
   (err, res, body) => {
      if (err) return callback(err)
      if (res.statusCode !== 200) return callback(new Error(body), null)
      return callback(null, JSON.parse(body), res.headers.link)
   })
}
