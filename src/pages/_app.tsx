// src/pages/_app.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Xpectre Wallet — App Shell
// - Full dark background (#121921) with decorative gold radial glow
// - ContextProvider wraps all Solana wallet adapters + network config
// - Notifications (toast) system from scaffold
// ─────────────────────────────────────────────────────────────────────────────

import { AppProps } from 'next/app';
import Head from 'next/head';
import { FC, useEffect } from 'react';
import { ContextProvider } from '../contexts/ContextProvider';
import Notifications from '../components/Notification';

require('@solana/wallet-adapter-react-ui/styles.css');
require('../styles/globals.css');

const App: FC<AppProps> = ({ Component, pageProps }) => {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.location.protocol === 'http:' &&
      !['localhost', '127.0.0.1'].includes(window.location.hostname)
    ) {
      window.location.href = window.location.href.replace('http:', 'https:');
    }
  }, []);

  return (
    <>
      <Head>
        <title>Xpectre Wallet</title>
        <meta name="description" content="Xpectre Labs — Solana Web3 Wallet Dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <ContextProvider>
        {/* Root shell: Quitamos el 'relative' y actualizamos el fondo al de tu Figma */}
        <div className="min-h-screen flex flex-col font-sans" style={{ backgroundColor: '#121921', color: '#f0f4f8' }}>

          {/* Decorative gold radial glow: Quitamos el z-0 innecesario */}
          <div
            aria-hidden="true"
            className="fixed top-0 left-0 right-0 w-full h-[500px] pointer-events-none"
            style={{
              background: 'radial-gradient(circle at top center, rgba(222, 160, 1, 0.1) 0%, transparent 70%)',
            }}
          />

          {/* Toast notifications */}
          <Notifications />

          {/* Active page: ¡Adiós a la cárcel del 'relative z-[1]'! */}
          <div className="flex-1 w-full flex flex-col">
            <Component {...pageProps} />
          </div>

        </div>
      </ContextProvider>
    </>
  );
};

export default App;