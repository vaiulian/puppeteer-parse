const puppeteer = require("puppeteer");
const download = require("image-downloader");
const sss = require("shortid");

let scrape = async () => {
    const browser = await puppeteer.launch({
        headless: false
    });

    const page = await browser.newPage();

    const result = [];

    await page.goto("https://www.imdb.com/search/name?gender=male");
    await page.waitFor(1000);

    const result1 = await getFromPage(page);
    await loopActorsInList(result1.slice(0, 1), result1);
    result.push(result1);


    await page.goto("https://www.imdb.com/search/name/?gender=male&start=51&ref_=rlm");
    await page.waitFor(1000);

    const result2 = await getFromPage(page);
    await loopActorsInList(result2.slice(0, 1), result2);
    result.push(result2);

    await browser.close();

    console.log(result1);
    console.log(result2);

    return [...result1, ...result2];

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
        // sync for loop
        for (let i = 0; i < abc.length; i++) {
            console.log("Page ID Spawned", i);
            //async promise
            await new Promise(async resolve => {
                let actorPage = await browser.newPage();
                await actorPage.goto(abc[i].link); //

                const linkImage = await actorPage.evaluate(() => {
                    let image = document.querySelector("#name-poster").src;
                    return image;
                });

                result[i].linkImage = linkImage;
                result[i].id = result[i].link.split('/').pop();
                await actorPage.close();
                await downloadIMG(result[i]);

                resolve();
            });
        }
    }

    async function downloadIMG(item) {
        try {
            const {
                id,
                linkImage,
                name
            } = item;
            const path = `${id}-${name.split(' ')[0]}.jpg`;
            const {
                filename
            } = await download.image({
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