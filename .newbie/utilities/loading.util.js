const readline = require('readline');
const {underline} = require('colorette');

const loadingAnimation = (
  text = '',
  chars = ['⠙', '⠘', '⠰', '⠴', '⠤', '⠦', '⠆', '⠃', '⠋', '⠉'],
  delay = 100
) => {
  let x = 0;

  return setInterval(() => {
    process.stdout.write(`\r${chars[x++]}${text}`);
    x = x % chars.length;
  }, delay);
};

const handleLoading = async (text, func) => {
  const intervalId = loadingAnimation(text);

  await func();
  clearInterval(intervalId);
  readline.cursorTo(process.stdout, 0);
  readline.clearLine(process.stdout, 0);
  console.info('|' + underline(text) + '|');
};

module.exports = {
  handleLoading,
};
