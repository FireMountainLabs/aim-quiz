const fs = require('fs');
const https = require('https');
const http = require('http');
const path = require('path');

const jsonPath = path.join(__dirname, '../ai_maturity_quick_check.json');
const outputPath = path.join(__dirname, '../public/logo.png');

function download(url, dest, cb) {
  const mod = url.startsWith('https') ? https : http;
  const file = fs.createWriteStream(dest);
  mod.get(url, (response) => {
    if (response.statusCode !== 200) {
      cb(new Error(`Failed to get '${url}' (${response.statusCode})`));
      return;
    }
    response.pipe(file);
    file.on('finish', () => file.close(cb));
  }).on('error', (err) => {
    fs.unlink(dest, () => cb(err));
  });
}

function main() {
  if (!fs.existsSync(jsonPath)) {
    console.error('Config file not found:', jsonPath);
    process.exit(1);
  }
  const config = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const logoUrl = config.app_config && config.app_config.logo_image_url;
  if (!logoUrl) {
    console.error('logo_image_url not found in config.');
    process.exit(1);
  }
  // Ensure public dir exists
  const publicDir = path.dirname(outputPath);
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }
  download(logoUrl, outputPath, (err) => {
    if (err) {
      console.error('Failed to download logo:', err.message);
      process.exit(1);
    } else {
      console.log('Logo downloaded to', outputPath);
    }
  });
}

main(); 