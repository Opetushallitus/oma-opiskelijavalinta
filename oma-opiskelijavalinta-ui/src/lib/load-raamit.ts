let raamitInjected = false;

export function loadRaamit() {
  if (raamitInjected) return; // skip if already done
  raamitInjected = true;
  // Wait until window.Service exists, then inject raamit scripts dynamically
  const tryLoad = () => {
    if (typeof window.Service !== 'undefined') {
      const raamitScript = document.createElement('script');
      raamitScript.src = '/oppija-raamit/js/apply-raamit.js';
      raamitScript.defer = true;
      document.body.appendChild(raamitScript);

      const cookieModalScript = document.createElement('script');
      cookieModalScript.src = '/oppija-raamit/js/apply-modal.js';
      cookieModalScript.defer = true;
      document.body.appendChild(cookieModalScript);
    } else {
      setTimeout(tryLoad, 100); // check again in 100ms
    }
  };

  tryLoad();
}
