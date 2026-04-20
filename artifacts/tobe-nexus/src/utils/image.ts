export const compressImage = (
  file: File,
  maxWidth = 1200,
  quality = 0.85,
  maxHeight = 900,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const widthRatio = maxWidth / width;
        const heightRatio = maxHeight / height;
        const scale = Math.min(1, widthRatio, heightRatio);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('無法取得 canvas context'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = (error) => reject(error);
      if (event.target?.result) {
        img.src = event.target.result as string;
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export const downloadBase64Image = (base64Url: string, filename: string) => {
  const link = document.createElement('a');
  link.href = base64Url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
