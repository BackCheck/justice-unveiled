export async function computeHashes(arrayBuffer: ArrayBuffer) {
  // SHA-256
  const sha256Buffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  const sha256 = Array.from(new Uint8Array(sha256Buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // SHA-1
  const sha1Buffer = await crypto.subtle.digest("SHA-1", arrayBuffer);
  const sha1 = Array.from(new Uint8Array(sha1Buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // MD5 via crypto-js
  const CryptoJS = (await import("crypto-js")).default;
  const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer as any);
  const md5 = CryptoJS.MD5(wordArray).toString();

  return { sha256, sha1, md5 };
}

export async function extractMediaMetadata(
  file: File
): Promise<{ duration?: number; width?: number; height?: number; codec?: string }> {
  const isVideo = file.type.startsWith("video/");
  const isAudio = file.type.startsWith("audio/");
  if (!isVideo && !isAudio) return {};

  return new Promise((resolve) => {
    const el = document.createElement(isVideo ? "video" : "audio") as HTMLVideoElement | HTMLAudioElement;
    const url = URL.createObjectURL(file);
    el.src = url;
    el.preload = "metadata";

    const timeout = setTimeout(() => {
      URL.revokeObjectURL(url);
      resolve({ codec: file.type });
    }, 5000);

    el.onloadedmetadata = () => {
      clearTimeout(timeout);
      const result: { duration?: number; width?: number; height?: number; codec?: string } = {
        duration: el.duration,
        codec: file.type,
      };
      if (isVideo) {
        const videoEl = el as HTMLVideoElement;
        result.width = videoEl.videoWidth;
        result.height = videoEl.videoHeight;
      }
      URL.revokeObjectURL(url);
      resolve(result);
    };

    el.onerror = () => {
      clearTimeout(timeout);
      URL.revokeObjectURL(url);
      resolve({ codec: file.type });
    };
  });
}
