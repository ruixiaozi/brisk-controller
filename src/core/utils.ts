import Router from 'koa-router';
import { BRISK_CONTROLLER_METHOD_E } from '../types';

export function getRouteMethod(method: BRISK_CONTROLLER_METHOD_E, router: Router) {
  let routeMethod = router.get;
  switch (method) {
    case BRISK_CONTROLLER_METHOD_E.GET:
      routeMethod = router.get;
      break;
    case BRISK_CONTROLLER_METHOD_E.POST:
      routeMethod = router.post;
      break;
    case BRISK_CONTROLLER_METHOD_E.PUT:
      routeMethod = router.put;
      break;
    case BRISK_CONTROLLER_METHOD_E.DELETE:
      routeMethod = router.delete;
      break;
    default:
      routeMethod = router.get;
      break;
  }
  return routeMethod.bind(router);
}

export function parseBoolean(value: string) {
  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return undefined;
}

export function isValid(value: any) {
  return value !== null && value !== undefined && value !== '';
}

