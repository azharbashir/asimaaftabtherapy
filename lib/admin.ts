import { getChatGPTUser } from '../app/chatgpt-auth';
// Hosted as owner-private: the platform access policy is the admin allowlist.
// Do not broaden the audience without adding a separate administrator role.
export async function isAdmin(request: Request) {
 if (request.method !== 'GET' && request.headers.get('origin') !== new URL(request.url).origin) return false;
 return Boolean(await getChatGPTUser());
}
