import { useEffect, useRef } from "react"
import QRCode from "qrcode"

export default function WgQr({ config }){
  const canvasRef = useRef(null)
  useEffect(()=>{
    if (canvasRef.current && config) {
      QRCode.toCanvas(canvasRef.current, config, { errorCorrectionLevel: "M" })
    }
  }, [config])
  return <canvas ref={canvasRef} className="border rounded" />
}
