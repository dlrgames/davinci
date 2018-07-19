import i18n from '../utils/i18n';

cc.Class({
  extends: cc.Component,

  editor: {
    menu: 'i18n/Label',
    requireComponent: cc.Label,
  },

  properties: {
    i18nId: ''
  },

  // use this for initialization
  onLoad() {
    this._label = this.node.getComponent(cc.Label);
    i18n.on('locale:changed', this._asyncLocale, this);
  },

  onDestroy() {
    i18n.off('locale:changed', this._asyncLocale, this);
  },

  start() {
    this._asyncLocale();
  },

  _asyncLocale() {
    if (this._label.font) {
      let font = i18n.getFont(this._label.font.name);
      if (font) {
        this._label.string = '';
        this._label.font = font;
      }
    }
    let string = i18n.translate(this.i18nId, {});
    this._label.string = string; 
  }
});
