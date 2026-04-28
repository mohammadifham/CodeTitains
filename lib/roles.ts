export type AppRole = 'admin' | 'user';

const normalizeEmail = (value?: string | null) => value?.trim().toLowerCase() ?? '';

const adminEmail = normalizeEmail(process.env.NEXT_PUBLIC_ADMIN_EMAIL);

export const hasConfiguredAdminEmail = adminEmail.length > 0;

export const getRoleFromEmail = (email?: string | null): AppRole => {
  if (!adminEmail) return 'user';
  return normalizeEmail(email) === adminEmail ? 'admin' : 'user';
};

export const getRoleRoute = (role: AppRole) => (role === 'admin' ? '/dashboard' : '/user');