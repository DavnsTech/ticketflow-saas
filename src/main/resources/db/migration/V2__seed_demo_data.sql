-- Demo users (passwords are bcrypt hashed "password123")
INSERT INTO users (email, password_hash, display_name, role) VALUES
('admin@ticketflow.local', '$2a$10$ERr8Ox1xHWR0mErqhdDJnuLd9aZYnAQTvkNWViRRDsXROM3chzcEi', 'Admin User', 'ADMIN'),
('agent1@ticketflow.local', '$2a$10$ERr8Ox1xHWR0mErqhdDJnuLd9aZYnAQTvkNWViRRDsXROM3chzcEi', 'Sarah Chen', 'AGENT'),
('agent2@ticketflow.local', '$2a$10$ERr8Ox1xHWR0mErqhdDJnuLd9aZYnAQTvkNWViRRDsXROM3chzcEi', 'Marcus Jones', 'AGENT'),
('user1@ticketflow.local', '$2a$10$ERr8Ox1xHWR0mErqhdDJnuLd9aZYnAQTvkNWViRRDsXROM3chzcEi', 'Alice Martin', 'USER'),
('user2@ticketflow.local', '$2a$10$ERr8Ox1xHWR0mErqhdDJnuLd9aZYnAQTvkNWViRRDsXROM3chzcEi', 'Bob Wilson', 'USER');

-- Sample tickets
INSERT INTO tickets (title, description, status, priority, category, requester_id, assignee_id, created_at, updated_at, resolved_at) VALUES
('Cannot login to dashboard', 'Getting 500 error when trying to login with SSO credentials.', 'OPEN', 'HIGH', 'Auth', 4, 2, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', NULL),
('Export CSV not working', 'The export button generates an empty file for reports > 1000 rows.', 'IN_PROGRESS', 'MEDIUM', 'Reports', 5, 2, NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day', NULL),
('Update billing address', 'Please update our company billing address to 123 Main St.', 'RESOLVED', 'LOW', 'Billing', 4, 3, NOW() - INTERVAL '5 days', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
('Password reset not sending email', 'Clicked reset password but never received the email. Checked spam.', 'OPEN', 'URGENT', 'Auth', 5, NULL, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NULL),
('Feature request: dark mode', 'Would love a dark mode option for the dashboard.', 'OPEN', 'LOW', 'Feature', 4, NULL, NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days', NULL),
('API rate limiting too strict', 'Our integration is hitting 429 errors at 50 req/min. Need increase.', 'IN_PROGRESS', 'HIGH', 'API', 5, 3, NOW() - INTERVAL '4 days', NOW() - INTERVAL '2 days', NULL),
('Mobile layout broken on iPhone 14', 'The sidebar overlaps the main content area on iOS Safari.', 'WAITING', 'MEDIUM', 'UI', 4, 2, NOW() - INTERVAL '6 days', NOW() - INTERVAL '3 days', NULL),
('Cannot delete old invoices', 'Delete button returns a 403 error even as account owner.', 'OPEN', 'MEDIUM', 'Billing', 5, NULL, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NULL),
('Webhook delivery failures', 'About 10% of webhooks are failing with timeout. Need investigation.', 'RESOLVED', 'HIGH', 'API', 4, 3, NOW() - INTERVAL '10 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
('Search returns wrong results', 'Searching for exact ticket ID returns unrelated tickets.', 'IN_PROGRESS', 'MEDIUM', 'Search', 5, 2, NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day', NULL),
('Add bulk ticket import', 'We need to migrate 500 tickets from our old system via CSV.', 'OPEN', 'LOW', 'Feature', 4, NULL, NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days', NULL),
('Two-factor auth setup fails', 'QR code not rendering in Chrome 120. Works in Firefox.', 'RESOLVED', 'HIGH', 'Auth', 5, 2, NOW() - INTERVAL '12 days', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days');

-- Sample tags
INSERT INTO ticket_tags (ticket_id, tag) VALUES
(1, 'sso'), (1, 'login'),
(2, 'export'), (2, 'csv'),
(4, 'email'), (4, 'urgent'),
(5, 'enhancement'),
(6, 'api'), (6, 'rate-limit'),
(7, 'mobile'), (7, 'ios'),
(9, 'webhook'), (9, 'reliability'),
(12, '2fa'), (12, 'chrome');

-- Sample comments
INSERT INTO ticket_comments (ticket_id, author_id, content, is_internal, created_at) VALUES
(1, 2, 'I can reproduce the issue. Looking into the SSO callback handler.', FALSE, NOW() - INTERVAL '2 days' + INTERVAL '2 hours'),
(1, 2, 'Root cause: expired SAML certificate. Requesting new cert from IT.', TRUE, NOW() - INTERVAL '2 days' + INTERVAL '3 hours'),
(2, 2, 'Confirmed the bug. The CSV serializer has a memory limit at 1000 rows.', FALSE, NOW() - INTERVAL '2 days'),
(2, 5, 'Any timeline on the fix? We need this for end-of-month reporting.', FALSE, NOW() - INTERVAL '1 day'),
(3, 3, 'Updated the billing address in the system. Please verify.', FALSE, NOW() - INTERVAL '2 days'),
(3, 4, 'Confirmed. Looks good. Thank you!', FALSE, NOW() - INTERVAL '1 day'),
(6, 3, 'Increasing the rate limit to 200 req/min. Deploying the config change now.', FALSE, NOW() - INTERVAL '2 days'),
(7, 2, 'Need to test with the latest iOS update. Waiting for device.', TRUE, NOW() - INTERVAL '3 days'),
(9, 3, 'Fixed the webhook timeout by increasing the retry window. Monitoring.', FALSE, NOW() - INTERVAL '3 days'),
(9, 4, 'Delivery rate is back to 100%. Thanks for the quick fix!', FALSE, NOW() - INTERVAL '2 days'),
(10, 2, 'Investigating the search indexer. Might be a stale cache issue.', FALSE, NOW() - INTERVAL '1 day'),
(12, 2, 'Chrome 120 has a known bug with SVG rendering. Applied a workaround.', FALSE, NOW() - INTERVAL '6 days');
