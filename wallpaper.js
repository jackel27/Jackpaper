const wallpaper = require('wallpaper')
const schedule = require('node-schedule')
const chalk = require('chalk')
const request = require('request')
const path = require('path')
const fs = require('fs')
const http = require('http')
const url = require('url')

let HOST = 'https://api.unsplash.com/'
let rule = new schedule.RecurrenceRule()
let help = false
let userkey = false
let force = false
let query = ''
let clientId = {
  key:''
}
rule.minute = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58]

process.argv.forEach((val, index) => {
  if (val == '-q') {
    query = process.argv[index + 1]
  }
  if (val == '--key') {
    userkey = true
    clientId.key = process.argv[index + 1]
  }
  if (val == '--force') {
    force = true
  }
  if (val == '--help') {
    help = true
    console.log("\n", chalk.bold.green('example:', chalk.bold.white('node wallpaper.js -q ',chalk.bold.red('"search query"') + ' --key ', chalk.bold.red('"your unsplash dev id"'))))
    console.log("\n", "\t", "\t", "\t", "\t", "Or")
    console.log("\n", chalk.bold.green('example:', chalk.bold.white('forever start wallpaper.js -q ',chalk.bold.red('"search query"') + ' --key ', chalk.bold.red('"your unsplash dev id"'), "\n")))
    console.log(chalk.bold.green("If you want to force an image without a time delay, just use "),chalk.bold.blue('Node wallpaper.js '), '--force --key ',chalk.bold.red('"your unsplash dev id"'))
  }
})


if (!help && userkey) {
  if (!force) {
    schedule.scheduleJob(rule, () => {
      // console.log('The answer to life, the universe, and everything!')
      getPhotos('random', query, (error, photos, link) => {
        download(photos.urls.full, './assets/image.jpg')
      })
    })
  } else if (force) {
    getPhotos('random', query, (error, photos, link) => {
      download(photos.urls.full, './assets/image.jpg')
    })
  }
} else if (!userkey && !help) {
  console.log(chalk.bold.red('Cannot execute without specifying your unsplash dev id. example: node wallpaper.js --key \"YOUR KEY HERE\"'))
}


function download (_href, _filepath) {
  const hrefStartsWithHttp = _href.indexOf('http') !== 0
  const href = hrefStartsWithHttp ? ('http://' + _href) : _href
  const parsedURL = url.parse(href)
  const filepath = _filepath || parsedURL.pathname.split('/').join('_')

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
        wallpaper.set('./assets/image.jpg').then(() => {
          console.log('Wallpaper Set!')
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
