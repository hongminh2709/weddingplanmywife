

function supabaseConfig() {
  const key = (process.env.SUPABASE_PUBLISHABLE_KEY || '').trim();
  let publicKey = key.startsWith('sb_publishable_');
  if (!publicKey) {
    try { publicKey = JSON.parse(Buffer.from(key.split('.')[1], 'base64url')).role === 'anon'; } catch {}
  }
  try {
    const url = new URL(process.env.SUPABASE_URL);
    if (!publicKey || url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) return null;
    return { url, key };
  } catch { return null; }
}

async function rpc(name, args) {
  const config = supabaseConfig();
  if (!config) return { error: 503 };
  try {
    const response = await fetch(new URL('/rest/v1/rpc/' + name, config.url), {
      method: 'POST', redirect: 'error',
      headers: { apikey: config.key, 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
    });
    if (!response.ok) return { error: 502 };
    return { value: await response.json() };
  } catch { return { error: 502 }; }
}

function jsonError(message, status) {
  return Response.json({ error: message }, { status, headers: { 'Cache-Control': 'no-store' } });
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

function guestFromCode(code) {
  if (!code || !/^[A-Za-z0-9_-]+$/.test(code) || code.length > 640) return null;
  try {
    const bytes = Buffer.from(code, 'base64url');
    if (bytes.toString('base64url') !== code) return null;
    const name = new TextDecoder('utf-8', { fatal: true }).decode(bytes).trim();
    return name && Array.from(name).length <= 120 ? name : null;
  } catch {
    return null;
  }
}

export default async function legacyInvitation(request) {
  const url = new URL(request.url);
  if (url.pathname === '/api/invitations') {
    if (request.method !== 'POST') return jsonError('Phương thức không được hỗ trợ.', 405);
    let body;
    try {
      const text = await request.text();
      if (text.length > 4000) throw new Error();
      body = JSON.parse(text);
    } catch { return jsonError('Dữ liệu không hợp lệ.', 400); }
    const guest = typeof body?.guest === 'string' ? body.guest.trim() : '';
    if (!guest || Array.from(guest).length > 120) return jsonError('Tên khách mời không hợp lệ.', 400);
    const result = await rpc('create_invitation_link', { guest });
    if (result.error || !/^s_[a-f0-9]{16}$/.test(result.value)) return jsonError('Không thể tạo liên kết. Vui lòng kiểm tra cấu hình Supabase và bảng liên kết thiệp.', result.error || 502);
    return Response.json({ code: result.value }, { headers: { 'Cache-Control': 'no-store' } });
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Phương thức không được hỗ trợ.', { status: 405 });
  const match = url.pathname.match(/^\/m\/([^/]+)\/?$/);
  let guest = '';
  if (match && /^s_[a-f0-9]{16}$/.test(match[1])) {
    const result = await rpc('get_invitation_guest', { link_code: match[1] });
    if (result.error) return new Response('Không thể tải thiệp mời. Vui lòng thử lại sau.', { status: result.error });
    guest = result.value;
  } else if (match) {
    guest = guestFromCode(match[1]);
  }
  if (match && guest === null) return new Response('Không tìm thấy thiệp mời.', { status: 404 });

  const title = 'Khánh Linh & Hồng Minh';
  const description = `Thân mời${guest ? ' ' + guest : ' quý khách'} đến dự tiệc cưới | 10:00 Chủ Nhật, 1 tháng 11, 2026 | Nhà hàng Vũ Nghĩa, Quốc Lộ 3 - Sóc Sơn - Hà Nội`;
  const target = new URL('/chungdoi.com/i/hongminh-khanhlinh.html', url.origin);
  if (guest) target.searchParams.set('guest', guest);
  const image = new URL('/cdn.chungdoi.com/uploads/4fc1d983-574d-41fa-8665-38e071d95976.jpg', url.origin);
  const html = `<!doctype html><html lang="vi"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}">
<meta property="og:type" content="website"><meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}"><meta property="og:image" content="${escapeHtml(image.href)}">
<meta property="og:url" content="${escapeHtml(url.origin + url.pathname)}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(description)}"><meta name="twitter:image" content="${escapeHtml(image.href)}">
<script>window.location.replace(${JSON.stringify(target.href)})</script>
<noscript><meta http-equiv="refresh" content="0;url=${escapeHtml(target.href)}"></noscript>
</head><body><a href="${escapeHtml(target.href)}">Mở thiệp cưới</a></body></html>`;
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300' } });
}
