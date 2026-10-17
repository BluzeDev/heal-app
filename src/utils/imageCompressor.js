/**
 * imageCompressor.js — Kompresi Otomatis Avatar/Foto Profil HEAL
 * Menggunakan HTML5 Canvas untuk meresize gambar ke maksimal 256x256 piksel,
 * format image/jpeg, quality 0.7 sehingga menghasilkan Base64 ringan (<50KB)
 * yang dapat disimpan langsung ke Firestore tanpa melanggar batas dokumen 1MB
 * dan tanpa ketergantungan Firebase Storage berbayar.
 */
export function compressImageFile(file, maxWidth = 256, maxHeight = 256, quality = 0.7) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('File harus berupa gambar (JPEG, PNG, WebP)'));
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onerror = (err) => reject(new Error('Gagal membaca file gambar: ' + err));
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onerror = (err) => reject(new Error('Gagal memproses gambar: ' + err));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Pertahankan rasio aspek gambar saat me-resize ke batas 256x256
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        // Aktifkan image smoothing untuk kualitas kompresi optimal
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Ekspor Base64 JPEG dengan kompresi quality 0.7
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
    };
  });
}
