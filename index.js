const http = require('http');
const ejs = require('ejs');
const {GetSCV,SetSCV,FilterGoods, FilterUserGoods} = require('./csv');

const server = http.createServer(async (req, res) => {
    const url = req.url;
    console.log(url)
    if (url === '/') {
        if(req.method === 'POST'){
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                // 处理接收到的数据
                const urlParams = new URLSearchParams(body);
                const obj = Object.fromEntries(urlParams.entries());
                let sex =[]
                obj.sex1=='1'?sex.push(1):''
                obj.sex2=='2'?sex.push(2):''
                obj.sex3=='3'?sex.push(3):''
                console.log(obj,sex);
                SetSCV({email:obj.email,sex})
                // 发送响应
                ejs.renderFile('ejs/200.ejs', {}, (err, html) => {
                    res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
                    res.end(html);
                })
            });
        }else {
            ejs.renderFile('ejs/index.ejs', {}, (err, html) => {
                if (err) {
                    console.error(err);
                    res.statusCode = 500;
                    res.end('Server Error');
                } else {
                    res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
                    res.end(html);
                }
            })
        }
    } else if (url === '/uMail?sex=1') {
        let data = FilterGoods(await GetSCV('csv/uMailM.csv'))
        await ejs.renderFile('ejs/mail.ejs', {
            title: "8月8日-8月15日 男装", data }, (err, html) => {
            if (err) {
                console.error(err);
                res.statusCode = 500;
                res.end('Server Error');
            } else {
                res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
                res.end(html);
            }
        })

    } else if (url === '/uMail?sex=2') {
        let data = FilterGoods(await GetSCV('csv/uMailW.csv'))
        await ejs.renderFile('ejs/mail.ejs', {
            title: "8月8日-8月15日 女装", data }, (err, html) => {
            if (err) {
                console.error(err);
                res.statusCode = 500;
                res.end('Server Error');
            } else {
                res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
                res.end(html);
            }
        })
    }else if (url === '/uMail?sex=3') {
        let data = FilterGoods(await GetSCV('csv/uMailK.csv'))
        await ejs.renderFile('ejs/mail.ejs', {title: "8月8日-8月15日 童装", data }, (err, html) => {
            if (err) {
                console.error(err);
                res.statusCode = 500;
                res.end('Server Error');
            } else {
                res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
                res.end(html);
            }
        })
    } else if(url=== '/mail'){
        let data = await FilterUserGoods(['1','2','3'])
        let html = await ejs.renderFile('ejs/mail.ejs', {title: '8月8日-8月15日 限时折扣', data })
        res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
        res.end(html);
    } else {
        ejs.renderFile('ejs/404.ejs', {}, (err, html) => {
            if (err) {
                console.error(err);
                res.statusCode = 500;
                res.end('Server Error');
            } else {
                res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
                res.end(html);
            }
        })
    }
});

server.listen(3000, () => {
    console.log('Server running at http://localhost:3000/');
});

