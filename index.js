const got = require('got');
const cheerio = require('cheerio');
const log = require('@harvey1717/logger')();
// const config = require('./config.json');
const delay = ms => new Promise(res => setTimeout(res, ms));

(() => {
  getDelayTime();
})();

let infectedCountTemp = {
  count: 'none',
  lastUpdated: 'none'
};

function getDelayTime() {
  const startTimeSplit = process.env.startTime.split(':');
  const startTimeDate = new Date();
  startTimeDate.setHours(startTimeSplit[0]);
  startTimeDate.setMinutes(startTimeSplit[1]);
  startTimeDate.setSeconds(startTimeSplit[2]);
  startTimeDate.setMilliseconds(startTimeSplit[3]);
  if (startTimeDate < new Date()) {
    // * If it has passed the start time for the current day
    log.log('Running tomorrow');
    startTimeDate.setDate(startTimeDate.getDate() + 1);
  }
  const delayTime = startTimeDate - new Date();
  startMonitor(delayTime);
}

async function startMonitor(delayTime) {
  log.message(`Waiting ${delayTime / 1000} seconds`);
  await delay(delayTime);
  getInfectedCount();
}

function getInfectedCount() {
  got(
    'https://www.gov.uk/guidance/coronavirus-covid-19-information-for-the-public#number-of-cases'
  )
    .then(response => {
      const $ = cheerio.load(response.body);
      const status = $(
        '#contents > div.gem-c-govspeak.govuk-govspeak.direction-ltr > div > p:nth-child(12)'
      ).text();
      const infectedCountAtEnd = status.split('were confirmed as positive')[0].split(' ');
      const infectedCount = infectedCountAtEnd[infectedCountAtEnd.length - 2];
      console.log(infectedCount);
      getIncreaseAmount(infectedCount);
    })
    .catch(err => console.log(err));
}

function getIncreaseAmount(infectedCount) {
  let increaseAmountStatus = undefined;
  if (infectedCountTemp.lastUpdated === 'none') {
    increaseAmountStatus = 'No past data';
  } else {
    increaseAmountStatus = infectedCount - infectedCountTemp;
  }
  const jsonData = {
    username: 'COVID-19',
    avatar_url:
      'https://www.rcplondon.ac.uk/sites/default/files/styles/sidebar-landscape/public/media/2871-2560x852_0.png?itok=m4HHeMr7',
    content: 'Corona Virus Update',
    embeds: [
      {
        title: 'COVID-19 cases in the UK',
        url:
          'https://www.gov.uk/guidance/coronavirus-covid-19-information-for-the-public#number-of-cases',
        description: `Data is fetched from URL above and may not be accurate. Updates will be sent once per day`,
        color: parseInt('FF0000', 16),
        timestamp: new Date().toISOString(),
        // footer: {
        //   text: ''
        // },
        thumbnail: {
          url:
            'https://assets.publishing.service.gov.uk/static/opengraph-image-a1f7d89ffd0782738b1aeb0da37842d8bd0addbd724b8e58c3edbc7287cc11de.png'
        },
        fields: [
          {
            name: 'New Count',
            value: infectedCount
          },
          {
            name: 'Old Count',
            value: infectedCountTemp.count
          },
          {
            name: `Increase (Since ${infectedCountTemp.lastUpdated})`,
            value: increaseAmountStatus
          }
        ]
      }
    ]
  };
  got
    .post(process.env.webhookURL, {
      json: jsonData
    })
    .then(res => {
      console.log(res.statusCode);
      infectedCountTemp.count = infectedCount;
      infectedCountTemp.lastUpdated = new Date().toISOString;
      getDelayTime();
    })
    .catch(err => console.log(err));
}
