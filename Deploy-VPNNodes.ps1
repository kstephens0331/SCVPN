# PowerShell script to deploy WireGuard to both VPN nodes
# Run from Windows: .\Deploy-VPNNodes.ps1

Write-Host "🚀 SACVPN Node Deployment Script" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Check if plink (PuTTY) is available
$hasPlink = Get-Command plink -ErrorAction SilentlyContinue
if (-not $hasPlink) {
    Write-Host "❌ Error: plink not found. Please install PuTTY:" -ForegroundColor Red
    Write-Host "   Download from: https://www.putty.org/" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Or use WSL/Git Bash and run the .sh scripts instead" -ForegroundColor Yellow
    exit 1
}

# VA Primary Configuration
$vaConfig = @"
[Interface]
PrivateKey = nMPOwCtInSfDUIl7RQc8WM4+gBy88Cq7dghvAH3LVSs=
Address = 10.8.0.1/24
ListenPort = 51820
SaveConfig = false

PostUp = iptables -A FORWARD -i %i -j ACCEPT; iptables -A FORWARD -o %i -j ACCEPT; iptables -t nat -A POSTROUTING -o ens3 -j MASQUERADE
PostUp = ip6tables -A FORWARD -i %i -j ACCEPT; ip6tables -A FORWARD -o %i -j ACCEPT; ip6tables -t nat -A POSTROUTING -o ens3 -j MASQUERADE
PostDown = iptables -D FORWARD -i %i -j ACCEPT; iptables -D FORWARD -o %i -j ACCEPT; iptables -t nat -D POSTROUTING -o ens3 -j MASQUERADE
PostDown = ip6tables -D FORWARD -i %i -j ACCEPT; ip6tables -D FORWARD -o %i -j ACCEPT; ip6tables -t nat -D POSTROUTING -o ens3 -j MASQUERADE
"@

# Dallas Configuration
$dallasConfig = @"
[Interface]
PrivateKey = a3YWIHKfwF+ksp7WET7K/YJbAPAFJj6t4nLpeMJcPmM=
Address = 10.9.0.1/24
ListenPort = 51820
SaveConfig = false

PostUp = iptables -A FORWARD -i %i -j ACCEPT; iptables -A FORWARD -o %i -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostUp = ip6tables -A FORWARD -i %i -j ACCEPT; ip6tables -A FORWARD -o %i -j ACCEPT; ip6tables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i %i -j ACCEPT; iptables -D FORWARD -o %i -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE
PostDown = ip6tables -D FORWARD -i %i -j ACCEPT; ip6tables -D FORWARD -o %i -j ACCEPT; ip6tables -t nat -D POSTROUTING -o eth0 -j MASQUERADE
"@

# Save configs to temp files
$vaConfig | Out-File -FilePath "$env:TEMP\wg0-va.conf" -Encoding ASCII -NoNewline
$dallasConfig | Out-File -FilePath "$env:TEMP\wg0-dallas.conf" -Encoding ASCII -NoNewline

Write-Host "📋 Deployment Plan:" -ForegroundColor Yellow
Write-Host "  1. VA Primary (135.148.121.237) - ubuntu user"
Write-Host "  2. Dallas Central (45.79.8.145) - root user"
Write-Host ""

$continue = Read-Host "Continue with deployment? (Y/N)"
if ($continue -ne 'Y' -and $continue -ne 'y') {
    Write-Host "❌ Deployment cancelled" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "🔧 Deploying to VA Primary..." -ForegroundColor Cyan

# VA Primary setup commands
$vaSetupScript = @'
sudo apt update &&
sudo apt install -y wireguard wireguard-tools ufw &&
echo 'net.ipv4.ip_forward=1' | sudo tee -a /etc/sysctl.conf &&
echo 'net.ipv6.conf.all.forwarding=1' | sudo tee -a /etc/sysctl.conf &&
sudo sysctl -p &&
sudo ufw --force enable &&
sudo ufw allow 22/tcp &&
sudo ufw allow 51820/udp &&
sudo ufw reload &&
echo "✅ VA Primary configured"
'@

# Execute on VA Primary
echo y | plink -ssh ubuntu@135.148.121.237 -pw "78410889Ks!" $vaSetupScript

# Copy config file
pscp -pw "78410889Ks!" "$env:TEMP\wg0-va.conf" ubuntu@135.148.121.237:/tmp/wg0.conf

# Install config and start service
$vaStartScript = @'
sudo mv /tmp/wg0.conf /etc/wireguard/wg0.conf &&
sudo chmod 600 /etc/wireguard/wg0.conf &&
sudo systemctl enable wg-quick@wg0 &&
sudo systemctl start wg-quick@wg0 &&
sleep 2 &&
sudo wg show
'@

echo y | plink -ssh ubuntu@135.148.121.237 -pw "78410889Ks!" $vaStartScript

Write-Host "✅ VA Primary deployed!" -ForegroundColor Green
Write-Host ""
Write-Host "🔧 Deploying to Dallas Central..." -ForegroundColor Cyan

# Dallas setup commands
$dallasSetupScript = @'
apt update &&
apt install -y wireguard wireguard-tools ufw &&
echo 'net.ipv4.ip_forward=1' >> /etc/sysctl.conf &&
echo 'net.ipv6.conf.all.forwarding=1' >> /etc/sysctl.conf &&
sysctl -p &&
ufw --force enable &&
ufw allow 22/tcp &&
ufw allow 51820/udp &&
ufw reload &&
echo "✅ Dallas configured"
'@

# Execute on Dallas
echo y | plink -ssh root@45.79.8.145 -pw "78410889Ks!" $dallasSetupScript

# Copy config file
pscp -pw "78410889Ks!" "$env:TEMP\wg0-dallas.conf" root@45.79.8.145:/tmp/wg0.conf

# Install config and start service
$dallasStartScript = @'
mv /tmp/wg0.conf /etc/wireguard/wg0.conf &&
chmod 600 /etc/wireguard/wg0.conf &&
systemctl enable wg-quick@wg0 &&
systemctl start wg-quick@wg0 &&
sleep 2 &&
wg show
'@

echo y | plink -ssh root@45.79.8.145 -pw "78410889Ks!" $dallasStartScript

Write-Host "✅ Dallas Central deployed!" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 Both VPN nodes are now operational!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "  VA Primary:     135.148.121.237:51820 (10.8.0.0/24)" -ForegroundColor White
Write-Host "  Dallas Central: 45.79.8.145:51820 (10.9.0.0/24)" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Add VPN_NODE_SSH_PASSWORD to Railway"
Write-Host "  2. Test key generation: curl -X POST https://scvpn-production.up.railway.app/api/wireguard/process-requests"
Write-Host "  3. Test in dashboard"
