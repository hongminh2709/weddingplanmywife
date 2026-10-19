export const config = { path: ['/thiep', '/m/:code'] };

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

export default async function invitation(request) {
  const url = new URL(request.url);
  const match = url.pathname.match(/^\/m\/([^/]+)\/?$/);
  const guest = match ? guestFromCode(match[1]) : '';
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
