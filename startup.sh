#!/bin/bash
echo "Started at $(date +%D)" >> ~/.pm2/logs/Heresy-out.log
git pull origin master && node index.js
