import { useState, useEffect } from 'react';
import { Download, Smartphone, Monitor, Copy, Check } from 'lucide-react';

export default function DeviceConfig({ deviceId, deviceName, onClose }) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, [deviceId]);

  async function fetchConfig() {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/device/${deviceId}/config-data`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch configuration');
      }

      const data = await response.json();
      setConfig(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function downloadConfig() {
    const link = document.createElement('a');
    link.href = `${import.meta.env.VITE_API_URL}/api/device/${deviceId}/config`;
    link.download = `${deviceName.replace(/[^a-zA-Z0-9]/g, '_')}_sacvpn.conf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function copyConfig() {
    if (config?.configText) {
      await navigator.clipboard.writeText(config.configText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const isMobile = config?.platform && /mobile|phone|tablet|ipad|android|ios/i.test(config.platform);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading configuration...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              VPN Configuration: {config?.deviceName}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
            <span className="px-2 py-1 bg-gray-100 rounded">
              {config?.nodeName}
            </span>
            <span className="px-2 py-1 bg-gray-100 rounded">
              {config?.nodeRegion}
            </span>
            <span className="px-2 py-1 bg-gray-100 rounded">
              IP: {config?.clientIp}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Mobile Setup (QR Code) */}
          {isMobile && config?.qrCode && (
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-6 border-2 border-red-200">
              <div className="flex items-center gap-2 mb-4">
                <Smartphone className="w-6 h-6 text-red-600" />
                <h3 className="text-xl font-bold text-gray-900">
                  Mobile Setup (Recommended)
                </h3>
              </div>

              <div className="bg-white rounded-lg p-6 text-center">
                <p className="text-gray-700 mb-4">
                  Scan this QR code with the WireGuard app:
                </p>
                <img
                  src={config.qrCode}
                  alt="WireGuard QR Code"
                  className="mx-auto max-w-[300px] w-full"
                />
                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <p>1. Open WireGuard app</p>
                  <p>2. Tap "+" → "Create from QR code"</p>
                  <p>3. Scan the code above</p>
                  <p>4. Toggle to connect</p>
                </div>
              </div>

              <div className="mt-4 text-center">
                <a
                  href="https://www.wireguard.com/install/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-600 hover:text-red-700 underline text-sm"
                >
                  Download WireGuard App
                </a>
              </div>
            </div>
          )}

          {/* Desktop Setup */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-6 border-2 border-blue-200">
            <div className="flex items-center gap-2 mb-4">
              <Monitor className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900">
                Desktop Setup
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Step 1: Download WireGuard</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                  <a
                    href="https://download.wireguard.com/windows-client/wireguard-installer.exe"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-center"
                  >
                    Windows
                  </a>
                  <a
                    href="https://apps.apple.com/us/app/wireguard/id1451685025"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-center"
                  >
                    macOS
                  </a>
                  <a
                    href="https://www.wireguard.com/install/"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-center"
                  >
                    Linux
                  </a>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Step 2: Download Configuration</h4>
                <button
                  onClick={downloadConfig}
                  className="w-full md:w-auto px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download .conf File
                </button>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Step 3: Import & Connect</h4>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  <li>Open WireGuard application</li>
                  <li>Click "Import tunnel(s) from file"</li>
                  <li>Select the downloaded .conf file</li>
                  <li>Click "Activate" to connect</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Config Text (Advanced) */}
          <details className="bg-gray-50 rounded-lg border border-gray-200">
            <summary className="p-4 font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 rounded-lg">
              Advanced: View Configuration Text
            </summary>
            <div className="p-4 pt-0">
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-green-400 text-sm font-mono">
                  {config?.configText}
                </pre>
              </div>
              <button
                onClick={copyConfig}
                className="mt-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy to Clipboard
                  </>
                )}
              </button>
            </div>
          </details>

          {/* Help Text */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Need help?</strong> Check out our{' '}
              <a href="/support" className="underline hover:text-yellow-900">
                setup guide
              </a>{' '}
              or contact support at support@sacvpn.com
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
          <button
            onClick={onClose}
            className="w-full md:w-auto px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
