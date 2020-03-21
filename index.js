const got = require('got');
const _ = require('lodash');
const moment = require('moment');
const log = require('@harvey1717/logger')();
const config = require('./config.json');
const delay = ms => new Promise(res => setTimeout(res, ms));

const numberFormatter = new Intl.NumberFormat('en-GB');
class CoronaMonitor {
  constructor({ name, apiURL, webhookURL }) {
    this.monitorName = name;
    this.apiURL = apiURL;
    this.webhookURL =
      'https://discordapp.com/api/webhooks/691021806802436106/7Sxpnyth7XeNYHpVa5uivtdfvFqj9zXFwkZlWXyOr6ZGDXBSNslbxAAsW4CksfKCOEFT';
    this.italyData = undefined;
    this.current = undefined;
    this.last = {
      cases: { value: 0 },
      deaths: { value: 0 },
      previousUpdate: undefined
    };
    this.run();
  }

  async run() {
    if (this.last.previousUpdate === undefined) {
      this.getInfectedCount();
    } else {
      log.log(`[ ${this.monitorName} ] --> Waiting for ${config.delayTime} minutes`);
      await delay(config.delayTime * 60000);
      this.getInfectedCount();
    }
  }
  getInfectedCount() {
    got(this.apiURL)
      .json()
      .then(response => {
        if (
          this.last.cases.value === response.cases &&
          this.last.deaths.value === response.deaths
        ) {
          log.log(`[ ${this.monitorName} ] --> No Change.`);
          this.run();
        } else {
          log.log(`[ ${this.monitorName} ] --> New Change.`);
          this.current = response;
          this.filterData();
        }
      })
      .catch(err => console.log(err));
  }

  filterData() {
    const reqData = ['cases', 'deaths'];
    for (let key of Object.keys(this.current)) {
      if (!reqData.includes(key)) delete this.current[key];
    }
    this.calculateIncreases();
  }

  calculateIncreases() {
    for (let key of Object.keys(this.current)) {
      if (this.last.previousUpdate === undefined) {
        this.current[key] = {
          value: this.current[key],
          increase: 0,
          percentageIncrease: 0
        };
      } else {
        const increase = this.current[key] - this.last[key].value;
        this.current[key] = {
          value: this.current[key],
          increase: increase,
          percentageIncrease: (increase / this.last[key].value) * 100
        };
      }
    }
    console.log(this.current);
    if (this.monitorName === 'UK') {
      this.getItaly14DaysAgo();
    } else {
      this.formatEmbed();
    }
  }

  getItaly14DaysAgo() {
    got('https://pomber.github.io/covid19/timeseries.json')
      .json()
      .then(response => {
        const italyDataPerDay = response['Italy'];
        const fourteenDaysAgo = moment()
          .subtract(14, 'days')
          .format('YYYY-M-D');
        const italyDataUnformatted = italyDataPerDay.filter(
          day => day.date === fourteenDaysAgo
        )[0];
        this.italyData = {
          cases: italyDataUnformatted.confirmed,
          deaths: italyDataUnformatted.deaths
        };
        this.formatEmbed();
      })
      .catch(err => console.log(err));
  }

  formatEmbed() {
    const { cases, deaths } = this.current;
    const embed = {
      title: 'COVID-19 Cases',
      color: parseInt('0000ff', 16),
      timestamp: new Date().toISOString(),
      fields: [
        {
          name: 'Previous Change',
          value: this.last.previousUpdate ? this.last.previousUpdate : 'No previous data.'
        },
        {
          name: 'Cases',
          value: `${numberFormatter.format(
            this.last.cases.value
          )} => ${numberFormatter.format(cases.value)} \`(+${cases.increase})\` ⬆️${
            cases.percentageIncrease
          }%`
        },
        {
          name: 'Deaths',
          value: `${numberFormatter.format(
            this.last.deaths.value
          )} => ${numberFormatter.format(deaths.value)} \`(+${deaths.increase})\` ⬆️${
            this.current.deaths.percentageIncrease
          }%`
        }
      ]
    };
    if (this.monitorName === 'UK') {
      embed.fields.push({
        name: 'Italy Cases (-14 Days)',
        value: numberFormatter.format(this.italyData.cases)
      });
      embed.fields.push({
        name: 'Italy Deaths (-14 Days)',
        value: numberFormatter.format(this.italyData.deaths)
      });
    }
    console.log(embed);
    sendHook(this.monitorName, this.webhookURL, embed)
      .then(res => {
        log.log(`[ ${this.monitorName} ] --> Sent Webhook [${res}]`);
        this.cleanup();
      })
      .catch(err => {
        throw err;
      });
  }

  cleanup() {
    this.last = this.current;
    this.current = undefined;
    this.italyData = undefined;
    this.last.previousUpdate = new Date().toISOString();
    this.run();
  }
}

class MonitorManger {
  async start() {
    for (let monitorConfig of config.monitorsConfig) {
      new CoronaMonitor(monitorConfig);
    }
  }
}

const MM = new MonitorManger();
MM.start();

function sendHook(name, webhookURL, embed) {
  return new Promise((resolve, reject) => {
    got
      .post(webhookURL, {
        json: {
          username: 'COVID-19',
          avatar_url:
            'https://www.rcplondon.ac.uk/sites/default/files/styles/sidebar-landscape/public/media/2871-2560x852_0.png?itok=m4HHeMr7',
          content: `${name} Corona Virus Update`,
          embeds: [embed]
        }
      })
      .then(res => {
        resolve(res.statusCode);
      })
      .catch(err => reject(err));
  });
}
