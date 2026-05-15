import { type RouteConfig, layout, route } from '@react-router/dev/routes';

export default [
  layout('./LinkLoginLayout.tsx', [
    route('/token/:token', './LinkLoginPage.tsx'),
  ]),
  layout('./HomeLayout.tsx', [route('/', './HomePage.tsx')]),
  layout('./SessionExpiredLayout.tsx', [
    route('/session-expired', './SessionExpiredPage.tsx'),
  ]),
  layout('./ErrorLayout.tsx', [
    route('/link-error', './LinkErrorPage.tsx'),
    route('/error', '../components/GenericErrorPage.tsx'),
  ]),
  layout('./NotFoundLayout.tsx', [route('*', './NotFoundPage.tsx')]),
] satisfies RouteConfig;
