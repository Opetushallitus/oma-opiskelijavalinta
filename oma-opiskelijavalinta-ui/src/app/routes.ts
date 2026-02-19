import { type RouteConfig, layout, route } from '@react-router/dev/routes';

export default [
  route('/token/:token', './LinkLoginPage.tsx'),
  layout('./HomeLayout.tsx', [route('/', './HomePage.tsx')]),
  route('*', './NotFoundPage.tsx'),
] satisfies RouteConfig;
