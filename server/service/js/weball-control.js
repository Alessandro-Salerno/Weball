const currentConfiguration = {
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
}

const setClass = (id, cls, state) => {
    setClassOnElement(document.getElementById(id), cls, state);
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

const toggleInvertiColori = () => {
    update('inverted', !toggleClass('inverti-colori', 'selected'));
}

const toggleScalaDiGrigi = () => {
    update('grayScale', !toggleClass('scala-di-grigi', 'selected'));
}

const toggleContrasto = () => {
    update('contrast', !toggleClass('contrasto', 'selected'));
}

const toggleSaturazione = () => {
    update('saturation', !toggleClass('saturazione', 'selected'));
}

const toggleLuminosita = () => {
    update('brightness', !toggleClass('luminosita', 'selected'));
}

const toggleEpilessia = () => {
    update('sepia', !toggleClass('epilessia', 'selected'));
}

const toggleEvidenziaLink = () => {
    update('highlightLinks', !toggleClass('evidenzia-link', 'selected'));
}

const toggleCaratteriDislessia = () => {
    update('dyslexia', !toggleClass('caratteri-dislessia', 'selected'));
}

const toggleCursoreGrande = () => {
    update('zoomPointer', !toggleClass('cursore-grande', 'selected'));
}

const toggleZoom = () => {
    update('zoom', !toggleClass('zoom', 'selected'));
}

const toggleMutaAudio = () => {
    update('muteSounds', !toggleClass('silenzia-suoni', 'selected'));
}

const noWeball = () => {
    update('widget', false);
}
