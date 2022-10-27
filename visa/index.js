const puppeteer = require('puppeteer');
const say = require('say');

async function sayNextMonth(page, dayToSelect) {
  const datePickerGroup = await page.evaluateHandle(el => el.closest('.ui-datepicker-group'), dayToSelect);
  if (datePickerGroup) {
    const datePickerTitle = await page.evaluateHandle(el => el.querySelector('.ui-datepicker-title'), datePickerGroup);
    if (datePickerTitle) {
      const day = await (await dayToSelect.getProperty('textContent')).jsonValue();
      const monthAndYear = await (await datePickerTitle.getProperty('textContent')).jsonValue();
      say.speak(day + ' ' + monthAndYear);
    }
  }
}

async function run() {
  const browser = await puppeteer.launch({
    headless: false,
    // devtools: true,
    slowMo: 100,
    defaultViewport: {
      width: 1200,
      height: 800,
    }
  });

  const page = await browser.newPage();

  await page.goto('https://ais.usvisa-info.com/en-br/niv/users/sign_in');

  await page.type('#user_email', process.env.USER_EMAIL);
  await page.type('#user_password', process.env.USER_PASSWORD);

  await page.click('#policy_confirmed');

  await page.click('[data-disable-with="Sign In"]');

  await page.waitForNetworkIdle();

  const continueButton = await page.$('.button.primary.small');
  await continueButton.click()

  await page.waitForNetworkIdle();

  const accordionButton = await page.$('.fa-calendar-minus');
  await accordionButton.click();

  const rescheduleButton = await page.waitForSelector('[href*="/en-br/niv/schedule/"][href$="/appointment"]');
  await rescheduleButton.click();

  await page.waitForNetworkIdle();

  const dateInput = await page.waitForSelector('#appointments_consulate_appointment_date');
  await dateInput.click();

  let tries = 20;
  let dayToSelect = await page.$('.ui-state-default[href="#"]');
  while (!dayToSelect && tries > 0) {
    const nextButton = await page.$('.ui-datepicker-next');
    await nextButton.click();

    tries -= 1;
    dayToSelect = await page.$('.ui-state-default[href="#"]');
  }

  if (dayToSelect) {
    await sayNextMonth(page, dayToSelect)
  }

  // This is lame
  // const href = await page.evaluate(el => el.getAttribute("href"), continueButton);
  // const baseUrl = href.replace('continue_actions', 'appointment/days/');

  // const locations = {
  //   "Rio de Janeiro": 55,
  //   "Brasília": 54,
  //   "São Paulo": 56,
  //   "Recife": 57,
  //   "Porto Alegre": 128
  // }

  // for (let location of Object.entries(locations)) {
  //   const result = await page.evaluate(async ([city, id], baseUrl) => {
  //     const url = baseUrl + id + ".json?appointments[expedite]=false";
  //     const res = await fetch(url, { "headers": { "accept": "application/json" } });

  //     const data = await res.json();

  //     if (!data || !data.length) {
  //       return;
  //     }

  //     // const msg = new SpeechSynthesisUtterance();
  //     // msg.text = `Próxima data em ${city} para ${new Date(data[0].date).toLocaleDateString()}`;
  //     // msg.lang = 'pt-BR';
  //     // window.speechSynthesis.speak(msg);

  //     return { city, date: data[0].date };
  //   }, location, baseUrl);

  //   if (result) {
  //     notifier.notify({ title: result.city, message: result.date, timeout: false });
  //     console.log({ title: result.city, message: result.date });
  //   }
  // }

  // Don't close, we want to be able to select
  // await page.close();
  // await browser.close();
}

if (process.env.USER_EMAIL && process.env.USER_PASSWORD) {
  run();
}