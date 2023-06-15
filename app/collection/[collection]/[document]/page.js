'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import Editor from '@monaco-editor/react';
import { useRouter } from 'next/navigation';
import { useDisclosure } from '@mantine/hooks';
import { Title, Text, ThemeIcon, Loader, Button, Flex, Modal } from '@mantine/core';
import { jsonrepair } from 'jsonrepair';
import useNotifications from '@/src/ui/useNotifications';

async function getDocument({ collection, _id }) {
  const resp = await fetch(`/api/${collection}/${_id}`);
  const document = await resp.json();
  return document;
}

export default function Document({ params }) {
  const { collection, document: _id } = params;
  const router = useRouter();
  const notifications = useNotifications();

  const [confirmModalOpened, { open: openConfirmModal, close: closeConfirmModal }] = useDisclosure(false);

  const { data: document, error, isLoading } = useSWR(
    `${collection}-${_id}`,
    () => getDocument({ collection, _id })
  );
  const [documentStr, setDocumentStr] = useState(JSON.stringify(document || {}, null, 2));
  useEffect(() => {
    if (!isLoading && document) {
      setDocumentStr(JSON.stringify(document || {}, null, 2));
    }
  }, [isLoading, document]);

  function copyToClipboard(text) {
    try {
      navigator?.clipboard?.writeText(text);
      notifications.success(`Copied _id/link to clipboard.`);
    } catch(err) {
      console.error(err);
    }
  }

  function saveDocument(e) {
    if (e) e.preventDefault();
    try {
      const newDoc = JSON.parse(jsonrepair(documentStr));
      saveNewDocument(newDoc);      
    } catch(err) {
      console.error(err);
      notifications.error(`Something went wrong! Is your JSON correct? Check the console!`);
    }
  }

  function deleteDocument(e) {
    if (e) e.preventDefault();
    saveNewDocument(null, 'DELETE');
  }

  async function saveNewDocument(newDoc, method = 'POST') {
    try {
      const resp = await fetch(`/api/${collection}/${_id}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDoc)
      });
      const updateResp = await resp.json();
      console.log('updateResp', updateResp);
      if (method === 'DELETE') {
        closeConfirmModal();
        notifications.success(`Document deleted successfully!`);
        router.back();
      } else {
        notifications.success(`Document saved successfully!`);
      }
    } catch(err) {
      console.error(err);
      notifications.error(`Something went wrong! Check the console!`);
    }
  }

  return (
    <>
      <Flex mb="lg" align="center" justify="space-between">
        <div>
          <Title order={2}>{_id}</Title>
          <Text mb="xl">
            <a onClick={() => router.back()}><b>&laquo; BACK</b></a> | <a onClick={() => copyToClipboard(_id)}>Copy _id</a> | <a onClick={() => copyToClipboard(location.href)}>Copy link</a>
          </Text>
        </div>
        <div>
          <Button size="sm" ml="sm" color="red" onClick={openConfirmModal}>
            Delete document
          </Button>
        </div>
      </Flex>
      { isLoading && <Loader color="green" size="sm" style={{ margin: 'auto' }} /> }
      { error && <pre>{error}</pre> }
      { !isLoading && !error && (
        <>
          <div style={{ border: '0.0625rem solid #e9ecef' }}>
            <Editor
              height="60vh"
              defaultLanguage="json"
              value={documentStr}
              onChange={setDocumentStr}
            />
          </div>
          <Flex mt="md" align="flex-start">
            <Text size="sm">Tip: We add JSON quotation marks for you - go for it!</Text>
            <div style={{ margin: 'auto' }} />
            <Button color="green" size="lg" onClick={saveDocument}>Save Changes</Button>
          </Flex> 
        </>
      )}
      <Modal opened={confirmModalOpened} onClose={closeConfirmModal} title="Are you sure?" centered>
        <Text size="md">Do you want to delete this document?</Text>
        <Flex mt="lg" align="center" justify="space-between">
          <Button size="sm" color="gray" onClick={closeConfirmModal}>
            Cancel
          </Button>
          <Button size="sm" color="red" onClick={deleteDocument}>
            DELETE
          </Button>
        </Flex>
      </Modal>
    </>
  )
}
