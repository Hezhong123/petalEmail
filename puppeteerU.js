const puppeteer = require('puppeteer');
const fs = require('fs');
const {stringify} = require('csv-stringify');

function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}

async function scrollToBottom(page) {
    await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
    });
    await delay(2000); // 等待2秒，调整等待时间
}

async function scrapeUniqloTimeLimit(url) {
    return new Promise(async resolve => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url);

        let previousHeight;
        do {
            previousHeight = await page.evaluate(() => document.body.scrollHeight);
            await scrollToBottom(page);
            await delay(2000);
        } while (previousHeight !== await page.evaluate(() => document.body.scrollHeight));
        const titles = await page.$$eval('.h-product', elements => {
            const regex = /\d{6}/g;
            return elements.map(element => {
                const url = element.querySelector('a').href;
                const img = element.querySelector('img').src;
                const code = element.querySelector('.product-name').textContent.slice(-6)
                const sex = element.querySelector('.p-sex').textContent;
                const title = element.querySelector('.product-name').textContent.replace(regex, '');
                const price = element.querySelector('.h-currency').textContent.replace('¥', '');
                const _price = 0;
                const start = 0
                return {sex,start, title, code, price, _price, img, url};
            });
        });
        resolve(titles);
        await browser.close();
    })
}


// 爬取童装
// scrapeUniqloTimeLimit('https://www.uniqlo.cn/c/XIANDING-K0809.html').then(async res => {
//     const columns = ['sex','start', 'title', 'code', 'price', '_price', 'img', 'url']
//     stringify(res, {header: true, columns}, (err, output) => {
//         if (err) return console.error(err);
//         // 写入 CSV 文件
//         fs.writeFile('csv/uMailK.csv', output, (err) => {
//             if (err) return console.error(err);
//             console.log('Data written to file successfully!');
//         });
//     });
// })

// 爬取男装
// scrapeUniqloTimeLimit('https://www.uniqlo.cn/c/XIANDING-M0809.html').then(res => {
//     // 将 JSON 数据转换为 CSV 字符串
//     const columns = ['sex','start', 'title', 'code', 'price', '_price', 'img', 'url']
//     stringify(res, {header: true, columns}, (err, output) => {
//         if (err) return console.error(err);
//         // 写入 CSV 文件
//         fs.writeFile('csv/uMailM.csv', output, (err) => {
//             if (err) return console.error(err);
//             console.log('Data written to file successfully!');
//         });
//     });
// })

// 爬取女装
scrapeUniqloTimeLimit('https://www.uniqlo.cn/c/XIANDING-W0809.html').then(res => {
    // 将 JSON 数据转换为 CSV 字符串
    const columns = ['sex','start','title', 'code', 'price', '_price', 'img', 'url']
    stringify(res, {header: true, columns}, (err, output) => {
        if (err) return console.error(err);
        // 写入 CSV 文件
        fs.writeFile('csv/uMailW.csv', output, (err) => {
            if (err) return console.error(err);
            console.log('Data written to file successfully!');
        });
    });
})

async function pricePage(url) {
    return new Promise(async (resolve, reject) => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url);
        await delay(2000);
        const originalPriceElement = await page.$('.h-currency'); // 替换成实际的 CSS 选择器
        if (originalPriceElement) {
            const originalPrice = await originalPriceElement.evaluate(el => el.textContent);
            resolve(originalPrice.replace('¥', ''))
            console.log('原价:', originalPrice);
        } else {
            console.log('未找到原价元素');
            resolve(0)
        }

        await browser.close();
    })

}



