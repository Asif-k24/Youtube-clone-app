#!/bin/bash

DATE=$(date +%F)
SRC_DIR="/home/vagrant/Youtube-clone-app/backend"
DEST_DIR="/home/vagrant/backups/backend"

mkdir -p $DEST_DIR

tar \
  --exclude=node_modules \
  -czf $DEST_DIR/backend-$DATE.tar.gz \
  $SRC_DIR
