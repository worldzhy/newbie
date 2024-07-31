const figlet = require('figlet');
const {checkEnv} = require('./check-env');

const main = async () => {
  // [step 1] Print the logo of the command-line tool.
  console.info(
    figlet.textSync('Newbie', {
      font: 'Epic',
      horizontalLayout: 'default',
      verticalLayout: 'default',
      width: 80,
      whitespaceBreak: true,
    })
  );

  // [step 2] Print the usage of the command-line tool.
  console.info('Welcome to use newbie command-line tool:)');
  console.info(
    '----------------------------------------------------------------'
  );
  console.info('* Checking environment variables...');
  console.info(
    '----------------------------------------------------------------\n'
  );

  // [step 3] Check .env and print missing env variables.
  checkEnv();
};

main();
