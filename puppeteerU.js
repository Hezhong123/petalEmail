const puppeteer = require('puppeteer');
const fs = require('fs');
const {stringify} = require('csv-stringify');

let  scrapePage =(url) => new Promise(async (res, err) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');

    try {
        await page.goto(url, {waitUntil: 'networkidle2'});
        await page.setRequestInterception(true);
        page.on('request', request => {
            if (request.resourceType() === 'image' || request.resourceType() === 'media') {
                request.abort();
            } else {
                request.continue();
            }
        });
        await page.mouse.move(0, 0); // 将鼠标移动到页面左上角
        for (let i = 0; i < 10; i++) {
            await page.mouse.wheel({ deltaY: 1000 }); // 向下滚动 1000 像素
            await new Promise(resolve => setTimeout(resolve, 500)); // 等待一段时间，以便内容加载
            console.log(`爬取第${i}页`)

        }

        // const content = await page.content();
        // console.log(content);
        const titles = await page.$$eval('.h-product', elements => {
            const regex = /\d{6}/g;
            console.log("爬取后数据", elements)
            return elements.map(element => {
                const url = element.querySelector('a').href;
                const img = element.querySelector('img').src;
                const code = element.querySelector('.product-name').textContent.slice(-6)
                const sex = element.querySelector('.p-sex').textContent;
                const title = element.querySelector('.product-name').textContent.replace(regex, '');
                const price = element.querySelector('.h-currency').textContent.replace('¥', '');
                const _price = 0;
                const start = 0
                return {sex, start, title, code, price, _price, img, url};
            });
        });

        res(titles)
    } catch (error) {
        err(error)
        console.error('爬取页面出错:', error);
    }

    await browser.close();
})

// 爬取女装
// scrapePage('https://www.uniqlo.cn/c/XD-W0207.html').then(res => {
//     // 将 JSON 数据转换为 CSV 字符串
//     const columns = ['sex','start','title', 'code', 'price', '_price', 'img', 'url']
//     stringify(res, {header: true, columns}, (err, output) => {
//         if (err) return console.error(err);
//         // 写入 CSV 文件
//         fs.writeFile('csv/uMailW.csv', output, (err) => {
//             if (err) return console.error(err);
//             console.log('Data written to file successfully!');
//         });
//     });
// })


// 爬取男装
scrapePage('https://www.uniqlo.cn/c/XD-M0207.html').then(res => {
    // 将 JSON 数据转换为 CSV 字符串
    const columns = ['sex','start', 'title', 'code', 'price', '_price', 'img', 'url']
    stringify(res, {header: true, columns}, (err, output) => {
        if (err) return console.error(err);
        // 写入 CSV 文件
        fs.writeFile('csv/uMailM.csv', output, (err) => {
            if (err) return console.error(err);
            console.log('Data written to file successfully!');
        });
    });
})

// 爬取童装
// scrapePage('https://www.uniqlo.cn/c/XD-K0207.html').then(async res => {
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








