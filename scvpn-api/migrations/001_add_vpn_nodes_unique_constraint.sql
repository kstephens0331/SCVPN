-- Add unique constraint to vpn_nodes.name for upsert functionality
-- This allows setup-nodes.js to use ON CONFLICT (name)

ALTER TABLE vpn_nodes
ADD CONSTRAINT vpn_nodes_name_unique UNIQUE (name);

-- Also add unique constraint on public_ip to prevent duplicate servers
ALTER TABLE vpn_nodes
ADD CONSTRAINT vpn_nodes_public_ip_unique UNIQUE (public_ip);

-- Add priority column for node selection logic
ALTER TABLE vpn_nodes
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 999;

-- Add performance_tier for gaming optimization
ALTER TABLE vpn_nodes
ADD COLUMN IF NOT EXISTS performance_tier VARCHAR(20) DEFAULT 'standard';

-- Add location for display
ALTER TABLE vpn_nodes
ADD COLUMN IF NOT EXISTS location VARCHAR(100);

-- Add gaming_optimized flag
ALTER TABLE vpn_nodes
ADD COLUMN IF NOT EXISTS gaming_optimized BOOLEAN DEFAULT false;

-- Update comment
COMMENT ON TABLE vpn_nodes IS 'VPN server nodes with load balancing and priority routing';
