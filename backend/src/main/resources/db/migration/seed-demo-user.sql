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

INSERT INTO users (id, name, email, password, role, xp, streak, level, is_active, created_at)
VALUES (
    gen_random_uuid(),
    'Admin User',
    'admin@techlearn.dev',
    '$2b$12$McKTFaN4cti4SdKIIgZaj.A7vMZuynEonQlCla82S9jl1ww9Nx8aG',
    'ADMIN',
    0,
    0,
    1,
    true,
    NOW()
)
ON CONFLICT (email) DO UPDATE
    SET password   = EXCLUDED.password,
        name       = EXCLUDED.name,
        role       = EXCLUDED.role,
        xp         = EXCLUDED.xp,
        streak     = EXCLUDED.streak,
        level      = EXCLUDED.level,
        is_active  = true;

-- Verify
SELECT id, name, email, role, xp, streak FROM users WHERE email IN ('demo@techlearn.dev', 'admin@techlearn.dev');
