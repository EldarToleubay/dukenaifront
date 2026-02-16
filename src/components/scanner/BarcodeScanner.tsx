import { useEffect, useRef, useState } from 'react';

interface BarcodeScannerProps {
  onDetected: (barcode: string) => void;
}

export function BarcodeScanner({ onDetected }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let stream: MediaStream | null = null;
    let stopFallback = () => {};

    async function runNativeDetector() {
      if (!('BarcodeDetector' in window)) {
        return false;
      }

      // @ts-expect-error BarcodeDetector is still experimental in TS DOM libs.
      const detector = new window.BarcodeDetector({
        formats: ['ean_13', 'ean_8', 'code_128', 'upc_a', 'upc_e'],
      });

      const loop = async () => {
        if (!mounted || !videoRef.current) return;
        try {
          const barcodes = await detector.detect(videoRef.current);
          if (barcodes[0]?.rawValue) onDetected(barcodes[0].rawValue);
        } finally {
          requestAnimationFrame(loop);
        }
      };

      loop();
      return true;
    }

    async function runFallbackDetector() {
      const { BrowserMultiFormatReader } = await import('@zxing/browser');
      const reader = new BrowserMultiFormatReader();
      const controls = await reader.decodeFromVideoDevice(undefined, videoRef.current!, (result) => {
        if (result) onDetected(result.getText());
      });
      stopFallback = () => controls.stop();
    }

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
        if (!videoRef.current || !mounted) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        const nativeStarted = await runNativeDetector();
        if (!nativeStarted) await runFallbackDetector();
      } catch {
        setError('Не удалось получить доступ к камере');
      }
    }

    start();

    return () => {
      mounted = false;
      stopFallback();
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [onDetected]);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-black">
      <video className="h-[50vh] w-full object-cover" muted playsInline ref={videoRef} />
      {error && <div className="p-3 text-sm text-red-500">{error}</div>}
    </div>
  );
}
