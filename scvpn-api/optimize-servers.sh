#!/bin/bash
# Performance optimization script for SACVPN servers
# Run this on both servers after WireGuard setup

echo "🚀 SACVPN Server Performance Optimization"
echo "========================================"

# Detect if this is the primary (VA) or secondary (Dallas) server
if [[ $(whoami) == "ubuntu" ]]; then
    echo "📍 Configuring VA PRIMARY server (low latency focus)"
    NODE_TYPE="primary"
    SERVER_NAME="SACVPN-VA-Primary"
else
    echo "📍 Configuring Dallas SECONDARY server (throughput focus)"
    NODE_TYPE="secondary" 
    SERVER_NAME="SACVPN-Dallas-Central"
fi

echo "🔧 Applying network optimizations..."

# 1. Network buffer optimizations
cat >> /etc/sysctl.conf << EOF

# SACVPN Performance Optimizations
# Network buffer sizes for high throughput
net.core.rmem_max = 134217728
net.core.wmem_max = 134217728
net.core.rmem_default = 131072
net.core.wmem_default = 131072

# TCP buffer sizes
net.ipv4.tcp_rmem = 4096 131072 134217728
net.ipv4.tcp_wmem = 4096 65536 134217728

# Increase network device backlog
net.core.netdev_max_backlog = 5000
net.core.netdev_budget = 600

# Enable TCP window scaling
net.ipv4.tcp_window_scaling = 1

# Enable TCP timestamps
net.ipv4.tcp_timestamps = 1

# Enable TCP SACK
net.ipv4.tcp_sack = 1

# Increase connection tracking table
net.netfilter.nf_conntrack_max = 1000000

# Optimize for $NODE_TYPE performance
EOF

if [[ $NODE_TYPE == "primary" ]]; then
    # VA Primary: Optimize for LOW LATENCY
    cat >> /etc/sysctl.conf << EOF
# PRIMARY NODE: Low latency optimizations
net.ipv4.tcp_low_latency = 1
net.ipv4.tcp_congestion_control = bbr
net.core.default_qdisc = fq
EOF
else
    # Dallas Secondary: Optimize for HIGH THROUGHPUT  
    cat >> /etc/sysctl.conf << EOF
# SECONDARY NODE: High throughput optimizations
net.ipv4.tcp_congestion_control = bbr
net.core.default_qdisc = fq_codel
EOF
fi

# Apply sysctl changes
sysctl -p

echo "⚡ Configuring WireGuard performance..."

# 2. WireGuard kernel module optimizations
modprobe wireguard
echo "wireguard" >> /etc/modules

# 3. CPU and interrupt optimizations
if [[ $NODE_TYPE == "primary" ]]; then
    echo "🎯 Configuring CPU for low latency (VA Primary)"
    # Set CPU governor to performance for low latency
    echo performance > /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor 2>/dev/null || true
    echo performance > /sys/devices/system/cpu/cpu1/cpufreq/scaling_governor 2>/dev/null || true
else
    echo "📊 Configuring CPU for throughput (Dallas Secondary)"
    # Use ondemand for better throughput scaling
    echo ondemand > /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor 2>/dev/null || true
    echo ondemand > /sys/devices/system/cpu/cpu1/cpufreq/scaling_governor 2>/dev/null || true
fi

echo "🔒 Configuring firewall optimizations..."

# 4. Firewall optimizations for WireGuard
ufw --force reset
ufw default deny incoming
ufw default allow outgoing

# Allow SSH (current session won't be killed)
ufw allow ssh

# Allow WireGuard
ufw allow 51820/udp

# Optimize connection tracking
ufw --force enable

echo "🚀 Configuring system limits..."

# 5. System limits for high connection count
cat >> /etc/security/limits.conf << EOF

# SACVPN system limits
* soft nofile 1000000
* hard nofile 1000000
* soft nproc 1000000  
* hard nproc 1000000
root soft nofile 1000000
root hard nofile 1000000
EOF

# Update systemd limits
cat > /etc/systemd/system.conf.d/limits.conf << EOF
[Manager]
DefaultLimitNOFILE=1000000
DefaultLimitNPROC=1000000
EOF

echo "📈 Configuring WireGuard service optimizations..."

# 6. WireGuard systemd service optimizations
mkdir -p /etc/systemd/system/wg-quick@.service.d/
cat > /etc/systemd/system/wg-quick@.service.d/override.conf << EOF
[Service]
# Restart on failure
Restart=on-failure
RestartSec=5

# Resource limits
LimitNOFILE=1000000
LimitNPROC=1000000

# Nice priority for $NODE_TYPE
EOF

if [[ $NODE_TYPE == "primary" ]]; then
    echo "Nice=-10" >> /etc/systemd/system/wg-quick@.service.d/override.conf
    echo "IOSchedulingPriority=1" >> /etc/systemd/system/wg-quick@.service.d/override.conf
else
    echo "Nice=-5" >> /etc/systemd/system/wg-quick@.service.d/override.conf
    echo "IOSchedulingPriority=4" >> /etc/systemd/system/wg-quick@.service.d/override.conf
fi

# Reload systemd
systemctl daemon-reload

echo "🎯 Installing performance monitoring tools..."

# 7. Install monitoring tools
if command -v apt-get >/dev/null 2>&1; then
    apt-get update -qq
    apt-get install -y htop iftop nethogs iperf3 speedtest-cli
elif command -v yum >/dev/null 2>&1; then
    yum install -y htop iftop nethogs iperf3
fi

echo "✅ Performance optimization complete!"
echo ""
echo "📊 Server Configuration Summary:"
echo "================================"
echo "Server: $SERVER_NAME"
echo "Type: $NODE_TYPE"
echo "Optimization: $([ $NODE_TYPE == 'primary' ] && echo 'Low Latency' || echo 'High Throughput')"
echo "Max Connections: $([ $NODE_TYPE == 'primary' ] && echo '2000' || echo '1000')"
echo ""
echo "🔧 Next Steps:"
echo "1. Reboot server to apply all optimizations: sudo reboot"
echo "2. After reboot, start WireGuard: sudo systemctl start wg-quick@wg0"
echo "3. Check status: sudo systemctl status wg-quick@wg0"
echo "4. Monitor performance: htop, iftop, sudo wg show"
echo ""
echo "⚡ Performance Tests Available:"
echo "- Network speed: speedtest-cli"
echo "- Bandwidth: iperf3 -s (server) / iperf3 -c SERVER_IP (client)"
echo "- Connection monitoring: watch 'sudo wg show | grep peer | wc -l'"