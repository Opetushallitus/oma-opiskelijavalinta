export function loadRaamit() {
  // Wait until window.Service exists, then inject raamit scripts dynamically
  const tryLoad = () => {
    if (typeof window.Service !== 'undefined') {
      console.debug('window.Service available, loading Raamit scripts...');
      const raamitScript = document.createElement('script');
      raamitScript.src = '/oppija-raamit/js/apply-raamit.js';
      raamitScript.defer = true;
      document.body.appendChild(raamitScript);

      const cookieModalScript = document.createElement('script');
      cookieModalScript.src = '/oppija-raamit/js/apply-modal.js';
      cookieModalScript.defer = true;
      document.body.appendChild(cookieModalScript);
    } else {
      console.debug('waiting for window.Service...');
      setTimeout(tryLoad, 100); // check again in 100ms
    }
  };

  tryLoad();
}
