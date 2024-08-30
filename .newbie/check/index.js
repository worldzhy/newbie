const figlet = require('figlet');
const {checkEnv} = require('./check-env');

const main = async () => {
  // [step 1] Print the logo of the command-line tool.
  console.info(
    figlet.textSync('Newbie', {
      width: 80,
      font: 'Epic',
      verticalLayout: 'default',
      horizontalLayout: 'default',
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
  await checkEnv();
};

main();
