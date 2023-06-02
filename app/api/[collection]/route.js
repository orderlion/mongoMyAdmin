import { NextResponse } from 'next/server';
import { jsonrepair } from 'jsonrepair';
import { getCollection } from '@/src/services/mongodb';

// /collection/products: COLLECTION LEVEL

export async function GET(req, { params = {} }) {
  const { collection: collectionName } = params;
  const { searchParams } = new URL(req.url);
  const getOnlyCount = searchParams.get('getCount') || false;
  const skip = parseInt(searchParams.get('skip')) || 0;
  const limit = parseInt(searchParams.get('limit')) || 20;
  let query = null;
  const queryParam = jsonrepair(searchParams.get('query') || '');
  if (queryParam) {
    try {
      query = JSON.parse(queryParam);
    } catch(err) {
      console.error('Could not parse JSON query:', searchParams.get('query'));
      query = null;
    }
  }
  const collection = await getCollection(collectionName);
  let count = 0;
  if (!query || Object.keys(query).length === 0) count = await collection.estimatedDocumentCount();
  else count = await collection.countDocuments(query);

  if (getOnlyCount) return NextResponse.json(count);

  // console.log('GET DOCS:', { query, limit, skip });
  const docs = await collection.find(query || {}).limit(limit).skip(skip).toArray();
  return NextResponse.json(docs);
}
