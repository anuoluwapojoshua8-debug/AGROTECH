export const ROLES = {
  BUYER: 'BUYER',
  SELLER: 'SELLER',
  ADMIN: 'ADMIN',
  RIDER: 'RIDER',
} as const;

export const ROLE_HIERARCHY = {
  BUYER: 1,
  SELLER: 2,
  RIDER: 2,
  ADMIN: 3,
} as const;
