import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Layout from '../components/Layout';
import { Vazirmatn } from 'next/font/google';
const vazir = Vazirmatn({ subsets: ['arabic'], variable: '--font-vazir' });
export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={vazir.className}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </div>
  );
}
