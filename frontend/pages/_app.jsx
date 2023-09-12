import '../styles/globals.scss';
import { ConfigProvider } from 'antd';
import ExploredBreedsProvider from './context/exploredBreeds.context';
import TourProvider from './context/tour.context';
import SwiperProvider from './context/swiper.context';
import ModalsProvider from './context/modals.context';
import GlobalProvider from './context/global.context';
import AuthProvider from './context/auth.context';
import BackendProvider from './context/backend.context';

export default function App({ Component, pageProps }) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#00BC6B'
        }
      }}>
      <GlobalProvider>
        <AuthProvider>
          <BackendProvider>
            <SwiperProvider>
              <ExploredBreedsProvider>
                <ModalsProvider>
                  <TourProvider>
                    <Component {...pageProps} />
                  </TourProvider>
                </ModalsProvider>
              </ExploredBreedsProvider>
            </SwiperProvider>
          </BackendProvider>
        </AuthProvider>
      </GlobalProvider>
    </ConfigProvider>
  );
}
