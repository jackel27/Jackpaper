
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
Usage: jackpaper <command> [options]

Commands:

  change                 Change Background
  key                    Set your UnSplash Developer ID
  change [string]        Will change to a random image within a category specified by the string
  auto <options>         Change Background per adjusted time

Options:

  -h, --help            output usage information
  -v, --version         output version
  -t, --time            set time in seconds for auto command


Examples:

$ jackpaper --version
$ jackpaper --help
$ jackpaper key
$ jackpaper change
$ jackpaper change galaxy
$ jackpaper auto --time 10
$ jackpaper auto galaxy --time 10


```
## Use with forever
```
$ forever jackpaper auto landscape --time 10   


```
