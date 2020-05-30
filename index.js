const jsdom = require('jsdom');
const { JSDOM } = jsdom;
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

const parsePage = buff => {
    let theString = '';
    const dom = new JSDOM(buff);
    const window = dom.window;
    //const elTypes = [window.HTMLDivElement, window.HTMLTableElement, window.HTMLParagraphElement, window.HTMLHeadingElement, window.HTMLDListElement, window.HTMLUListElement];

    const firstHeading = window.document.querySelector('#firstHeading');
    theString += firstHeading.textContent;

    const output = dom.window.document.querySelector('.mw-parser-output');
    Object.values(output.children).forEach(el => {
        //dumb but hey
        if(el instanceof window.HTMLDivElement)
            theString += el.textContent;
        else if(el instanceof window.HTMLTableElement)
            theString += el.textContent;
        else if(el instanceof window.HTMLParagraphElement)
            theString += el.textContent;
        else if(el instanceof window.HTMLHeadingElement)
            theString += el.textContent;
        else if(el instanceof window.HTMLDListElement)
            theString += el.textContent;
        else if(el instanceof window.HTMLUListElement)
            theString += el.textContent;
        else
            console.log(el);
    });

    parseString(theString);
};

//finally the fun part
const parseString = str => {
    const hiragana = 'のい';
    const katakana ='ジョン';
    const alpha =
    const num =
    const delim = '\n  ';

    const dict = {};

    //this is for rudicmentary detecting changes in words
    //a: alpha
    //n: numberic
    //h: hiragana
    //k: katakana
    //j: kanji
    //0: delim or start
    let lastType = '0';
    let run = '';

    const addCurr = () => {
        if (!(run in dict))
            dict[run] = 0;
        dict[run]++;
    }

    for(let i = 0; i < str.length; i++){
        const c = str.charAt(i);

        let cType;
        if(c in delim)
            cType = '0';
        else if(c in katakana)
            cType = 'k';
        else if(c in hiragana)
            cType = 'h';
        else if(/[a-zA-Z]/.test(c))
            cType = 'a';
        else if(/[0-9]/.test(c))
            cType = 'n';
        else
            cType = 'j';

        if(cType === lastType)
            run += c;
        else{
            addCurr();
            lastType = cType

        }


    }

    const ranked = Object.entries(dict).sort((a,b) => a[1]-b[1]);
    ranked.forEach(o => console.log(o));
    //console.log(ranked);
};

loadPage(jjba, parsePage);
