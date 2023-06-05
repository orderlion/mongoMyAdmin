import { NextResponse } from 'next/server';
import { getCollection } from '@/src/services/mongodb';
import { ObjectId } from 'mongodb'; 

// DOCUMENT LEVEL

export async function GET(req, { params = {} }) {
  const { collection: collectionName, document: _id } = params;
  const collection = await getCollection(collectionName);
  const idBytes = Buffer.from(_id).length;
  let findById = { _id };
  // search for _id directly (e.g. for Meteor, where _ids are strings) as well as its ObjectId:
  if (idBytes === 12 || idBytes === 24) {
    findById = { $or: [{ _id }, { _id: new ObjectId(_id) }] };
  }
  const doc = await collection.findOne(findById);
  return NextResponse.json(doc);
}

export async function POST(req, { params = {} }) {
  const { collection: collectionName, document: _id } = params;
  const collection = await getCollection(collectionName);
  if (!collection) throw new Error(`Collection ${collectionName} not found.`);
  const newDoc = await req.json();
  let newDocId = newDoc._id;
  delete newDoc._id;
  const idBytes = Buffer.from(newDocId).length;
  if (idBytes === 12 || idBytes === 24) {
    newDocId = new ObjectId(newDocId);
  }
  const updateResp = await collection.updateOne({ _id: newDocId }, { $set: { ...newDoc } }, { upsert: true });
  return NextResponse.json(updateResp);
}
