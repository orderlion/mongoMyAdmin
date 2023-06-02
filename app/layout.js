'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import NextAdapterApp from 'next-query-params/app';
import {QueryParamProvider} from 'use-query-params';
import { MantineProvider, AppShell, Navbar, Header, Flex, MediaQuery, Text, Image, Footer } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import './globals.css';
import CollectionsList from '../src/ui/CollectionsList';

export default function RootLayout({ children }) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(false);
  }, []);
  return (
    <html lang="en">
      <body>
        <QueryParamProvider adapter={NextAdapterApp}>
          {/* This small if() just makes sure to not render the "ugly" non-Mantine server rendered version coming from nextjs: */}
          { loading ? null :
            <MantineProvider withGlobalStyles withNormalizeCSS>
              <Notifications position="top-right" />
              <AppShell
                padding="xl"
                header={
                  <Header height={80} p="sm">
                    <Flex justify="flex-start" align="center">
                      <Link href="/">
                        <Image height={58} mx="auto" src="/images/logo.png" alt="Logo" />
                      </Link>
                      <div style={{ margin: 'auto' }} />
                      <div>
                        <Text size="sm" align="right">Made with ❤️ in Vienna, by <a href="https://orderlion.com" target="_blank">Orderlion</a>.</Text>
                        <Text size="sm" align="right"><a href="https://github.com/orderlion/mongoMyAdmin" target="_blank">Visit us on Github</a>.</Text>
                      </div>
                    </Flex>
                  </Header>
                }
                navbar={
                  <MediaQuery smallerThan="sm" styles={{ display: 'none' }}>
                    <Navbar p="md" hiddenBreakpoint="sm" width={{ sm: 200, lg: 300 }} >
                      <CollectionsList />
                    </Navbar>
                  </MediaQuery>
                }
                // footer={
                //   <Footer height={60} p="md">
                //     Application footer
                //   </Footer>
                // }
                styles={(theme) => ({
                  main: { backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0] },
                })}
              >
                {children}
              </AppShell>
            </MantineProvider>
          }
        </QueryParamProvider>
      </body>
    </html>
  )
}
