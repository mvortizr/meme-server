#!/bin/bash
#Stopping existing node servers
echo "Stopping any existing node servers"
#Killing node processes if they exist - pkill node
if pgrep node; then pkill node; fi

#Announce to code deploy that the script has finalized
exit 0