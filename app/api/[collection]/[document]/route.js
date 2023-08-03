import { NextResponse } from 'next/server';
import { getCollection } from '@/src/services/mongodb';
import objectPath from 'object-path';
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
  const oldIdBytes = Buffer.from(_id).length;
  let findById = { _id };
  // search for _id directly (e.g. for Meteor, where _ids are strings) as well as its ObjectId:
  if (oldIdBytes === 12 || oldIdBytes === 24) {
    findById = { $or: [{ _id }, { _id: new ObjectId(_id) }] };
  }
  const oldDoc = await collection.findOne(findById);
  const newDoc = await req.json();
  let newDocId = newDoc._id;
  delete newDoc._id;
  const idBytes = Buffer.from(newDocId).length;
  if (idBytes === 12 || idBytes === 24) {
    newDocId = new ObjectId(newDocId);
  }
  if (Object.keys(newDoc).length === 0) {
    // apparently we removed everything except the id
    await collection.deleteOne({ _id: newDocId });
    const insertResp = await collection.insertOne({ _id: newDocId });
    return NextResponse.json(insertResp);
  }
  // iterate over newDoc and check, that all the data types are correct - especially dates!
  if (oldDoc && newDoc) {
    ensureAttrType({ value: newDoc, compare: oldDoc });
  }
  const updateResp = await collection.replaceOne({ _id: newDocId }, newDoc, { upsert: true });
  return NextResponse.json(updateResp);
}

export async function DELETE(req, { params = {} }) {
  let { collection: collectionName, document: _id } = params;
  const collection = await getCollection(collectionName);
  if (!collection) throw new Error(`Collection ${collectionName} not found.`);
  const idBytes = Buffer.from(_id).length;
  if (idBytes === 12 || idBytes === 24) {
    _id = new ObjectId(_id);
  }
  const deleteResp = await collection.deleteOne({ _id });
  return NextResponse.json(deleteResp);
}

// could be used later for setting "new" values of type date:
const dateRegex = /^(\d{4})-0?(\d+)-0?(\d+)[T ]0?(\d+):0?(\d+):0?(\d+)(\.(\d+)Z)?$/g;

// this helper function makes sure, that the TYPE of a value persists!
function ensureAttrType({ value, compare, orig = null, path = '' }) {
  if (path === '' && !orig) orig = value;
  if (Array.isArray(value) && value?.length) {
    value.forEach((arrayElem, arrayIndex) => {
      ensureAttrType({ value: arrayElem, compare, orig, path: `${path}.${arrayIndex}` });
    });
    return;
  }
  if (typeof value === 'object' && value && !Array.isArray(value)) {
    for (const [key, innerValue] of Object.entries(value)) {
      const innerPath = [path, key].filter((v) => !!v).join('.');
      ensureAttrType({ value: innerValue, compare, orig, path: innerPath });
    }
    return;
  }
  const compareValue = objectPath.get(compare, path);
  // not a new value, but an updated one, but the TYPE changed:
  if (typeof compareValue !== 'undefined' && typeof value !== 'undefined' && typeof value !== typeof compareValue) {
    if (compareValue instanceof Date) {
      value = new Date(value);
    }
    if (typeof compareValue === 'number') {
      value = parseFloat(value);
    }
    if (typeof compareValue === 'string') {
      value = String(value);
    }
    objectPath.set(orig, path, value);
  }
}
