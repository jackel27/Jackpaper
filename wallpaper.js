#!/usr/bin/env node
const commander = require('commander-plus')
const wallpaper = require('wallpaper')
const schedule = require('node-schedule')
const chalk = require('chalk')
const request = require('request')
const path = require('path')
const fs = require('fs')
const http = require('http')
const url = require('url')
const home = require('os').homedir()
const mkpath = require('mkpath')

let HOST = 'https://api.unsplash.com/'
let rule = new schedule.RecurrenceRule()
let help = false
let userkey = false
let force = false
let query = ''
let clientId = {
  key:''
}
let start = false
let args = false

// commander help

function applyImage () {
  getPhotos('random', query, (error, photos, link) => {
    if (!error) {
      download(photos.urls.full, './assets/image.jpg').then(() => {
        process.exit()
      })
    } else {
      console.log('error = ', error)
      console.log(chalk.bold.red('Either you have an invalid key, no results from query, or you have exceeded your quota.'))
      process.exit()
    }
  })
}

function promptQuery () {
  if (clientId) {
    userkey = true
    commander.prompt('query: ', (q) => {
      query = q
      applyImage()
    })
  } else {
    console.log('Key not valid... exiting')
  }
}

commander
  .version('1.0.2')
  .option('-s, --start', 'Start the Program with prompts to change background or simply just type "jackpaper"')
  .option('-k, --key <key>', 'Specify Application ID', (val) => {
    clientId.key = val
    args = true
  })
  .option('-q, --query', 'Filter with Query', (val) => {
    query = val
    args = true
  })
  .option('-f, --force', 'Force one-time immediate change without delay')
  commander.on('--help', () => {
    args = true
    console.log( chalk.bold.yellow('  Examples:'))
    console.log('');
    console.log( chalk.bold.green('    $ jackpaper'))
    console.log( chalk.bold.green('    $ jackpaper --start'))
    console.log( chalk.bold.green('    $ jackpaper --help'))
    console.log( chalk.bold.green('    $ jackpaper -k "123218df8291" -q "animals"'))
    console.log( chalk.bold.green('    $ jackpaper -k "123218df8291" -f'))
    console.log( chalk.bold.green('    $ forever start jackpaper -k "123218df8291"'))
    console.log( chalk.bold.green('    $ forever start jackpaper -k "123218df8291" --query "nature landscape"'))
    console.log('')
  })
  .parse(process.argv)
if (commander.start || !args) {
  args = true
  start = true
  commander.prompt('Unsplash Application ID: ', (key) => {
    clientId.key = key
    promptQuery()
  })
}
if (commander.force) {
  applyImage()
  args = true
}
if (!commander.force) {
  schedule.scheduleJob(rule, () => {
    applyImage()
  })
}

// every 2 minutes
let minute = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58]
rule.minute = minute
function add (a, b) {
  return a + b
}

function download (_href, _filepath) {
  return new Promise((resolve, reject) => {
      const hrefStartsWithHttp = _href.indexOf('http') !== 0
      const href = hrefStartsWithHttp ? ('http://' + _href) : _href
      const parsedURL = url.parse(href)
      const filepath = path.join(home,'/jackpaper/image.jpg') || parsedURL.pathname.split('/').join('_')
      mkpath.sync(path.join(home, '/jackpaper'))
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
              console.log('Wallpaper Set!')
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
         'Authorization': 'Client-ID ' + clientId.key
      }
   },
   (err, res, body) => {
      if (err) return callback(err)
      if (res.statusCode !== 200) return callback(new Error(body), null)
      return callback(null, JSON.parse(body), res.headers.link)
   })
}
