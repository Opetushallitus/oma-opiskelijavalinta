import http from 'k6/http';
import { sleep } from 'k6';
import { SharedArray } from 'k6/data';

const TEST_TYPE = __ENV.TEST_TYPE || 'smoke';
const ENV = __ENV.ENVIRONMENT || 'pallero';

const config = {
  untuva: {
    toinenasteUsersFile: './users-untuva.json',
    kkUsersFile: './kk-users-untuva.json',
    baseUrl: 'https://untuvaopintopolku.fi',
  },
  hahtuva: {
    toinenasteUsersFile: './users-hahtuva.json',
    kkUsersFile: './kk-users-hahtuva.json',
    baseUrl: 'https://hahtuvaopintopolku.fi',
  },
  pallero: {
    toinenasteUsersFile: './users-pallero.json',
    kkUsersFile: './kk-users-pallero.json',
    baseUrl: 'https://testiopintopolku.fi',
  },
};

const selected = config[ENV];

if (!selected) {
  throw new Error(`Unknown environment: ${ENV}`);
}

const toinenasteUsers = new SharedArray('2aste users', () =>
  JSON.parse(open(selected.toinenasteUsersFile))
  .filter(u => u.token && u.token.length > 0) // just in case
);

const kkUsers = new SharedArray('kk users', () =>
  JSON.parse(open(selected.kkUsersFile))
  .filter(u => u.token && u.token.length > 0) // just in case
);

const BASE = selected.baseUrl;
const OMA_OPISKELIJAVALINTA = `${BASE}/oma-opiskelijavalinta`;

/**
 * -----------------------
 * SCENARIO SELECTION
 * -----------------------
 */
export const options = (() => {
  switch (TEST_TYPE) {

    case 'smoke':
      return {
        scenarios: {
          smoke_toinenaste: {
            executor: 'shared-iterations',
            vus: 3,
            iterations: 9, // 3 users × 3 iterations
            exec: 'toinenAsteFlow',
          },

          smoke_kk: {
            executor: 'shared-iterations',
            vus: 3,
            iterations: 9,
            exec: 'kkFlow',
          },
        },
      };

    case 'smoke-spike':
      return {
        scenarios: {
          toinenaste_spike: {
            executor: 'ramping-vus',
            exec: 'toinenAsteFlow',
            startVUs: 50,
            stages: [
              { duration: "30s", target: 100 },
              { duration: "2m", target: 200 },
              { duration: "1m", target: 200 },
              { duration: "30s", target: 0 },
            ],
          },
          kk_background: {
            executor: 'constant-vus',
            exec: 'kkFlow',
            vus: 50,
            duration: '3m',
          },
        },
      };

    case 'baseline':
      return {
        scenarios: {
          toinenaste_flow: {
            executor: 'ramping-vus',
            exec: 'toinenAsteFlow',
            startVUs: 10,
            stages: [
              { duration: '5m', target: 100 },
              { duration: '10m', target: 200 },
              { duration: '5m', target: 100 },
            ],
          },
          kk_flow: {
            executor: 'constant-vus',
            exec: 'kkFlow',
            vus: 50,
            duration: '20m',
          },
        },
      };

    case 'overnight':
      return {
        scenarios: {
          toinenaste_flow: {
            executor: 'constant-vus',
            exec: 'toinenAsteFlow',
            vus: 100,
            duration: "8h",
          },
          kk_flow: {
            executor: 'constant-vus',
            exec: 'kkFlow',
            vus: 50,
            duration: '8h',
          },
        },
        thresholds: {
          // Performance stability
          http_req_duration: [
            "p(90)<1500",   // 95% under 1.5s
            "p(95)<3000",   // 99% under 3s
          ],
          // Server health indicator
          http_reqs: [
            "rate>10",      // sanity check: system still processing requests
          ],
        },
      }
    case 'spike':
      return {
        scenarios: {
          toinenaste_spike: {
            executor: 'ramping-vus',
            exec: 'toinenAsteFlow',
            startVUs: 50,
            stages: [
              { duration: '30s', target: 200 },
              { duration: '1m', target: 1000 },
              { duration: '30s', target: 1500 },
              { duration: '1m', target: 0 },
            ],
          },
          kk_background: {
            executor: 'constant-vus',
            exec: 'kkFlow',
            vus: 100,
            duration: '3m',
          },
        },
      };

    case 'stress':
      return {
        scenarios: {
          toinenaste_stress: {
            executor: 'ramping-vus',
            exec: 'toinenAsteFlow',
            stages: [
              { duration: '2m', target: 300 },
              { duration: '2m', target: 600 },
              { duration: '2m', target: 1000 },
              { duration: '2m', target: 1500 },
              { duration: '2m', target: 2000 },
            ],
          },
          kk_stress: {
            executor: 'constant-vus',
            exec: 'kkFlow',
            vus: 100,
            duration: '10m',
          },
        },
      };

    case 'breakpoint':
      return {
        scenarios: {
          toinenaste_break: {
            executor: 'ramping-vus',
            exec: 'toinenAsteFlow',
            stages: [
              { duration: '2m', target: 300 },
              { duration: '2m', target: 600 },
              { duration: '2m', target: 1000 },
              { duration: '2m', target: 1500 },
              { duration: '2m', target: 2000 },
              { duration: '2m', target: 2500 },
              { duration: '2m', target: 3000 },
            ],
          },
          kk_break: {
            executor: 'constant-vus',
            exec: 'kkFlow',
            vus: 200,
            duration: '15m',
          },
        },
      };

    default:
      throw new Error(`Unknown TEST_TYPE: ${TEST_TYPE}`);
  }
})();


