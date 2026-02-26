// pages/_app.js
import '../styles/globals.css';
import Layout from '../components/Layout';
import { AuthProvider } from '../utils/AuthContext';

export default function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AuthProvider>
  );
}
