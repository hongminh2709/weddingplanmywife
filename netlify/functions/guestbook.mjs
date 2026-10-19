function json(body, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

function isPublicKey(key) {
  if (key.startsWith('sb_publishable_')) return true;
  try {
    const parts = key.split('.');
    return parts.length === 3 && JSON.parse(Buffer.from(parts[1], 'base64url').toString()).role === 'anon';
  } catch {
    return false;
  }
}

export default async function guestbook(request) {
  if (request.method !== 'GET' && request.method !== 'POST') {
    return json({ error: 'Phương thức không được hỗ trợ.' }, 405);
  }

  const key = (process.env.SUPABASE_PUBLISHABLE_KEY || '').trim();
  let url;
  try {
    url = new URL(process.env.SUPABASE_URL);
    if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash || !isPublicKey(key)) throw new Error();
  } catch {
    return json({ error: 'Sổ lưu bút hiện không khả dụng.' }, 503);
  }

  const headers = { apikey: key };
  const options = { method: request.method, headers, redirect: 'error' };
  let path = '/rest/v1/guestbook?select=id,name,message,timestamp&order=timestamp.desc&limit=100';
  if (request.method === 'POST') {
    let body;
    try {
      const text = await request.text();
      if (text.length > 16000) throw new Error();
      body = JSON.parse(text);
    } catch {
      return json({ error: 'Dữ liệu không hợp lệ.' }, 400);
    }
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const message = typeof body?.message === 'string' ? body.message.trim() : '';
    if (!name || !message || Array.from(name).length > 100 || Array.from(message).length > 2000) {
      return json({ error: 'Tên hoặc lời chúc không hợp lệ.' }, 400);
    }
    path = '/rest/v1/guestbook';
    headers['Content-Type'] = 'application/json';
    headers.Prefer = 'return=minimal';
    options.body = JSON.stringify({ name, message });
  }

  try {
    const response = await fetch(new URL(path, url), options);
    if (!response.ok) return json({ error: 'Không thể truy cập sổ lưu bút.' }, 502);
    return request.method === 'GET' ? json({ comments: await response.json() }) : json({ stored: true });
  } catch {
    return json({ error: 'Không thể truy cập sổ lưu bút.' }, 502);
  }
}
