/**
 * Capture a frame/thumbnail from a video or image file as a base64 data URL.
 * For videos: seeks to 1 second (or 0 if shorter) and captures a canvas frame.
 * For images: draws onto a canvas and exports.
 */
export async function captureArtifactFrame(file: File): Promise<string | undefined> {
  if (file.type.startsWith("video/")) {
    return captureVideoFrame(file);
  }
  if (file.type.startsWith("image/")) {
    return captureImageFrame(file);
  }
  return undefined;
}

function captureVideoFrame(file: File): Promise<string | undefined> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.muted = true;
    video.preload = "metadata";
    const url = URL.createObjectURL(file);
    video.src = url;

    video.onloadedmetadata = () => {
      // Seek to 1s or 25% of duration, whichever is smaller
      video.currentTime = Math.min(1, video.duration * 0.25);
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement("canvas");
        const maxDim = 640;
        const scale = Math.min(maxDim / video.videoWidth, maxDim / video.videoHeight, 1);
        canvas.width = Math.round(video.videoWidth * scale);
        canvas.height = Math.round(video.videoHeight * scale);
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.85));
        } else {
          resolve(undefined);
        }
      } catch {
        resolve(undefined);
      } finally {
        URL.revokeObjectURL(url);
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(undefined);
    };

    // Timeout fallback
    setTimeout(() => {
      URL.revokeObjectURL(url);
      resolve(undefined);
    }, 8000);
  });
}

function captureImageFrame(file: File): Promise<string | undefined> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.src = url;

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const maxDim = 640;
        const scale = Math.min(maxDim / img.naturalWidth, maxDim / img.naturalHeight, 1);
        canvas.width = Math.round(img.naturalWidth * scale);
        canvas.height = Math.round(img.naturalHeight * scale);
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.85));
        } else {
          resolve(undefined);
        }
      } catch {
        resolve(undefined);
      } finally {
        URL.revokeObjectURL(url);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(undefined);
    };

    setTimeout(() => {
      URL.revokeObjectURL(url);
      resolve(undefined);
    }, 5000);
  });
}
