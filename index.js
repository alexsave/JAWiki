const https = require('https');

const baseURL = 'https://ja.wikipedia.org/wiki/';
const jjba = 'ジョジョの奇妙な冒険';

const buffer = [];
https.get(baseURL+encodeURIComponent(jjba), (res) => {
    console.log(res.statusCode);
    res.on('data', d => {
        buffer.append(d);
        //console.log(d.toString());
        //console.log();
    });

    res.on('end', () => {

    });


}).on('error', e => console.log(e));
