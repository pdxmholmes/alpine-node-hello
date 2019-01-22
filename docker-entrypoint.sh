#!/bin/bash
set -e

if [ "$1" = 'server' ]; then
  exec node /var/service/index.js
fi

exec "$@"
