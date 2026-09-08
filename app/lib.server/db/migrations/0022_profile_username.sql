ALTER TABLE Profile ADD COLUMN username TEXT;
CREATE UNIQUE INDEX Profile_username_key ON Profile(username);
