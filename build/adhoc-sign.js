// Mac: sign the app "ad hoc" (no Apple Developer ID). Without any signature, macOS on Apple Silicon says the app
// "is damaged" and only a Terminal command opens it. With an ad hoc signature, people open it from
// System Settings → Privacy & Security → Open Anyway, without Terminal.
const { execFileSync } = require('child_process');
const path = require('path');
exports.default = async function (ctx) {
  if (ctx.electronPlatformName !== 'darwin') return;
  const app = path.join(ctx.appOutDir, ctx.packager.appInfo.productFilename + '.app');
  execFileSync('codesign', ['--force', '--deep', '--sign', '-', app], { stdio: 'inherit' });
  execFileSync('codesign', ['--verify', '--deep', '--strict', app], { stdio: 'inherit' });
};
