'use client';

import React, { useState, useEffect } from 'react';
import { Loader, List, ThemeIcon, useMantineTheme, Navbar, ScrollArea } from '@mantine/core';
import { IconArchive } from '@tabler/icons-react'; // https://tabler-icons.io/
import Link from 'next/link';
import useSWR from 'swr';

async function loadCollections() {
  const resp = await fetch(`/api?action=getCollections`);
  const json = await resp.json();
  return json;
}

export default function CollectionsList({ params }) {
  const theme = useMantineTheme();
  const { data, error, isLoading } = useSWR('getCollections', loadCollections);
  // console.log('CollectionsList', { data, error, isLoading });
  if (isLoading) return <Loader color="green" size="sm" style={{ margin: 'auto' }} />;
  return (
    <>
      <h4 style={{ marginBottom: theme.spacing.md }}>Collections:</h4>
      <Navbar.Section grow component={ScrollArea} mx="-xs" px="xs">
        <List
          spacing="xs"
          size="sm"
          center
          icon={
            <ThemeIcon color="teal" size={18} radius="xl">
              <IconArchive size={14} />
            </ThemeIcon>
          }
        >
          { data.map(({ name, count }) => (
            <List.Item key={`coll-${name}`}>
              <Link href={`/collection/${name}`}><b>{name}</b> ({count})</Link>
            </List.Item>
          )) }
        </List>
      </Navbar.Section>
    </>
  )
}
