import '../index.css';

export const metadata = {
  title: 'LA',
  description: 'LALALA',
  themeColor: '#ffa52a',
  robots: {
    index: true,
    follow: true
  }
}

export default function Layout({ \Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <div id="modal" />
    </>
  );
}
