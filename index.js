const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const https = require('https');
const fs = require('fs');

const baseURL = 'https://ja.wikipedia.org/wiki/';
const jjba = 'ジョジョの奇妙な冒険';

const loadPage = (page,cb) => {
    console.log(`Loading ${page}`);
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
            //fs.writeFile(filename, buffer, () =>
                //setTimeout(() => cb(buffer), 9000)
            //);
        });
    }).on('error', e => console.log(e));
};

const loadLinks = (buff, cb) => {
    const dom = new JSDOM(buff);
    const window = dom.window;

    let outlinks = window.document.querySelectorAll('.mw-parser-output a[href^="/wiki/"]:not(.image)')
    outlinks = Array.from(outlinks);
    outlinks = outlinks.map(a => a.href);
    outlinks = outlinks.map(a => a.substring(6));
    outlinks = outlinks.map(a => {
        if(a.includes(','))
            return null;
        else
            return decodeURIComponent(a);
    });
    outlinks = outlinks.filter(a => !!a);
    outlinks = Array.from(new Set(outlinks));

    const loadRecu = () => {
        const page = outlinks.pop();
        if(page)
            setTimeout(() => loadPage(page, loadRecu), 9000);
    };
    loadRecu();
};

const parsePage = (buff,cb) => {
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

    cb(theString);
};

//finally the fun part
const parseString = str => {
    //const hiragana = 'のいなるがとにおすごくきでしたぼうけんてはばらっどれぶあかこもさをやりよ';
    //const katakana ='ジョンデャプナルリミッキラツクイフィギュアタテオバレコスートダドシムブセサボロワチ×ノマエァビメカパ・';
    const hiragana = /[\u3040-\u309f]/;
    const katakana = /[\u30a0-\u30ff]/;
    const alpha = /[a-zA-Z]/;
    const num = /[0-9]/;
    const delim = '\n  『』。^.[]()「」/（）、:-〈〉：〜　#※?%!《》【】",！_\\&＆+”“=@［］…<>○○�―\'×→—';
    const punc = /[\u3000-\u303f]/;
    const kanji = /[\u4e00-\u9faf\u3400-\u4dbf﨑]/;

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
        if(punc.test(c))
            cType = '00';
        else if(delim.includes(c))
            cType = '0';
        else if(katakana.test(c))
            cType = 'k';
        else if(hiragana.test(c))
            cType = 'h';
        else if(alpha.test(c))
            cType = 'a';
        else if(num.test(c))
            cType = 'n';
        else if(kanji.test(c))
            cType = 'j';
        else
            cType = '?';

        if(cType === lastType)
            run += c;
        else{
            if(lastType === '?')
                run = '?' + run;
            if(lastType !== '0' && lastType !== '00')
                addCurr();

            run = c;
            lastType = cType;
        }


    }

    const ranked = Object.entries(dict).sort((a,b) => a[1]-b[1]);
    //const ranked = Object.entries(dict).sort((a,b) => a[0].length-b[0].length);
    ranked.forEach(o => {
        //if(o[1] > 1)
        //if(o[0][0]==='_')
            console.log(o);
    });
    //console.log(ranked);
};

//loadPage(jjba, s => parsePage(i,parseString));

//one way to run this program: load a bunch of links
loadPage(jjba, loadLinks);
