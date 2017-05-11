
# Jackpaper

A Node.js Script for pulling random images from unplash.com and applying them to your desktop wallpaper every two minutes.

## Installation
[You do need a developer ID from unsplash.](https://unsplash.com/developers) - simply register for developer account, create a new project.<br> <strong>copy project id to use for --key </strong>
```
$ git clone https://github.com/jackel27/Jackpaper.git
$ cd Jackpaper
$ npm install
```


## Usage
```
make sure you are in project root...

$ node wallpaper.js --help
$ node wallpaper.js -q "QUERY HERE - OPTIONAL" --key "YOUR UNPLASH DEVELOPER PROJECT ID -REQUIRED"
```
or use forever...
```
$ forever start wallpaper --key "YOUR DEV ID" -q "QUERY"
```
to force change...
```
$ node wallpaper.js --force --key "YOUR DEV ID"
```
