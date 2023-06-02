import { MongoClient } from 'mongodb'; // https://www.npmjs.com/package/mongodb
import settings from '@/mongoMyAdmin.config';

let MONGO_URL = process?.env?.MONGO_URL || settings.mongoUrl;
if (!MONGO_URL) {
  throw new Error('mongoUrl missing in your mongoMyAdmin.config.js file!');
}

if (process.env.IS_DOCKER) {
  // if we are inside a docker container, we are clever:
  MONGO_URL = MONGO_URL.replace('/localhost:', '/172.17.0.1:');
}
// Due to problems with node18, make sure that the MONGO_URL actually works:
MONGO_URL = MONGO_URL.replace('/localhost:', '/127.0.0.1:');

export let db;
export let collections;

export const client = new MongoClient(MONGO_URL);

async function initClient() {
  try {
    console.info('mongoMyAdmin: Connecting to MONGO_URL:', MONGO_URL);
    await client.connect();
    await client.db('admin').command({ ping: 1 });
    client._isConnected = true;
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}

export async function initDb() {
  if (!client?._isConnected) await initClient();
  if (!db) db = client.db('meteor');
}

export async function getCollections() {
  await initDb();
  if (!collections) collections = await db.collections();
  const { excludeCollections } = settings || {};
  if (excludeCollections?.length > 0) {
    collections = collections.filter((coll) => {
      if (excludeCollections.includes(coll.collectionName)) return false;
      return true;
    });
  }
  return collections;
}

export async function getCollection(collectionName) {
  await initDb();
  return db.collection(collectionName);
}
