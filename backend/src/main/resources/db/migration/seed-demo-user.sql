-- Run this ONCE to seed the demo user into your database.
-- BCrypt hash of "password123" with strength 12.

INSERT INTO users (id, name, email, password, role, xp, streak, level, is_active, created_at)
VALUES (
    gen_random_uuid(),
    'Demo User',
    'demo@techlearn.dev',
    '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.',
    'STUDENT',
    847,
    12,
    2,
    true,
    NOW()
)
ON CONFLICT (email) DO UPDATE
    SET password   = EXCLUDED.password,
        name       = EXCLUDED.name,
        xp         = EXCLUDED.xp,
        streak     = EXCLUDED.streak,
        level      = EXCLUDED.level,
        is_active  = true;

-- Verify
SELECT id, name, email, role, xp, streak FROM users WHERE email = 'demo@techlearn.dev';
