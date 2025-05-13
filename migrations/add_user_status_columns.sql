-- Add new columns for user status tracking
ALTER TABLE users
  ADD COLUMN status VARCHAR(20) DEFAULT 'active' NOT NULL,
  ADD COLUMN last_login TIMESTAMP NULL,
  ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Add an index for status lookups
CREATE INDEX idx_users_status ON users(status);

-- Update existing users to have the active status
UPDATE users SET status = 'active' WHERE status IS NULL;