# Get Dallas Central WireGuard Public Key

## SSH into Dallas Central and get the public key:

```bash
# SSH into Dallas Central
ssh root@45.79.8.145

# Get WireGuard public key
sudo cat /etc/wireguard/publickey
# OR if that doesn't exist:
sudo wg show wg0 public-key
# OR extract from config:
sudo cat /etc/wireguard/wg0.conf | grep PrivateKey | awk '{print $3}' | wg pubkey
```

## Once you have the public key:

1. Copy the public key output (it will look like: `ABC123def456...=`)
2. Replace `[DALLAS_PUBLIC_KEY_HERE]` in `SETUP_VPN_NODES_WITH_SSH.sql` with the actual key
3. Run the SQL in Supabase

## If WireGuard isn't installed on Dallas yet:

```bash
# Install WireGuard
sudo apt update
sudo apt install -y wireguard

# Generate keys
wg genkey | sudo tee /etc/wireguard/privatekey | wg pubkey | sudo tee /etc/wireguard/publickey

# Show public key
cat /etc/wireguard/publickey
```
