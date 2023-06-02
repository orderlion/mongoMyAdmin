import { NextResponse } from 'next/server';
import _ from 'lodash';
import { getCollections } from '@/src/services/mongodb';

// GLOBAL/HOME LEVEL

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  let resp;
  switch (action) {
    case 'getCollections':
      const collections = await getCollections();
      resp = [];
      for (const coll of collections) {
        const name = coll.collectionName;
        const count = await coll.estimatedDocumentCount();
        resp.push({
          name,
          count
        });
      }
      resp = _.sortBy(resp, ['name'])
  }
  return NextResponse.json(resp);
}