export function toinenAsteFlow() {
  const user = toinenasteUsers[__ITER % toinenasteUsers.length];

  runScenario(user, true);
}

export function kkFlow() {
  const user = kkUsers[__ITER % kkUsers.length];

  runScenario(user, false);
}

function login(token) {
  const res = http.post(`${OMA_OPISKELIJAVALINTA}/api/link-login?token=${token}`);

  if (res.status !== 200) {
    console.error('Login failed:', res.status, res.body);
    return null;
  }

  const jsession = res.headers['Set-Cookie']
    ? res.headers['Set-Cookie'].match(/JSESSIONID=([^;]+)/)[1]
    : null;

  if (!jsession) {
    console.error('No JSESSIONID returned');
    return null;
  }

  const jar = http.cookieJar();
  jar.set(BASE, 'JSESSIONID', jsession);
  return jsession;
}

export default function runScenario(user, toinenaste)  {

  const jsession = login(user.token);
  if (!jsession) return;

  //console.log(`Login successful, JSESSIONID: ${jsession}`);

  // user oma-opiskelijavalinta/api/user
  const userRes = http.get(`${OMA_OPISKELIJAVALINTA}/api/user`)
  //console.log('user status:', userRes.status);

  // --- /hakemukset call ---
  const hakemuksetRes = http.get(`${OMA_OPISKELIJAVALINTA}/api/hakemukset`);
  //console.log('hakemukset status:', hakemuksetRes.status);


  if (hakemuksetRes.status !== 200) return;

  let hakemusOid, hakuOid, hakukohdeOid;

  try {

    const data = JSON.parse(hakemuksetRes.body);

    if (!data.current?.length) return;

    const current = data.current[0];

    hakemusOid = current.oid;
    hakuOid = current.haku.oid;
    const acceptedHakemukset = current.hakemuksenTulokset
    .filter(r => r.vastaanotettavuustila === 'VASTAANOTETTAVISSA_SITOVASTI');

    if (!acceptedHakemukset.length) return;

    const accepted = acceptedHakemukset[__ITER % acceptedHakemukset.length];
    hakukohdeOid = accepted.hakukohdeOid;
  } catch (e) {
    //console.error('Failed to parse hakemukset:', e);
    return;
  }

  // --- session poll ---
  const sessionRes = http.get(`${OMA_OPISKELIJAVALINTA}/api/session`);
  //console.log('session status:', sessionRes.status);

  // --- valintatulos ---
  const valintatulosRes = http.get(
    `${OMA_OPISKELIJAVALINTA}/api/valintatulos/hakemus/${hakemusOid}/haku/${hakuOid}`
  );
  //console.log('valintatulos status:', valintatulosRes.status);

  if (__ITER === 0 && toinenaste === true) {
    const vastaanotto = http.post(
      `${OMA_OPISKELIJAVALINTA}/api/vastaanotto/hakemus/${hakemusOid}/hakukohde/${hakukohdeOid}`,
      JSON.stringify({
        vastaanotto: 'VastaanotaSitovasti',
        hakuOid: hakuOid,
        vastaanottoKaannosAvain: 'vastaanotto.vaihtoehdot.vastaanota',
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }
    );

    //console.log('vastaanotto status:', vastaanotto.status);
    if (vastaanotto.status !== 200) {
      console.error('vastaanotto failed:', vastaanotto.status, vastaanotto.body);
    }
    const ilmoittautuminen = http.post(
      `${OMA_OPISKELIJAVALINTA}/api/ilmoittautuminen/hakemus/${hakemusOid}/hakukohde/${hakukohdeOid}`,
      JSON.stringify({
        ilmoittautuminen: 'LASNA_KOKO_LUKUVUOSI',
        hakuOid: hakuOid,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }
    );

    //console.log('ilmoittautuminen status:', vastaanotto.status);
    if (ilmoittautuminen.status !== 200) {
      console.error('ilmoittautuminen failed:', ilmoittautuminen.status, ilmoittautuminen.body);
    }
  }

  const logoutRes = http.get(`${OMA_OPISKELIJAVALINTA}/api/session`)
  //console.log('logout status:', logoutRes.status);

  sleep(Math.random()*0.1);
}
