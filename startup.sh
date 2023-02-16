#!/bin/bash
echo "Started at $(date +%D)"
git pull origin master && node index.js
