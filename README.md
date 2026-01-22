# Youtube-Clone

A full-featured MERN stack video streaming application built with Tailwind CSS and Redux Toolkit.

## Features
- User authentication
- Video upload & streaming
- Like & comment system
- Cloudinary integration
- Responsive UI

## Tech Stack
- MongoDB
- Express.js
- React.js
- Node.js
- Tailwind CSS
- Redux Toolkit

## Backup & Database Migration

### Daily Backups
- Backend source code backup using tar
- MongoDB backup using mongodump inside Docker
- Cron job runs daily at 10 PM

### Backup Location
/home/vagrant/backups/

### Database Migration
- Full MongoDB restore using mongorestore
- Supports disaster recovery and server migration

### Scripts
- backup-backend.sh
- backup-mongodb.sh
- migrate-mongodb.sh


