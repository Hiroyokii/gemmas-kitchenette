-- Preserve existing staff accounts by granting them the remaining operational role.
UPDATE "User"
SET "roleId" = (SELECT "id" FROM "Role" WHERE "name" = 'ADMIN')
WHERE "roleId" = (SELECT "id" FROM "Role" WHERE "name" = 'STAFF');

DELETE FROM "Role" WHERE "name" = 'STAFF';
