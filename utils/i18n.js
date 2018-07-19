function applyTemplate(template, mapping) {
  if (template && mapping) {
    if (mapping instanceof Array) {
      for (let i = 0; i < mapping.length; i++) {
        template = template.replace('${' + i + '}', mapping[i]);
      }
    } else if (mapping instanceof Object) {
      for (let key in mapping) {
        template = template.replace('${' + key + '}', mapping[key]);
      }
    }
  }

  return template;
}

class I18n extends cc.EventTarget {

  constructor() {
    super();
    this._locale = window.ServiceProxy && window.ServiceProxy.locale || this.defaultLocale;
    this._loadPath = 'i18n';
    this._localizedStrings = {};
    this._localizedFonts = {};
    this._supportedLocales = [];
    this._localeIcons = [];
  }

  get supportedLocales() {
    return this._supportedLocales;
  }

  set supportedLocales(value) {
    this._supportedLocales = value;
  }

  get localeIcons() {
    return this._localeIcons;
  }

  set localeIcons(value) {
    this._localeIcons = value;
  }

  isLocaleSupported(value) {
    return this._supportedLocales.indexOf(value) !== -1;
  }

  changeTo(locale) {
    let targetLocale = locale;
    if (!this.isLocaleSupported(locale)) {
      targetLocale = this.defaultLocale;
    }

    if (this._localizedStrings[targetLocale]) {
      if (this._locale !== targetLocale) {
        this._locale = targetLocale;
        this.emit('locale:changed', this._locale);
      }
      return Promise.resolve(targetLocale);
    }

    return this._loadLocaleString(targetLocale)
      .then((r) => {
        this._locale = targetLocale;
        this.emit('locale:changed', this._locale);
      });
  }

  _processLocaleRes(locale, resource) {
    if (resource.__classname__ === 'cc.BitmapFont') {
      if (!this._localizedFonts[locale]) {
        this._localizedFonts[locale] = {};
      }
      this._localizedFonts[locale][resource.name] = resource;
    } else if (!resource.__classname__) {
      this._localizedStrings[locale] = resource;
    }
  }

  _loadLocaleString(locale) {
    console.log(`i18n._loadLocaleString: locale = ${locale}`);
    return new Promise((resolve, reject) => {
      let i18nRes = `${this._loadPath}/${locale}`;
      cc.loader.loadResDir(i18nRes, (error, resources, urls) => {
        if (error || !resources.length && !urls.length) {
          reject('can\'t find locale strings');
        } else {
          resources.forEach((resource) => {
            this._processLocaleRes(locale, resource);
          });
          resolve(locale);
        }
      });
    });
  }

  get defaultLocale() {
    return 'en';
  }

  get locale() {
    return this._locale;
  }

  getFont(name) {
    let fonts = this._localizedFonts[this.locale];
    return fonts && fonts[name];
  }

  translate(id, info) {
    let strings = this._localizedStrings[this.locale];
    let message = strings && strings[id] || '';
    return applyTemplate(message, info);
  }

  get localizedStrings() {
    return this._localizedStrings[this._locale];
  }
}

let __instance = new I18n();

export default __instance;
