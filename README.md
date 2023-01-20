# Yet another live announcement bot

## API Support
- twitch
- trovo
- others can be requested by messaging me on discord (HypnoSprite#4131) or by posting an issue

## Basic Instructions
```/setup``` to get started

```/watcher add``` to add a stream, the platform value is a comma separated list of platforms

```/watcher remove``` to remove a stream

```/edit``` to make minor changes to the server configuration

NOTE: ```/edit``` does not support changing the streamer info
  unfortunately this means you'll need to delete and re-add the streamer in question

## Hosting

A version of this bot is hosted for public use
If you would like to host your own version you must provide api keys for all of platforms (including discord ofc)


### Hosting Setup
- .env file for credentials
- watcher.json for storage
- bot.log for logs
- npm
- node 19
- discord token
- trovo api id/secret pair
- twitch api id/secret pair
