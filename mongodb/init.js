// Create collections if they don't exist
db = db.getSiblingDB('youtube-clone');

if (!db.getCollectionNames().includes("users")) {
  db.createCollection("users");
}
if (!db.getCollectionNames().includes("videos")) {
  db.createCollection("videos");
}
if (!db.getCollectionNames().includes("comments")) {
  db.createCollection("comments");
}

print("MongoDB initialization completed!");
