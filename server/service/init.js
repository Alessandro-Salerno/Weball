const laodScript = (scriptName) => {
    let s = document.createElement('script');
    s.src = `http://155.94.252.86:8081/js/${scriptName}`;
    s.async = true;
    s.type = 'text/javascript';
    document.getElementsByTagName('head')[0]
                .appendChild(s);
}

const loadStyles = (stylesheet) => {
    let l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = `http://155.94.252.86:8081/css/${stylesheet}`;
    document.getElementsByTagName('head')[0]
                .appendChild(l);
}

const loadHTML = (documentName, id) => {
    let f = document.createElement('iframe');
    f.id = id;
    f.src = `http://155.94.252.86:8081/html/${documentName}`

    document.body.appendChild(f);
    return f;
}

loadStyles('weball-base-styles.css');
loadStyles('weball-features-styles.css');
laodScript('weball-hook.js');
loadHTML('weball-widget.html', 'weball-content-iframe').classList.add('weball-invisible');

let wb = document.createElement('input');
wb.type = 'button';
wb.value = 'W';
wb.id = 'weball-button';
wb.onclick = () => {
    postMessage({ weball: { widget: true }})
};
document.body.appendChild(wb);