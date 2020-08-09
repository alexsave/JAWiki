const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const fs = require('fs');

const jjba = 'ジョジョの奇妙な冒険';

const parsePage = (buff,cb) => {
    let theString = '';
    const dom = new JSDOM(buff);
    const window = dom.window;
    //const elTypes = [window.HTMLDivElement, window.HTMLTableElement, window.HTMLParagraphElement, window.HTMLHeadingElement, window.HTMLDListElement, window.HTMLUListElement];

    const firstHeading = window.document.querySelector('#firstHeading');
    if(firstHeading)
        theString += firstHeading.textContent;

    const output = dom.window.document.querySelector('.mw-parser-output');
    if(output){
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
            else if(el instanceof window.HTMLOListElement)
                theString += el.textContent;
            else if(el instanceof window.HTMLQuoteElement)
                theString += el.textContent;
            else if(el instanceof window.HTMLAnchorElement)
                theString += el.textContent;
            else if(el instanceof window.HTMLStyleElement){}
            else
                console.log(el, el.textContent);
        });
    }

    cb(theString);
    return theString;
};

//finally the fun part
const parseString = str => {
    //const hiragana = 'のいなるがとにおすごくきでしたぼうけんてはばらっどれぶあかこもさをやりよ';
    //const katakana ='ジョンデャプナルリミッキラツクイフィギュアタテオバレコスートダドシムブセサボロワチ×ノマエァビメカパ・';
    const hiragana = /[\u3040-\u309f]/; const katakana = /[\u30a0-\u30ff]/;
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
        console.log(c);
        if(i > 10)
            break;

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
    return dict;
    //const ranked = Object.entries(dict).sort((a,b) => a[0].length-b[0].length);
    //ranked.forEach(o => {
    //if(o[1] > 1)
    //if(o[0][0]==='_')
    //console.log(o);
    //});
    //console.log(ranked);
};


//one way to run this program: load a bunch of links

//another way, just look at the files we walready have
const analyzeJJBA = () => {
    const files = fs.readdirSync('cache');
    const dict = [];

    //files.forEach(f => {
    //console.log(f);
    const buff = fs.readFileSync(`cache/${jjba}.html`);
    const s = parsePage(buff, () => {});
    const d = parseString(s);

    Object.entries(d).forEach(e => {
        if(!(e[0] in dict))
            dict[e[0]] = 0;
        dict[e[0]] += e[1];
    });
    //});

    const ranked = Object.entries(dict).sort((a,b) => a[1]-b[1]);
    ranked.forEach(o => {
        //if(o[1] > 1)
            //console.log(o);
    });
}


//loadPage(jjba, loadLinks);

//loadPage(jjba, s => parsePage(i,parseString));

//analyzeLocal();

analyzeJJBA();
