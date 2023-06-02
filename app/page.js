'use client';

import { Title, Text } from '@mantine/core';

export default function Home({ params }) {
  return (
    <>
      <Title order={1} mb="xl">WELCOME</Title>
      <Text mb="xl">
        This is supposed to be an easy to use admin tool to manage your MongoDB.<br/>
        Please start by selecting one of your collections on the left.
      </Text>
      <Text size="sm">Made with ❤️ in Vienna, by <a href="https://orderlion.com" target="_blank">Orderlion</a>.</Text>
      <Text size="sm"><a href="https://github.com/orderlion/mongoMyAdmin" target="_blank">Visit us on Github</a>.</Text>
    </>
  )
}
