const readline = require('readline');
const {green} = require('colorette');

const loadingAnimation = (text = '', delay = 200) => {
  let x = 0;
  const solidTriangle = '▸';
  const hollowArray = ['▹', '▹', '▹'];

  return setInterval(() => {
    const showedArray = hollowArray.map((icon, i) =>
      i === x ? solidTriangle : icon
    );
    process.stdout.write(`\r${text} ${green(showedArray.join(''))}`);

    x++;
    x = x % hollowArray.length;
  }, delay);
};

const handleLoading = async (text, func) => {
  const intervalId = loadingAnimation(text);

  await func();
  clearInterval(intervalId);
  readline.cursorTo(process.stdout, 0);
  readline.clearLine(process.stdout, 0);
  console.info(`${text} [Done]`);
};

module.exports = {
  handleLoading,
};
