const https = require('https');
const fs = require('fs');

const baseURL = 'https://ja.wikipedia.org/wiki/';
const jjba = 'ジョジョの奇妙な冒険';

const page = jjba;

const loadPage = (page,cb) => {
    const filename = `cache/${page}.html`;
    if(fs.existsSync(filename))
        fs.readFile(filename, (err, data) => cb(data));
        //cb(fs.readFileSync(filename));


    const buffer = [];
    https.get(baseURL+encodeURIComponent(page), (res) => {
        console.log(res.statusCode);
        res.on('data', d => {
            buffer.push(d);
        });

        res.on('end', () => {
            fs.writeFile(filename, buffer, () => cb(buffer));
        });
    }).on('error', e => console.log(e));
};

loadPage(jjba, buff => {
    console.log(buff.toString());
});
