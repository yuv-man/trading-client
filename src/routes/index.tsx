import { Routes, Route } from 'react-router-dom';
import { routes } from './routes';
import { Navigation } from '../components/Navigation/Navigation';
import { Layout } from '../components/Layout/Layout';

export function AppRoutes() {
  return (
    <>
      <Navigation />
      <Layout>
        <Routes>
          {routes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={route.element}
            />
          ))}
        </Routes>
      </Layout>
    </>
  );
}