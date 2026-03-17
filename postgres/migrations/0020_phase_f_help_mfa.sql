-- Phase F: Help Content + MFA Schema
-- Minimal canonical tables/columns

-- Help Categories
CREATE TABLE IF NOT EXISTS help_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Help Articles
CREATE TABLE IF NOT EXISTS help_articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES help_categories(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    version INTEGER DEFAULT 1,
    is_published BOOLEAN DEFAULT false,
    search_keywords JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- MFA columns on users (minimal state)
ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_setup_completed BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_backup_codes JSONB DEFAULT '[]';
ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_last_verified TIMESTAMP;

-- Integrations enhance (add if not exist)
ALTER TABLE integration_connections ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'disconnected';
ALTER TABLE integration_connections ADD COLUMN IF NOT EXISTS last_sync TIMESTAMP;
ALTER TABLE integration_connections ADD COLUMN IF NOT EXISTS last_error TEXT;
ALTER TABLE integration_connections ADD COLUMN IF NOT EXISTS sync_count INTEGER DEFAULT 0;

-- DataGovernance enhance for scans
ALTER TABLE data_governance ADD COLUMN IF NOT EXISTS last_scan TIMESTAMP;
ALTER TABLE data_governance ADD COLUMN IF NOT EXISTS scan_status VARCHAR(50) DEFAULT 'idle';
ALTER TABLE data_governance ADD COLUMN IF NOT EXISTS scan_issues_count INTEGER DEFAULT 0;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_help_articles_category ON help_articles(category_id);
CREATE INDEX IF NOT EXISTS idx_help_articles_published ON help_articles(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_help_categories_active ON help_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_users_mfa_enabled ON users(mfa_enabled);

-- Seed minimal help content (no hardcoded visible sub)
INSERT INTO help_categories (name, slug, description) VALUES 
    ('Getting Started', 'getting-started', 'Platform introduction and basics'),
    ('Security', 'security', 'Account and data protection'),
    ('Integrations', 'integrations', 'Connect external systems')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO help_articles (category_id, title, slug, content, is_published) VALUES 
    ((SELECT id FROM help_categories WHERE slug = 'getting-started'), 'Welcome to Smart HR Platform', 'welcome', '# Welcome\n\nReal persisted help content. Backend Phase F operational.', true),
    ((SELECT id FROM help_categories WHERE slug = 'security'), 'Enable MFA', 'enable-mfa', '# MFA Setup\n\nPersisted state management operational.', true)
ON CONFLICT (slug) DO NOTHING;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_help_categories_updated_at ON help_categories;
CREATE TRIGGER update_help_categories_updated_at BEFORE UPDATE ON help_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_help_articles_updated_at ON help_articles;
CREATE TRIGGER update_help_articles_updated_at BEFORE UPDATE ON help_articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

