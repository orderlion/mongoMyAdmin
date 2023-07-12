import { NextResponse } from 'next/server';
import { jsonrepair } from 'jsonrepair';
import { getCollection } from '@/src/services/mongodb';

// /collection/products: COLLECTION LEVEL

String.prototype.replaceAt = function(index, replacement) {
  return this.substring(0, index) + replacement + this.substring(index + (replacement.length || 1));
}

function getQuery(queryParam) {
  queryParam = jsonrepair(queryParam || '');
  let query = null;
  if (queryParam) {
    try {
      query = JSON.parse(queryParam);
      try {
        // iterate over query keys and check, if there is one which should actually be a regex:
        for (const [key, value] of Object.entries(query)) {
          if (typeof value !== 'string') continue;
          const couldBeRegex = (value.match(/\//g) || []).length >= 2; // a regex should have >= 2 slashes
          if (couldBeRegex) {
            const firstSlashIndex = value.indexOf('/');
            const lastSlashIndex = value.lastIndexOf('/');
            const regexOptions = value.substring(lastSlashIndex + 1);
            // we need to remove the first and last slash to create a proper regex
            const regex = value.replaceAt(firstSlashIndex, '').replaceAt((lastSlashIndex - 1), '').replace(regexOptions, '');
            query[key] = new RegExp(regex, regexOptions);
          }
        }
      } catch(regexErr) {
        console.error('getQuery(): Could not properly parse regex:', searchParams.get('query'), regexErr);
      }
    } catch(err) {
      console.error('getQuery(): Could not parse JSON query:', searchParams.get('query'), err);
      query = null;
    }
  }
  return query;
}

export async function GET(req, { params = {} }) {
  const { collection: collectionName } = params;
  const collection = await getCollection(collectionName);
  const { searchParams } = new URL(req.url);
  const getOnlyCount = searchParams.get('getCount') || false;
  const skip = parseInt(searchParams.get('skip')) || 0;
  const limit = parseInt(searchParams.get('limit')) || 20;
  const query = getQuery(searchParams.get('query') || '');
  let count = 0;
  if (!query || Object.keys(query).length === 0) count = await collection.estimatedDocumentCount();
  else count = await collection.countDocuments(query);

  if (getOnlyCount) return NextResponse.json(count);

  // console.log('GET DOCS:', { query, limit, skip });
  const docs = await collection.find(query || {}).limit(limit).skip(skip).toArray();
  return NextResponse.json(docs);
}

export async function DELETE(req, { params = {} }) {
  const { collection: collectionName } = params;
  const collection = await getCollection(collectionName);
  const { searchParams } = new URL(req.url);
  const query = getQuery(searchParams.get('query') || '');
  if (!query || Object.keys(query).length === 0) {
    throw new Error('No query defined');
  }
  const deleteResp = await collection.deleteMany(query);
  return NextResponse.json(deleteResp);
}
