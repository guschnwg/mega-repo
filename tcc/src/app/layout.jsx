import '../index.css';

export const metadata = {
  title: 'Descubra o País',
  description: 'LALALA',
  themeColor: '#ffa52a',
};

export default function Layout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}

        <div id="modal" />
      </body>
    </html>
  );
}
