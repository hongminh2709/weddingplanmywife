import legacyInvitation from '../legacy-invitation.mjs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { TextDecoder } from 'node:util';

const invitationFile = path.resolve(process.cwd(), 'chungdoi.com/i/hongminh-khanhlinh.html');
const photoPath = '/cdn.chungdoi.com/uploads/4fc1d983-574d-41fa-8665-38e071d95976.jpg';

function escapeAttribute(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function decodeGuest(code) {
  if (!code || !/^[A-Za-z0-9_-]+$/.test(code) || code.length > 640) return null;
  try {
    const bytes = Buffer.from(code, 'base64url');
    if (bytes.toString('base64url') !== code) return null;
    const name = new TextDecoder('utf-8', { fatal: true }).decode(bytes).trim();
    return name && name.length <= 120 ? name : null;
  } catch { return null; }
}

export default async function invitation(request, context = {}) {
  const url = new URL(request.url);
  if (url.pathname === "/thiep" || url.pathname === "/api/invitations" || /^\/m\/s_[a-f0-9]{16}\/?$/.test(url.pathname)) return legacyInvitation(request);
  const code = context.params?.code || url.pathname.match(/^\/m\/([^/]+)\/?$/)?.[1];
  const guest = code ? decodeGuest(code) : '';
  if (code && !guest) return new Response('Không tìm thấy thiệp mời.', { status: 404 });
  const origin = url.origin;
  const shareUrl = origin + (code ? '/m/' + code : '/');
  const description = `Thân mời ${guest || 'quý khách'} đến dự tiệc cưới | 10:00 Chủ Nhật, 1 tháng 11, 2026 | Nhà hàng Vũ Nghĩa, Quốc Lộ 3 - Sóc Sơn - Hà Nội`;
  const html = (await readFile(invitationFile, 'utf8'))
    .replace(/<meta name="description" content="[^"]*"\/>/, `<meta name="description" content="${escapeAttribute(description)}"/>`)
    .replace(/<meta property="og:description" content="[^"]*"\/>/, `<meta property="og:description" content="${escapeAttribute(description)}"/>`)
    .replace(/<meta name="twitter:description" content="[^"]*"\/>/, `<meta name="twitter:description" content="${escapeAttribute(description)}"/>`)
    .replace(/<meta property="og:url" content="[^"]*"\/>/, `<meta property="og:url" content="${escapeAttribute(shareUrl)}"/>`)
    .replace(/<link rel="canonical" href="[^"]*"\/>/, `<link rel="canonical" href="${escapeAttribute(shareUrl)}"/>`)
    .replace(/<meta property="og:image" content="[^"]*"\/>/, `<meta property="og:image" content="${escapeAttribute(origin + photoPath)}"/>`)
    .replace(/<meta name="twitter:image" content="[^"]*"\/>/, `<meta name="twitter:image" content="${escapeAttribute(origin + photoPath)}"/>`)
    .replace(/<meta property="og:image:(?:width|height)" content="[^"]*"\/>/g, '');
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=0, s-maxage=3600' } });
}

export const config = { path: ['/', '/m/:code', '/thiep', '/api/invitations'] };
