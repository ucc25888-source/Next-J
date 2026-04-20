/**
 * 壓縮並調整圖片大小，回傳 Base64 字串
 * @param file 原始圖片檔案
 * @param maxWidth 最大寬度限制
 * @param quality 壓縮品質 (0.0 ~ 1.0)
 */
export const compressImage = (file: File, maxWidth = 1200, quality = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // 計算等比例縮放後的尺寸
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('無法取得 canvas context'));
          return;
        }

        // 繪製壓縮後的圖片
        ctx.drawImage(img, 0, 0, width, height);

        // 轉為 Base64 字串
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

/**
 * 下載 Base64 圖片
 * @param base64Url 圖片的 Base64 字串
 * @param filename 下載的檔案名稱
 */
export const downloadBase64Image = (base64Url: string, filename: string) => {
  const link = document.createElement('a');
  link.href = base64Url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
