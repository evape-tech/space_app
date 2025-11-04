import { createGetInitialProps } from "@mantine/next";
import Document, { Head, Html, Main, NextScript } from "next/document";
import Script from 'next/script';

const getInitialProps = createGetInitialProps();

export default class _Document extends Document {
  static getInitialProps = getInitialProps;

  render() {
    return (
      <Html>
        <Head>
          {/* TapPay SDK - 更新至最新版本 v5.19.2 */}
          <Script
          src="https://js.tappaysdk.com/sdk/tpdirect/v5.19.2"
          strategy="afterInteractive"
        />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
