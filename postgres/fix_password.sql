UPDATE users SET password_hash = '$2a$10$pct38vUDKEeDl8.Mp/IW8eLXCfBgkqWjtiBW89glEBAFSWKkrT/Km' WHERE email LIKE '%smart-hr.com';
SELECT email, substring(password_hash,1,30) as hash_prefix FROM users WHERE email LIKE '%smart-hr.com';
