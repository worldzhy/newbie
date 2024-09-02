const readline = require('readline');
const {green, underline} = require('colorette');

const loadingAnimation = (text = '', delay = 100) => {
  let x = 0;
  const solidTriangle = '▸';
  const hollowArray = ['▹', '▹', '▹', '▹', '▹'];

  return setInterval(() => {
    x++;
    const showedArray = hollowArray.map((icon, i) =>
      i === x ? solidTriangle : icon
    );

    process.stdout.write(`\r${green(showedArray.join(''))}${text}☕`);
    x = x % hollowArray.length;
  }, delay);
};

const handleLoading = async (text, func) => {
  const intervalId = loadingAnimation(text);

  await func();
  clearInterval(intervalId);
  readline.cursorTo(process.stdout, 0);
  readline.clearLine(process.stdout, 0);
  console.info('|' + underline(`✅${text.replace('...', ' done')}`) + '|');
};

module.exports = {
  handleLoading,
};
