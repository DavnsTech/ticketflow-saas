CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    color VARCHAR(7) NOT NULL DEFAULT '#6366f1',
    icon VARCHAR(50),
    active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE custom_fields (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    label VARCHAR(255) NOT NULL,
    field_type VARCHAR(20) NOT NULL DEFAULT 'TEXT',
    required BOOLEAN NOT NULL DEFAULT false,
    options TEXT,
    placeholder VARCHAR(255),
    display_order INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE ticket_custom_values (
    id BIGSERIAL PRIMARY KEY,
    ticket_id BIGINT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    custom_field_id BIGINT NOT NULL REFERENCES custom_fields(id) ON DELETE CASCADE,
    value TEXT,
    UNIQUE(ticket_id, custom_field_id)
);

CREATE TABLE category_agents (
    category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (category_id, user_id)
);

ALTER TABLE tickets ADD COLUMN category_id BIGINT REFERENCES categories(id);

INSERT INTO categories (name, description, color, icon, display_order) VALUES
    ('Billing', 'Invoices, payments and subscriptions', '#f59e0b', 'CreditCard', 1),
    ('Authentication', 'Login, SSO and access issues', '#ef4444', 'Shield', 2),
    ('API', 'API integration and endpoints', '#8b5cf6', 'Code', 3),
    ('UI', 'Interface and display issues', '#3b82f6', 'Monitor', 4),
    ('Feature Request', 'New features and improvements', '#10b981', 'Lightbulb', 5),
    ('General', 'Other questions and support', '#6b7280', 'HelpCircle', 6);

UPDATE tickets SET category_id = (SELECT id FROM categories WHERE name = 'Billing') WHERE category = 'Billing';
UPDATE tickets SET category_id = (SELECT id FROM categories WHERE name = 'Authentication') WHERE category = 'Auth';
UPDATE tickets SET category_id = (SELECT id FROM categories WHERE name = 'API') WHERE category = 'API';
UPDATE tickets SET category_id = (SELECT id FROM categories WHERE name = 'UI') WHERE category = 'UI';
UPDATE tickets SET category_id = (SELECT id FROM categories WHERE name = 'Feature Request') WHERE category = 'Feature';
UPDATE tickets SET category_id = (SELECT id FROM categories WHERE name = 'General') WHERE category NOT IN ('Billing', 'Auth', 'API', 'UI', 'Feature');

INSERT INTO category_agents (category_id, user_id) VALUES
    ((SELECT id FROM categories WHERE name = 'Authentication'), (SELECT id FROM users WHERE email = 'agent1@ticketflow.local')),
    ((SELECT id FROM categories WHERE name = 'API'), (SELECT id FROM users WHERE email = 'agent1@ticketflow.local')),
    ((SELECT id FROM categories WHERE name = 'Billing'), (SELECT id FROM users WHERE email = 'agent2@ticketflow.local')),
    ((SELECT id FROM categories WHERE name = 'UI'), (SELECT id FROM users WHERE email = 'agent2@ticketflow.local'));

INSERT INTO custom_fields (category_id, name, label, field_type, required, placeholder, display_order) VALUES
    ((SELECT id FROM categories WHERE name = 'Billing'), 'invoice_number', 'Invoice Number', 'TEXT', false, 'e.g. INV-2024-001', 1),
    ((SELECT id FROM categories WHERE name = 'Authentication'), 'affected_url', 'Affected URL', 'URL', true, 'https://app.example.com/login', 1),
    ((SELECT id FROM categories WHERE name = 'Authentication'), 'browser', 'Browser', 'SELECT', false, NULL, 2),
    ((SELECT id FROM categories WHERE name = 'API'), 'endpoint', 'API Endpoint', 'TEXT', true, '/api/v1/...', 1),
    ((SELECT id FROM categories WHERE name = 'API'), 'http_method', 'HTTP Method', 'SELECT', false, NULL, 2),
    ((SELECT id FROM categories WHERE name = 'UI'), 'affected_url', 'Page URL', 'URL', false, 'https://...', 1),
    ((SELECT id FROM categories WHERE name = 'UI'), 'device', 'Device', 'SELECT', false, NULL, 2);

UPDATE custom_fields SET options = '["Chrome","Firefox","Safari","Edge","Other"]' WHERE name = 'browser';
UPDATE custom_fields SET options = '["GET","POST","PUT","DELETE","PATCH"]' WHERE name = 'http_method';
UPDATE custom_fields SET options = '["Desktop","Mobile","Tablet"]' WHERE name = 'device';
