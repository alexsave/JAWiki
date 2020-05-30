const https = require('https');
const fs = require('fs');

const baseURL = 'https://ja.wikipedia.org/wiki/';
const jjba = 'ジョジョの奇妙な冒険';

const page = jjba;

const loadPage = (page,cb) => {
    const filename = `cache/${page}.html`;
    if(fs.existsSync(filename)){
        const stats = fs.statSync(filename);
        const now = new Date().getTime();
        const modi = stats.mtime.getTime();
        console.log(now-modi);

        if(now-modi < 60*60*24*1000){
            fs.readFile(filename, (err, data) => cb(data));
            return;
        }
    }

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
    //console.log(buff.toString());
});
