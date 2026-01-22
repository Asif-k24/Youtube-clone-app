#!/bin/bash

DATE=$(date +%F)
CONTAINER="youtube-clone-mongodb"
DEST_DIR="/home/vagrant/backups/mongodb"

MONGO_USER="admin"
MONGO_PASS="password123"
AUTH_DB="admin"

mkdir -p "$DEST_DIR"

docker exec "$CONTAINER" mongodump \
  --username="$MONGO_USER" \
  --password="$MONGO_PASS" \
  --authenticationDatabase="$AUTH_DB" \
  --archive="/data/db/mongo-$DATE.archive" \
  --gzip

docker cp \
  "$CONTAINER:/data/db/mongo-$DATE.archive" \
  "$DEST_DIR/mongo-$DATE.archive.gz"
