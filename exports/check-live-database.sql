-- Read-only diagnostic queries. Run in the database selected in Hostinger phpMyAdmin.
-- The app's DB_NAME must match the result of the first query.
SELECT DATABASE() AS selected_database;
SHOW TABLES;
SELECT COUNT(*) AS saved_content_records FROM content;
SELECT id, JSON_VALID(value) AS valid_json, CHAR_LENGTH(value) AS content_length FROM content;
SELECT status, COUNT(*) AS review_count FROM reviews GROUP BY status;
SELECT COUNT(*) AS admin_accounts FROM users WHERE role='admin';
SELECT created_at FROM __drizzle_migrations ORDER BY created_at;
