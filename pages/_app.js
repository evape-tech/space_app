import '../styles/globals.css'
import { MantineProvider } from '@mantine/core';
import { SessionProvider } from "next-auth/react";
import { RecoilRoot } from 'recoil';

function MyApp({ Component, pageProps }) {
  const getLayout = Component.getLayout || ((page) => page)
  return (<SessionProvider session={pageProps.session}>
    {getLayout(
      <RecoilRoot>
        <MantineProvider
          withGlobalStyles
          withNormalizeCSS
          theme={{
            /** Put your mantine theme override here */
            colorScheme: 'light',
            primaryColor: 'green'
          }}
        >
          <Component {...pageProps} />
        </MantineProvider>
      </RecoilRoot>
    )}
  </SessionProvider>)
}

export default MyApp
