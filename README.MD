
# jackpaper

A Node.js Script for pulling random or category set images from unplash.com and applying them to your desktop wallpaper

### [View on GitHub](https://github.com/jackel27/Jackpaper)

## Installation
[You do need a developer ID from unsplash.](https://unsplash.com/developers) - simply register for developer account, create a new project.<br>
```
$ npm install jackpaper -g
```


## Usage
```
Usage: wallpaper.js [options] [command]

Commands:

  change                 Change Background Randomly
  key                    Set your UnSplash Developer ID
  change [string]        Will change to a random image within a category specified by the string

Options:

  -h, --help  output usage information


Examples:

  $ jackpaper key
  $ jackpaper change
  $ jackpaper change galaxy


```
