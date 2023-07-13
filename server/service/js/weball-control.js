const settingButtonMap = new Map();
settingButtonMap.set('inverted', 'inverti-colori');
settingButtonMap.set('grayScale', 'scala-di-grigi');
settingButtonMap.set('contrast', 'contrasto');
settingButtonMap.set('saturation', 'saturazione');
settingButtonMap.set('brightness', 'luminosita');
settingButtonMap.set('sepia', 'epilessia');
settingButtonMap.set('highlightLinks', 'evidenzia-link');
settingButtonMap.set('dyslexia', 'caratteri-dislessia');
settingButtonMap.set('zoomPointer', 'cursore-grande');
settingButtonMap.set('zoom', 'zoom');
settingButtonMap.set('muteSounds', 'silenzia-suoni');

const elementHasClass = (element, cls) => element.classList.contains(cls);
const hasClass = (id, cls) => elementHasClass(document.getElementById(id), cls);

const removeClassFromElement = (element, cls) => {
    if (element.classList.contains(cls))
        element.classList.remove(cls);
}

const addClassToElement = (element, cls) => {
    if (!element.classList.contains(cls))
        element.classList.add(cls);
}

const removeClass = (id, cls) => {
    removeClassFromElement(document.getElementById(id), cls);
}

const addClass = (id, cls) => {
    addClassToElement(document.getElementById(id), cls);
}

const toggleClassOnElement = (element, cls) => {
    const contains = element.classList.contains(cls);
    const operation = (contains) ? removeClassFromElement
                                    : addClassToElement;

    operation(element, cls);
    return contains;
}

const toggleClass = (button, cls) => {
    const element =  document.getElementById(button);
    return toggleClassOnElement(element, cls);
}

const setClassOnElement = (element, cls, state) => {
    const operation = (state) ? addClassToElement
                                : removeClassFromElement;

    operation(element, cls);
    return state;
}

const setClass = (id, cls, state) => {
    return setClassOnElement(document.getElementById(id), cls, state);
}

const update = (item, state) => {
    const configuration = {
        widget: undefined,
        inverted: undefined,
        grayScale: undefined,
        contrast: undefined,
        saturation: undefined,
        brightness: undefined,
        sepia: undefined,
        highlightLinks: undefined,
        dyslexia: undefined,
        zoomPointer: undefined,
        zoom: undefined,
        muteSounds: undefined
    };

    configuration[item] = state;
    parent.postMessage({ weball: configuration }, '*');
}

const toggle = (item) => {
    const button = settingButtonMap.get(item);
    update(item, !toggleClass(button, 'selected'));
    postSettings();
}

const noWeball = () => {
    update('widget', false);
}

const weballLogin = () => {
    window.open('http://155.94.252.86:8082/user-remote-sign.html');
}

const getCurrentSettings = () => {
    const settings = {};
    settingButtonMap.forEach((value, key, map) => {
        settings[key] = hasClass(value, 'selected');
    });

    return settings;
}

const applySettings = (settings) => {
    Object.keys(settings).forEach(key => {
        update(key, setClass(settingButtonMap.get(key), 'selected', settings[key]));
    });
}

const fetchSettings = (c) => {
    fetch("http://155.94.252.86:8081/user/settings/get", {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(c)
    }).then(res => {
        return res.json();
    }).then(res => {
        if (!res || res.status === 'Failed') {
            alert('Error while fetching remote configuration');

            if (res.message === 'No such user')
                localStorage.removeItem('weball_credentials');

            window.location.reload();
        }

        applySettings(res.settings);
    });
}

const postSettings = () => {
    credentials = JSON.parse(localStorage.getItem('weball_credentials'));
    settings = getCurrentSettings();

    if (!credentials) {
        localStorage.setItem('weball_settings', JSON.stringify(settings));
        return;
    }

    const data = {
        email: credentials.email,
        password: credentials.password,
        settings: settings
    };

    fetch("http://155.94.252.86:8081/user/settings/set", {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    }).then(res => {
        return res.json();
    }).then(response => {
        if (!response || response.status === 'Failed')
//            alert(response.message)
            alert(`Error while posting configuration to remote server`);
    });
}

const onLoad = () => {
    window.addEventListener('message', (e) => {
        content = e.data;

        if (!content.weballLogin)
            return;

        credentials = content.weballLogin;
        localStorage.setItem('weball_credentials', JSON.stringify(credentials));

        if (content.weballSettings)
            applySettings(content.weballSettings);
    });

    if (localStorage.getItem('weball_credentials')) {
        fetchSettings(JSON.parse(localStorage.getItem('weball_credentials')));
        return;
    }

    if (localStorage.getItem('weball_settings'))
        applySettings(JSON.parse(localStorage.getItem('weball_settings')));
}
