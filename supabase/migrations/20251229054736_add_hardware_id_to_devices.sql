-- Add hardware_id column to devices table
-- This column stores a unique identifier for each device (MAC + hostname hash)

ALTER TABLE devices
ADD COLUMN IF NOT EXISTS hardware_id TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_devices_hardware_id ON devices(hardware_id);
