import http from 'k6/http';
import { sleep } from 'k6';
import { SharedArray } from 'k6/data';

export const options = {
  scenarios: {
    toinenaste_flow: {
      executor: 'ramping-vus',
      exec: 'toinenAsteFlow',
      startVUs: 50,
      stages: [
        { duration: '5m', target: 300 },
        { duration: '10m', target: 800 },
        { duration: '5m', target: 0 },
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
/*
apin toimivuus kuormassa
stages: [
  { duration: '5m', target: 100 },
  { duration: '10m', target: 200 },
  { duration: '5m', target: 100 },
]
missä kohtaa alkaa virheillä
stages: [
  { duration: '5m', target: 300 },
  { duration: '10m', target: 800 },
  { duration: '10m', target: 1200 },
]
mitä tämä kestää
stages: [
  { duration: '2m', target: 300 },
  { duration: '2m', target: 600 },
  { duration: '2m', target: 1000 },
  { duration: '2m', target: 1500 },
  { duration: '2m', target: 2000 },
]
spike test
scenarios: {
    toinenaste_spike: {
      executor: 'ramping-vus',
      exec: 'toinenAsteFlow',
      startVUs: 50,
      stages: [
        { duration: '30s', target: 200 },
        { duration: '1m', target: 1000 },  // spike up fast
        { duration: '30s', target: 1500 }, // extreme spike
        { duration: '1m', target: 0 },     // sudden drop
      ],
    },

    kk_spike: {
      executor: 'constant-vus',
      exec: 'kkFlow',
      vus: 200,
      duration: '3m', // short background noise during spike
    },
  },
};
 */
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

    if (data.current && data.current.length > 0) {
      hakemusOid = data.current[0].oid;
      hakuOid = data.current[0].haku.oid;
      hakukohdeOid = data.current[0].hakukohteet[0].oid;

      //console.log('Parsed IDs:', { hakemusOid, hakuOid, hakukohdeOid });
    } else {
      //console.warn('No current hakemukset found');
      return;
    }
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
      console.error('ilmoittautuminen failed:', vastaanotto.status, vastaanotto.body);
    }
  }

  const logoutRes = http.get(`${OMA_OPISKELIJAVALINTA}/api/session`)
  //console.log('logout status:', logoutRes.status);

  sleep(Math.random()*0.1);
}
