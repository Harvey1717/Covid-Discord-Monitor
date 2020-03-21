const got = require('got');
const _ = require('lodash');
const log = require('@harvey1717/logger')();
const config = require('./config.json');
const delay = ms => new Promise(res => setTimeout(res, ms));

start();

async function start() {
  if (config.mode === 'AT_TIME') {
    getDelayTime();
  } else if (config.mode === 'AT_INTERVAL') {
    log.log(`Waiting for ${config.delayTime} minutes`);
    await delay(config.delayTime * 60000);
    getInfectedCount();
  }
}

let countryDataTemp = {
  countryData: undefined,
  lastUpdated: 'No Past Update.'
};

function getDelayTime() {
  const startTimeSplit = config.startTime.split(':');
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
  got('https://coronavirus-19-api.herokuapp.com/countries')
    .json()
    .then(response => {
      const countryData = response.find(countryData => countryData.country === 'UK');
      console.log(countryData);
      console.log(countryDataTemp.countryData);
      if (_.isEqual(countryDataTemp.countryData, countryData)) {
        console.log('No Change');
        start();
      } else {
        console.log(countryData);
        sendHook(countryData);
      }
    })
    .catch(err => console.log(err));
}

function sendHook(countryData) {
  const jsonData = {
    username: 'COVID-19',
    avatar_url:
      'https://www.rcplondon.ac.uk/sites/default/files/styles/sidebar-landscape/public/media/2871-2560x852_0.png?itok=m4HHeMr7',
    content: 'Corona Virus Update',
    embeds: [
      {
        title: 'COVID-19 cases in the UK',
        color: parseInt('FF0000', 16),
        timestamp: new Date().toISOString(),
        thumbnail: {
          url:
            'https://assets.publishing.service.gov.uk/static/opengraph-image-a1f7d89ffd0782738b1aeb0da37842d8bd0addbd724b8e58c3edbc7287cc11de.png'
        },
        fields: [
          {
            name: 'Last Update',
            value: countryDataTemp.lastUpdated
          },
          {
            name: 'Cases',
            value: `${countryData.cases} (+${
              countryDataTemp.countryData
                ? countryData.cases - countryDataTemp.countryData.cases
                : 'No past data'
            })`
          },
          {
            name: 'Deaths',
            value: `${countryData.deaths} (+${
              countryDataTemp.countryData
                ? countryData.deaths - countryDataTemp.countryData.deaths
                : 'No past data'
            })`
          },
          {
            name: 'Active',
            value: `${countryData.active} (+${
              countryDataTemp.countryData
                ? countryData.active - countryDataTemp.countryData.active
                : 'No past data'
            })`
          },
          {
            name: 'Recovered',
            value: `${countryData.recovered} (+${
              countryDataTemp.countryData
                ? countryData.recovered - countryDataTemp.countryData.recovered
                : 'No past data'
            })`
          },
          {
            name: 'Critical',
            value: `${countryData.critical} (+${
              countryDataTemp.countryData
                ? countryData.critical - countryDataTemp.countryData.critical
                : 'No past data'
            })`
          }
        ]
      }
    ]
  };
  console.log(jsonData.embeds[0].fields);
  got
    .post(config.webhookURL, {
      json: jsonData
    })
    .then(res => {
      console.log(res.statusCode);
      finish(countryData);
    })
    .catch(err => console.log(err));
}

function finish(countryData) {
  console.log(countryData);
  countryDataTemp.countryData = countryData;
  countryDataTemp.lastUpdated = new Date().toISOString();
  start();
}
