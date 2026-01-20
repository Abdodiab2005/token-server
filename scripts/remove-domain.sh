#!/bin/bash

CONFIG="config/allowed-domains.json"
DOMAIN=$1

jq ".domains -= [\"$DOMAIN\"]" $CONFIG > tmp.json && mv tmp.json $CONFIG

pm2 restart token-server

echo "❌ Domain removed and server restarted"
