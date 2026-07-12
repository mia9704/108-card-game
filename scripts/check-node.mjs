const [major, minor, patch] = process.versions.node.split('.').map(Number);
const current = major * 10_000 + minor * 100 + patch;
const minimum = 20 * 10_000 + 19 * 100 + 4;

if (current < minimum) {
  console.error(
    `\nNode.js ${process.version} is too old for Expo 57 (requires >= 20.19.4).\n` +
      'Metro crashes on this version when reporting errors.\n\n' +
      'Fix:\n' +
      '  nvm use\n' +
      '  npm start\n',
  );
  process.exit(1);
}
