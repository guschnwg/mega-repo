const puppeteer = require('puppeteer');
const notifier = require('node-notifier');

async function run() {
  const browser = await puppeteer.launch({
    // headless: false,
    // devtools: true,
    // slowMo: 100,
  });

  const page = await browser.newPage();

  await page.goto('https://ais.usvisa-info.com/en-br/niv/users/sign_in');

  await page.type('#user_email', process.env.USER_EMAIL);
  await page.type('#user_password', process.env.USER_PASSWORD);

  await page.click('#policy_confirmed');

  await page.click('[data-disable-with="Sign In"]');

  await page.waitForNetworkIdle();

  const continueButton = await page.$('.button.primary.small');
  const href = await page.evaluate(el => el.getAttribute("href"), continueButton);
  const baseUrl = href.replace('continue_actions', 'appointment/days/');

  const locations = {
    "Rio de Janeiro": 55,
    "Brasília": 54,
    "São Paulo": 56,
    "Recife": 57,
    "Porto Alegre": 128
  }

  for (let location of Object.entries(locations)) {
    const result = await page.evaluate(async ([city, id], baseUrl) => {
      const url = baseUrl + id + ".json?appointments[expedite]=false";
      const res = await fetch(url, { "headers": { "accept": "application/json" } });

      const data = await res.json();

      if (!data || !data.length) {
        return;
      }

      // const msg = new SpeechSynthesisUtterance();
      // msg.text = `Próxima data em ${city} para ${new Date(data[0].date).toLocaleDateString()}`;
      // msg.lang = 'pt-BR';
      // window.speechSynthesis.speak(msg);

      return { city, date: data[0].date };
    }, location, baseUrl);

    if (result) {
      notifier.notify({ title: result.city, message: result.date, timeout: false });
      console.log({ title: result.city, message: result.date });
    }
  }

  await page.close();
  await browser.close();
}

if (process.env.USER_EMAIL && process.env.USER_PASSWORD) {
  run();
}