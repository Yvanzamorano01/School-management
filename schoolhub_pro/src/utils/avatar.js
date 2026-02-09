const AVATAR_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6'];

export const DEFAULT_AVATAR_SM = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' rx='20' fill='%23e2e8f0'/%3E%3Cpath d='M20 10a6 6 0 1 1 0 12 6 6 0 0 1 0-12zm0 15c6.63 0 12 2.69 12 6v2H8v-2c0-3.31 5.37-6 12-6z' fill='%2394a3b8'/%3E%3C/svg%3E";

export const DEFAULT_AVATAR_LG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='32' fill='%23e2e8f0'/%3E%3Cpath d='M32 16a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 24c10.6 0 19 4.3 19 9.6V53H13v-3.4c0-5.3 8.4-9.6 19-9.6z' fill='%2394a3b8'/%3E%3C/svg%3E";

export const getInitials = (name) => {
  if (!name || name === 'N/A') return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return parts[0][0]?.toUpperCase() || '';
};

export const getAvatarColor = (name) => {
  if (!name) return '#94a3b8';
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

export const hasValidPhoto = (photo) => {
  return photo && photo !== 'null' && photo !== '' && !photo.includes('via.placeholder.com');
};
