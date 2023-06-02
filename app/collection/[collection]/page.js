'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import PaginationContainer from '@/src/ui/PaginationContainer';
import { useQueryParam, NumberParam, withDefault, JsonParam } from 'use-query-params';
import { Title, Pagination, Flex, JsonInput, Text, ThemeIcon, Button, TextInput, Divider } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

const PAGE_SIZE = 20;

function hashCode(string){
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
      const code = string.charCodeAt(i);
      hash = ((hash<<5)-hash)+code;
      hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

async function getDocuments({ collection, page, query, getCount = false }) {
  const limit = PAGE_SIZE;
  const skip = (page - 1) * limit;
  const searchParams = new URLSearchParams();
  searchParams.set('limit', limit);
  searchParams.set('skip', skip);
  searchParams.set('query', query);
  if (getCount === true) searchParams.set('getCount', true);
  const resp = await fetch(`/api/${collection}?${searchParams.toString()}`);
  const json = await resp.json();
  return json;
}

export default function Collection({ params = {} }) {
  const { collection } = params;
  const [pageParam, setPageParam] = useQueryParam('page', withDefault(NumberParam, 1));
  const [queryParam, setQueryParam] = useQueryParam('query', withDefault(JsonParam, '{}'));

  const [page, setPage] = useState(pageParam);
  const [query, setQuery] = useState(queryParam || null);
  const queryInput = useRef(null);

  const { data: docs, error, isLoading } = useSWR(
    `${collection}-${hashCode(JSON.stringify(query || {}))}-${page}`,
    () => getDocuments({ collection, page, query })
  );  
  const { data: count } = useSWR(
    `${collection}-${hashCode(JSON.stringify(query || {}))}-getCount`,
    () => getDocuments({ collection, page, query, getCount: true })
  );

  function copyToClipboard(text) {
    try {
      navigator?.clipboard?.writeText(text);
      notifications.show({
        message: `Copied _id/link to clipboard.`,
        autoClose: 3000,
        color: 'green',
        icon: (
          <ThemeIcon color="teal" radius="xl">
            <IconCheck size={18} />
          </ThemeIcon>
        )
      });
    } catch(err) {
      console.error(err);
    }
  }

  function onPageChange(page) {
    setPageParam(page);
    setPage(page);
  }
  function onQueryChange(e){
    if (e) e.preventDefault();
    const query = queryInput.current.value;
    onPageChange(1);
    setQueryParam(query);
    setQuery(query);
  }
  function resetQuery(e) {
    if (e) e.preventDefault();
    onPageChange(1);
    queryInput.current.value = '{}';
    setQueryParam('{}');
    setQuery('{}');
  }

  return (
    <main>
      <Flex mb="lg" align="center" justify="space-between">
        <Title order={1}>{collection}</Title>
        <div>
          <Text>Total Count: <b>{count}</b> documents</Text>
        </div>
      </Flex>
      <Flex mb="lg" align="center">
        <TextInput
          ref={queryInput}
          defaultValue={query || '{}'}
          w={800}
          size='md'
          styles={{
            input: {
              fontFamily: "'Courier New', monospace",
              fontWeight: "bold"
            }
          }}
        />
        <Button size="md" ml="sm" color="green" onClick={onQueryChange}>
          Set Query
        </Button>
        <div style={{ margin: 'auto' }} />
        <Button size="md" ml="sm" color="red" onClick={resetQuery}>
          Reset Query
        </Button>
      </Flex>
      <Divider my="xl" />
      <div style={{ paddingBottom: 50 }}> {/* To allow gap at bottom for fixed bottom pagination */}
        { docs?.map((doc) => {
          const label = (
            <Text>_id: <b>{doc._id}</b> | <a onClick={() => copyToClipboard(doc._id)}>Copy _id</a> | <a onClick={() => copyToClipboard(`${location.origin}${location.pathname}/${doc._id}`)}>Copy link</a></Text>
          );
          return (
            <Flex
              key={doc._id}
              align="flex-end"
              justify="space-between"
              mb="xl"
            >
              <JsonInput
                label={label}
                placeholder=""
                validationError="Invalid JSON"
                formatOnBlur
                // autosize
                minRows={4}
                defaultValue={JSON.stringify(doc || {}, null, 2)}
                style={{
                  width: '100%'
                }}
              />
              <Link href={`/collection/${collection}/${doc._id}`}>
                <Button color="dark.3" ml="sm">EDIT</Button>
              </Link>
            </Flex>
          )
        }) }
      </div>
      <PaginationContainer>
        <Pagination color="teal" position="center" value={page} onChange={onPageChange} total={Math.ceil(count / PAGE_SIZE)} />
      </PaginationContainer>
    </main>
  )
}
