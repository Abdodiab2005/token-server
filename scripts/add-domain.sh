#!/bin/bash

CONFIG="config/allowed-domains.json"
DOMAIN=$1

if [ -z "$DOMAIN" ]; then
  echo "Usage: ./add-domain.sh https://example.com"
  exit 1
fi

jq ".domains += [\"$DOMAIN\"] | .domains |= unique" $CONFIG > tmp.json && mv tmp.json $CONFIG

pm2 restart token-server

echo "✅ Domain added and server restarted"
