#!/bin/bash
. /home/pi/.bashrc
$(which node) $(which pm2) reload Heresy
