/**
 * Requires Axios, Chreerio an Moment
 * yarn add axios
 * yarn add cheerio
 * yarn add moment
 */

const axios = require('axios');
const cheerio = require('cheerio');
const moment = require('moment');
const fs = require('fs');

(async () => {
  const events = [];
  let page = 1;

  async function getAllEvents() {
    console.log('Getting page: ' + page);
    const pageContent = await axios.get(
      'https://www.azkunazentroa.eus/az/cast/inicio/agenda-4?menufechas=pasadas' + (page !== 1 ? '&page=' + page : '')
    );
    const $ = cheerio.load(pageContent.data);

    $('article.activity a').map((_, e) => events.push('https://www.azkunazentroa.eus' + $(e).attr('href')));

    if (page === 1 || $('.pagination li.arrow').length == 2) {
      page++;
      getAllEvents();
    } else {
      const data = [];

      for (let i in events) {
        url = events[i];
        const eventData = await getEventFromURL(url);
        data.push(eventData);
      }
      console.log(data);

      if (fs.existsSync('events.json')) {
        fs.unlinkSync('events.json');
      }
      fs.writeFile('events.json', JSON.stringify(data), {overwrite: true, flag: 'wx'}, (err) =>
        err ? console.log(err) : console.log('Data Saved')
      );
    }
  }

  getAllEvents();

  const startsWithNumber = (str) => !!parseInt(str[0]);

  async function getPage(url) {
    console.log('Getting info from: ' + url);
    const pageContent = await axios.get(url);
    const $ = cheerio.load(pageContent.data);
    console.log('Loader: ' + url);
    return $;
  }

  const cleanDateString = (dateString) => {
    return dateString
      ? dateString
          .replace('del ', '')
          .replace(/de\s/g, '')
          .replace('enero', '01')
          .replace('febrero', '02')
          .replace('marzo', '03')
          .replace('abril', '04')
          .replace('mayo', '05')
          .replace('junio', '06')
          .replace('julio', '07')
          .replace('agosto', '08')
          .replace('septiembre', '09')
          .replace('octubre', '10')
          .replace('noviembre', '11')
          .replace('diciembre', '12')
          .replace(/\s/g, '-')
          .trim()
      : '';
  };

  const getSlugFromUrl = (url) => {
    const urlElements = url.split('/');
    return urlElements[urlElements.length - 2];
  };

  const getDateFromEvent = ($) => {
    const date = $('.incollapse.inleft header h2').text().toLowerCase();
    let start,
      end = null;
    if (startsWithNumber(date)) {
      var eventDate = moment(cleanDateString(date), 'DD-MM-YYYY');
      start = end = eventDate.format('YYYY-MM-DD');
    } else {
      let dates = date.split(' al ');
      var eventDateStart = moment(cleanDateString(dates[0]), 'DD-MM-YYYY');
      var eventDateEnd = moment(cleanDateString(dates[1]), 'DD-MM-YYYY');
      start = eventDateStart.format('YYYY-MM-DD');
      end = eventDateEnd.format('YYYY-MM-DD');
    }

    return {
      start: start,
      end: end,
    };
  };

  const getDataFromEvent = ($, url) => {
    return {
      slug: getSlugFromUrl(url),
      img: 'https://www.azkunazentroa.eus' + $('.img-container img').attr('src'),
      title: $('.incollapse.inleft header h1').text(),
      content: $('.incollapse.inleft p:not(.section-title)')
        .toArray()
        .map((e) => $(e).html())
        .join('<br/>'),
      category: $('.incollapse.inleft p.section-title').text(),
    };
  };

  async function getEventFromURL(url) {
    const $ = await getPage(url);
    const urlEu = 'https://www.azkunazentroa.eus' + $('a[hreflang=eu]').last().attr('href');
    const urlEn = 'https://www.azkunazentroa.eus' + $('a[hreflang=en]').last().attr('href');
    const [$eu, $en] = await Promise.all([getPage(urlEu), getPage(urlEn)]);

    return {
      date: getDateFromEvent($),
      es: getDataFromEvent($, url),
      en: getDataFromEvent($en, urlEn),
      eu: getDataFromEvent($eu, urlEu),
    };
  }
})();
