#!/bin/bash
. /home/pi/.bashrc
$(which node) $(which pm2) stop Heresy
sleep 600
echo "restarted at $(date '+%H %D')"

$(which node) $(which pm2) start Heresy
