#!/bin/bash

CONTAINER="youtube-clone-mongodb"
BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: ./migrate-mongodb.sh <backup-file>"
  exit 1
fi

docker cp $BACKUP_FILE \
  $CONTAINER:/data/db/restore.archive.gz

docker exec $CONTAINER mongorestore \
  --archive=/data/db/restore.archive.gz \
  --gzip \
  --drop
