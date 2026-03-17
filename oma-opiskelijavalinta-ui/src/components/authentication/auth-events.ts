let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: () => void) {
  unauthorizedHandler = handler;
}

export function notifyUnauthorized() {
  console.log('notifyUnauthorized called');
  unauthorizedHandler?.();
}
