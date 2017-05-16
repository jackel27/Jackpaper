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
let automatic = false
let change = false
let imageInfo = {
  user: '',
  url: ''
}
const errorHandle = /errors\"\:\["(.*)"]}/g

console.log(
  chalk.blue(
    figlet.textSync('JackPaper', {
      horizontalLayout: 'full',
      font: '3D-ASCII'
    }))
)

commander
.version('1.2.3')
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
.command('auto')
.option('-t, --time <time>', 'adjust the time')
.description('Change Background per adjusted time')
.action((auto, time) => {
  automatic = true
  if (typeof(auto) !== 'object' && time.time) {
    setInterval(() => {
      applyImage(auto)
    }, (time.time * 1000))
  } else if (auto.time){
    setInterval(() => {
      applyImage()
    }, (auto.time * 1000))
  } else {
    console.log('--time required. Example: ', chalk.bold.green('jackpaper auto --time 10'))
    process.exit()
  }
})

commander
.command('key')
.description('Set your UnSplash Developer ID')
.action((key) => {
  setKey()
})

commander.on('--help', () => {
  clear()
  console.log('Usage: jackpaper <command> [options]')
  console.log('')
  console.log('Commands:')
  console.log('')
  console.log('change                 Change Background')
  console.log('auto <options>         Change Background per adjusted time')
  console.log('key                    Set your UnSplash Developer ID')
  console.log('')
  console.log('Options:')
  console.log('-t, --time     set time in seconds for auto command')
  console.log('-h, --help     output usage information')
  console.log('-V, --version  output the version number')
  console.log('  ')
  console.log('  Examples:')
  console.log('  ')
  console.log('    $ jackpaper --version')
  console.log('    $ jackpaper --help')
  console.log('    $ jackpaper key')
  console.log('    $ jackpaper change')
  console.log('    $ jackpaper change galaxy')
  console.log('    $ jackpaper auto --time 10')
  console.log('    $ jackpaper auto galaxy --time 10')
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
        // if (error) console.log(error)
        if (!error) {
          download(photos.urls.full, './assets/image.jpg').then(() => {
            if (!automatic) {
              process.exit()
            }
          })
        } else {
          // console.log(error)
          let err = error.toString()
          let m = errorHandle.exec(err)
          // console.log('m[1] = ', m[1])
          if (m[1] == "OAuth error: The access token is invalid") {
            console.log(chalk.bold.red('Your Key is Not Valid! Please Run this Command: ', chalk.bold.green('$ jackpaper key')))
          } else {
            console.log(m[1])
            process.exit()
          }
            process.exit()
            clear()
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
              clear()
              console.log(
                chalk.yellow(
                  figlet.textSync('Unsplash', { horizontalLayout: 'full' })
                )
              )
              console.log('\nPhoto By: ', chalk.bold.red(imageInfo.user), '\nUrl: ', chalk.bold.red(imageInfo.url))
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
      if (body == 'Rate Limit Exceeded') {
        console.log(chalk.bold.red('Your rate limit has reached the max, allow up to an hour for it to refresh. Or put a new key in.'))
        process.exit()
      } else {
        let json = JSON.parse(body)
        if (json.user) {
          imageInfo.user = json.user.name
          imageInfo.url = json.links.html
        }
        if (err) return callback(err)
        if (res.statusCode !== 200) return callback(new Error(body), null)
        return callback(null, JSON.parse(body), res.headers.link)
      }
   })
}
