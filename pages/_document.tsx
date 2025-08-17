import { Html, Head, Main, NextScript } from 'next/document';
export default function Document() {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  return (
    <Html lang="fa" dir="rtl">
      <Head>
        {siteKey ? (<script src={`https://www.google.com/recaptcha/api.js?render=${siteKey}`}></script>) : null}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="description" content="TopTenly — تاپ ۱۰ در هر چیز، با رأی کاربران" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
