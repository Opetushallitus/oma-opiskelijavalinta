import http from 'k6/http';
import { sleep } from 'k6';
import { SharedArray } from 'k6/data';

export const options = {
  vus: 1, // or higher for multi-user load
  iterations: 10, // for testing, adjust later
};

// --- Load user tokens from JSON file ---
const users = new SharedArray('users', function () {
  return JSON.parse(open('./users.json'));
});

const BASE = 'https://untuvaopintopolku.fi';
const OMA_OPISKELIJAVALINTA = `${BASE}/oma-opiskelijavalinta`;

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

export default function () {
  // --- Pick user for this iteration (round-robin) ---
  const user = users[__ITER % users.length];

  const jsession = login(user.token);
  if (!jsession) return;

  console.log(`Login successful, JSESSIONID: ${jsession}`);

  // user oma-opiskelijavalinta/api/user
  const userRes = http.get(`${OMA_OPISKELIJAVALINTA}/api/user`)
  console.log('user status:', userRes.status);

  // --- /hakemukset call ---
  const hakemuksetRes = http.get(`${OMA_OPISKELIJAVALINTA}/api/hakemukset`);
  console.log('hakemukset status:', hakemuksetRes.status);


  if (hakemuksetRes.status !== 200) return;

  let hakemusOid, hakuOid, hakukohdeOid;

  try {

    const data = JSON.parse(hakemuksetRes.body);

    if (data.current && data.current.length > 0) {
      hakemusOid = data.current[0].oid;
      hakuOid = data.current[0].haku.oid;
      hakukohdeOid = data.current[0].hakukohteet[0].oid;

      console.log('Parsed IDs:', { hakemusOid, hakuOid, hakukohdeOid });
    } else {
      console.warn('No current hakemukset found');
      return;
    }
  } catch (e) {
    console.error('Failed to parse hakemukset:', e);
    return;
  }


  // --- session poll ---
  const sessionRes = http.get(`${OMA_OPISKELIJAVALINTA}/api/session`);
  console.log('session status:', sessionRes.status);

  // --- valintatulos ---
  const valintatulosRes = http.get(
    `${OMA_OPISKELIJAVALINTA}/api/valintatulos/hakemus/${hakemusOid}/haku/${hakuOid}`
  );
  console.log('valintatulos status:', valintatulosRes.status);

  if (__ITER === 0) {
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

    console.log('vastaanotto status:', vastaanotto.status);
    if (vastaanotto.status !== 200) {
      console.error('vastaanotto failed:', vastaanotto.status, vastaanotto.body);
    }
  }

  const logoutRes = http.get(`${OMA_OPISKELIJAVALINTA}/api/session`)
  console.log('logout status:', logoutRes.status);

  sleep(Math.random()*0.1);
}
