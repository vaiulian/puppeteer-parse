
const puppeteer = require('puppeteer');
const download = require('image-downloader');
const shortid = require('shortid');

console.log('1 ',shortid.generate());


let scrape = async () => {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();

    await page.goto('https://www.imdb.com/search/name?gender=male');
    await page.waitFor(1000);
    console.log('2 ',shortid.generate());

    const result = await page.evaluate(async(shortid) => {

        console.log('ceva ', shortid);

        console.log('3 ',shortid.generate());

        let data = []; // Create an empty array
        let elements = document.querySelectorAll('.lister-item.mode-detail');

        Array.from(elements).map((item) => {
            // get name and link from every item
            let name = item.querySelector('.lister-item-header a').innerText;
            let link = item.querySelector('.lister-item-header a').href;

            data.push({name, link}); // Push the data to our array

        })

        return data;
    }, shortid);

    let abc = result.slice(0,4);

    await loopActorsInList();
    await browser.close();
    return result;


    async function loopActorsInList() {
        // sync for loop
        for (let i = 0; i < abc.length; i++) {
            console.log('Page ID Spawned', i)
            //async promise
            await new Promise(async resolve => {
                let actorPage = await browser.newPage()
                await actorPage.goto(abc[i].link); //
                    
                const linkImage = await actorPage.evaluate(() => {
                    let image = document.querySelector('#name-poster').src
                    return image;
                });

                result[i].linkImage = linkImage;
                await actorPage.close();
                await downloadIMG(result[i]);
                
                resolve()
            });
        }
    }

    async function downloadIMG(item) {
        try {
            const { linkImage, name } = item;
            const path = name + ".jpg"
            const { filename, image } = await download.image({url: linkImage, dest: path})
            console.log(filename) // => /path/to/dest/image.jpg 
        } catch (e) {
            console.error(e)
        }
    }
};

scrape().then((value) => {
    console.log('start')
    console.log(value); // Success!
});