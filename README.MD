
# Jackpaper

A Node.js Script for pulling random images from unplash.com and applying them to your desktop wallpaper every two minutes.

### [View on GitHub](https://github.com/jackel27/Jackpaper)

## Installation
[You do need a developer ID from unsplash.](https://unsplash.com/developers) - simply register for developer account, create a new project.<br> <strong>copy project id to use for --key </strong>
```
$ npm install jackpaper -g
$ jackpaper
```


## Usage
```
Usage: jackpaper [options]

  Options:

    -h, --help       output usage information
    -V, --version    output the version number
    -s, --start      Start the Program with prompts to change background or simply just type "jackpaper"
    -k, --key <key>  Specify Application ID
    -q, --query      Filter with Query
    -f, --force      Force one-time immediate change without delay

  Examples:

    $ jackpaper
    $ jackpaper --start
    $ jackpaper --help
    $ jackpaper -k "123218df8291" -q "animals"
    $ jackpaper -k "123218df8291" -f
    $ forever start jackpaper -k "123218df8291"
    $ forever start jackpaper -k "123218df8291" --query "nature landscape"
```
or use forever...
```
$ forever start jackpaper --key "YOUR DEV ID" -q "QUERY"
```
to force change...
```
$ jackpaper --force --key "YOUR DEV ID"
```
Or use the wizard...
```
$ jackpaper
```
