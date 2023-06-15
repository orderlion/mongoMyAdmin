'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { jsonrepair } from 'jsonrepair';
import PaginationContainer from '@/src/ui/PaginationContainer';
import { useQueryParam, NumberParam, withDefault, JsonParam } from 'use-query-params';
import { useDisclosure, getHotkeyHandler } from '@mantine/hooks';
import { Title, Pagination, Flex, JsonInput, Text, ThemeIcon, Button, TextInput, Divider, Stack, Modal } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import useNotifications from '@/src/ui/useNotifications';

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

  const notifications = useNotifications();
  const [confirmModalOpened, { open: openConfirmModal, close: closeConfirmModal }] = useDisclosure(false);

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

  async function deleteAllDocuments(e) {
    if (e) e.preventDefault();
    try {
      const searchParams = new URLSearchParams();
      searchParams.set('query', query);
      const resp = await fetch(`/api/${collection}?${searchParams.toString()}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      const deleteResp = await resp.json();
      console.log('deleteResp', deleteResp);
      closeConfirmModal();
      notifications.success(`Documents deleted successfully!`);
      resetQuery();
    } catch(err) {
      console.error(err);
      notifications.error(`Something went wrong! Check the console!`);
    }
  }

  function onPageChange(page) {
    setPageParam(page);
    setPage(page);
  }
  function onQueryChange(e){
    if (e) e.preventDefault();
    const query = jsonrepair(queryInput.current.value || '');
    queryInput.current.value = query;
    onPageChange(1);
    setQueryParam(query);
    setQuery(query);
  }
  function resetQuery(e) {
    if (e) e.preventDefault();
    queryInput.current.value = '{}';
    setQueryParam('{}');
    setQuery('{}');
    onPageChange(1);
  }

  return (
    <main>
      <Flex mb="lg" align="center" justify="space-between">
        <Title order={1}>{collection}</Title>
        <div>
          <Text>Total Count: <b>{count}</b> documents</Text>
        </div>
      </Flex>
      <Flex mb="lg" align="flex-start">
        <TextInput
          ref={queryInput}
          defaultValue={query || '{}'}
          w={800}
          size='md'
          onKeyDown={getHotkeyHandler([
            ['Enter', onQueryChange],
          ])}
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
        {query !== '{}' ? (
          <Stack align="center" ml="sm">
            <Button size="md" color="red" onClick={resetQuery}>
              Reset Query
            </Button>
            <Button variant="subtle" color="red" size="xs" onClick={openConfirmModal}>
              Delete all documents
            </Button>
          </Stack>
        ) : null}
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
      <Modal opened={confirmModalOpened} onClose={closeConfirmModal} title="Are you sure?" centered>
        <Text size="md">Do you want to delete ALL documents matching this query?</Text>
        <Flex mt="lg" align="center" justify="space-between">
          <Button size="sm" color="gray" onClick={closeConfirmModal}>
            Cancel
          </Button>
          <Button size="sm" color="red" onClick={deleteAllDocuments}>
            DELETE
          </Button>
        </Flex>
      </Modal>
      <PaginationContainer>
        <Pagination color="teal" position="center" value={page} onChange={onPageChange} total={Math.ceil(count / PAGE_SIZE)} />
      </PaginationContainer>
    </main>
  )
}
