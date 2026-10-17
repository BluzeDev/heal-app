const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const rootDir = path.resolve(__dirname, '..');
const keystorePath = path.join(rootDir, 'android', 'app', 'heal-release-key.jks');
let inputApk = path.join(rootDir, 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');

if (!fs.existsSync(inputApk)) {
  const fallback = path.join(rootDir, 'heal-app-debug.apk');
  if (fs.existsSync(fallback)) {
    inputApk = fallback;
  }
}

const outputApk = path.join(rootDir, 'heal-app-signed-release.apk');
const apksignerBat = 'C:\\Users\\NurCh\\AppData\\Local\\Android\\Sdk\\build-tools\\35.0.0\\apksigner.bat';

if (!fs.existsSync(inputApk)) {
  console.error('❌ File input APK tidak ditemukan:', inputApk);
  process.exit(1);
}

if (!fs.existsSync(keystorePath)) {
  console.error('❌ Keystore tidak ditemukan:', keystorePath);
  process.exit(1);
}

console.log('🔐 Menandatangani APK dengan Release Keystore (V2 + V3)...');
const env = {
  ...process.env,
  JAVA_HOME: 'C:\\Program Files\\Android\\Android Studio\\jbr',
  PATH: `C:\\Program Files\\Android\\Android Studio\\jbr\\bin;${process.env.PATH}`
};

const cmd = `"${apksignerBat}" sign --ks "${keystorePath}" --ks-key-alias "heal-key" --ks-pass pass:healappsecretkey2026 --key-pass pass:healappsecretkey2026 --out "${outputApk}" "${inputApk}"`;

try {
  execSync(cmd, { env, stdio: 'inherit' });
  console.log('✅ BERHASIL! Signed APK dibuat di:', outputApk);
} catch (e) {
  console.error('❌ Gagal menandatangani APK:', e.message);
  process.exit(1);
}
