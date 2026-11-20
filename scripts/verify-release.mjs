// Verify public release markers without reading account credentials.
const [sourceCommit, ...origins] = process.argv.slice(2);
if (!/^[a-f0-9]{40}$/.test(sourceCommit ?? '') || origins.length === 0) {
  console.error('用法：node scripts/verify-release.mjs <完整源码 SHA> <网站地址> [网站地址...]');
  process.exit(1);
}

async function verifyRelease(origin) {
  const url = new URL('/release.json', origin);
  if (!['https:', 'http:'].includes(url.protocol)) throw new Error(`不支持的网站地址：${origin}`);
  // gh-pages pushes trigger a separate Pages build before the CDN can serve it.
  const attempts = url.hostname === 'caliyang.cn' ? 30 : 6;
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    url.searchParams.set('source', sourceCommit);
    url.searchParams.set('check', `${Date.now()}-${attempt}`);
    try {
      const options = {
        cache: 'no-store',
        redirect: 'manual',
        headers: { 'Cache-Control': 'no-cache', Accept: 'application/json' },
        signal: AbortSignal.timeout(15000),
      };
      let response = await fetch(url, options);
      if (url.hostname === 'caliyang.dpdns.org') {
        const expected = new URL(url);
        expected.host = 'caliyang.cn';
        if (response.status !== 301 || response.headers.get('location') !== expected.href) {
          throw new Error('旧网址未按原路径与查询参数跳至新域名');
        }
        response = await fetch(expected, options);
      }
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const release = await response.json();
      if (release.sourceCommit !== sourceCommit) {
        throw new Error(`线上源码版本为 ${release.sourceCommit ?? '缺失'}，预期 ${sourceCommit}`);
      }
      console.log(`✅ ${new URL(origin).origin}：${sourceCommit}`);
      return;
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  throw new Error(`${new URL(origin).origin} 未通过线上版本核验：${lastError.message}`);
}

const results = await Promise.allSettled(origins.map(verifyRelease));
const failures = results.filter(result => result.status === 'rejected');
for (const failure of failures) console.error(`❌ ${failure.reason.message}`);
if (failures.length > 0) process.exit(1);
