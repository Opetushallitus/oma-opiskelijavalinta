import { type RouteConfig, layout, route } from '@react-router/dev/routes';

export default [
  layout('./LinkLoginLayout.tsx', [
    route('/token/:token', './LinkLoginPage.tsx'),
  ]),
  layout('./HomeLayout.tsx', [route('/', './HomePage.tsx')]),
  layout('./LoggedOutLayout.tsx', [
    route('/logged-out', './LoggedOutPage.tsx'),
  ]),
  route('*', './NotFoundPage.tsx'),
] satisfies RouteConfig;
