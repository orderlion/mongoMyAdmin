import { NextResponse } from 'next/server';
import { getCollection } from '@/src/services/mongodb';

// DOCUMENT LEVEL

export async function GET(req, { params = {} }) {
  const { collection: collectionName, document: _id } = params;
  const collection = await getCollection(collectionName);
  const doc = await collection.findOne({ _id });
  return NextResponse.json(doc);
}

export async function POST(req, { params = {} }) {
  const { collection: collectionName, document: _id } = params;
  const collection = await getCollection(collectionName);
  if (!collection) throw new Error(`Collection ${collectionName} not found.`);
  const newDoc = await req.json();
  const newDocId = newDoc._id;
  delete newDoc._id;
  const updateResp = await collection.updateOne({ _id: newDocId }, { $set: { ...newDoc } }, { upsert: true });
  return NextResponse.json(updateResp);
}
