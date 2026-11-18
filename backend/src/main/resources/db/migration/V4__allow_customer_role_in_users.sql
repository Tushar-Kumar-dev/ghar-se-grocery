-- Migration V4: Update chk_users_role to include CUSTOMER role
ALTER TABLE users DROP CHECK chk_users_role;
ALTER TABLE users ADD CONSTRAINT chk_users_role CHECK (role IN ('ADMIN', 'MANAGER', 'CASHIER', 'CUSTOMER'));
