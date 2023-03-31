#!/bin/bash
echo "Started at $(date +%D)" >> ~/.pm2/logs/Heresy-out.log
#git pull origin master && node events.js
node events.js
