const got = require('got');

module.exports = function sendHook(name, webhookURL, embed) {
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
};
