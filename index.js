const puppeteer = require("puppeteer");
const download = require("image-downloader");
const sss = require("shortid");

let scrape = async () => {
  const browser = await puppeteer.launch({
    headless: false
  });

  const page = await browser.newPage();

  const pages = [
    "https://www.imdb.com/search/name?gender=male",
    "https://www.imdb.com/search/name/?gender=male&start=51"
    // "https://www.imdb.com/search/name/?gender=male&start=101",
    // "https://www.imdb.com/search/name/?gender=male&start=151",
    // "https://www.imdb.com/search/name/?gender=male&start=201",
    // "https://www.imdb.com/search/name/?gender=male&start=251",
    // "https://www.imdb.com/search/name/?gender=male&start=301",
    // "https://www.imdb.com/search/name/?gender=male&start=351",
    // "https://www.imdb.com/search/name/?gender=male&start=401",
    // "https://www.imdb.com/search/name/?gender=male&start=451"
  ];

  const fullArray = await loopPages(pages);

  await browser.close();

  return fullArray;

  async function loopPages(pages) {
    let all = [];
    for (let i = 0; i < pages.length; i++) {
      await new Promise(async resolve => {
        await page.goto(pages[i]);
        await page.waitFor(1000);
        const result = await getFromPage(page);
        let a = result.slice(0, 1);
        let b = result.slice(0, 3);
        await loopActorsInList(a, b);
        all.push(...b);
        resolve();
      });
    }
    return all;
  }

  async function getFromPage(page) {
    return await page.evaluate(async () => {
      let data = []; // Create an empty array
      let elements = document.querySelectorAll(".lister-item.mode-detail");

      Array.from(elements).map(item => {
        // get name and link from every item
        let name = item.querySelector(".lister-item-header a").innerText;
        let link = item.querySelector(".lister-item-header a").href;

        data.push({
          name,
          link
        });
      });

      return data;
    });
  }

  async function loopActorsInList(abc, result) {
    for (let i = 0; i < abc.length; i++) {
      await new Promise(async resolve => {
        let actorPage = await browser.newPage();
        await actorPage.goto(abc[i].link); //

        const linkImage = await actorPage.evaluate(() => {
          let image = document.querySelector("#name-poster").src;
          return image;
        });

        result[i].linkImage = linkImage;
        result[i].id = result[i].link.split("/").pop();
        await actorPage.close();
        await downloadIMG(result[i]);

        resolve();
      });
    }
  }

  async function downloadIMG(item) {
    try {
      const { id, linkImage, name } = item;
      const path = `./b/${id}-${name.split(" ")[0]}.jpg`;
      const { filename } = await download.image({
        url: linkImage,
        dest: path
      });
      console.log(filename); // => /path/to/dest/image.jpg
    } catch (e) {
      console.error(e);
    }
  }
};

scrape().then(value => {
  console.log("start");
  console.log(value); // Success!
});
