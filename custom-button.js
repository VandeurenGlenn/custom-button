(function () {
  'use strict';

  /**
   * Add space between camelCase text.
   */
  var unCamelCase = (string) => {
    string = string.replace(/([a-z\xE0-\xFF])([A-Z\xC0\xDF])/g, '$1 $2');
    string = string.toLowerCase();
    return string;
  };

  /**
  * Replaces all accented chars with regular ones
  */
  var replaceAccents = (string) => {
    // verifies if the String has accents and replace them
    if (string.search(/[\xC0-\xFF]/g) > -1) {
        string = string
                .replace(/[\xC0-\xC5]/g, 'A')
                .replace(/[\xC6]/g, 'AE')
                .replace(/[\xC7]/g, 'C')
                .replace(/[\xC8-\xCB]/g, 'E')
                .replace(/[\xCC-\xCF]/g, 'I')
                .replace(/[\xD0]/g, 'D')
                .replace(/[\xD1]/g, 'N')
                .replace(/[\xD2-\xD6\xD8]/g, 'O')
                .replace(/[\xD9-\xDC]/g, 'U')
                .replace(/[\xDD]/g, 'Y')
                .replace(/[\xDE]/g, 'P')
                .replace(/[\xE0-\xE5]/g, 'a')
                .replace(/[\xE6]/g, 'ae')
                .replace(/[\xE7]/g, 'c')
                .replace(/[\xE8-\xEB]/g, 'e')
                .replace(/[\xEC-\xEF]/g, 'i')
                .replace(/[\xF1]/g, 'n')
                .replace(/[\xF2-\xF6\xF8]/g, 'o')
                .replace(/[\xF9-\xFC]/g, 'u')
                .replace(/[\xFE]/g, 'p')
                .replace(/[\xFD\xFF]/g, 'y');
    }

    return string;
  };

  var removeNonWord = (string) => string.replace(/[^0-9a-zA-Z\xC0-\xFF \-]/g, '');

  const WHITE_SPACES = [
      ' ', '\n', '\r', '\t', '\f', '\v', '\u00A0', '\u1680', '\u180E',
      '\u2000', '\u2001', '\u2002', '\u2003', '\u2004', '\u2005', '\u2006',
      '\u2007', '\u2008', '\u2009', '\u200A', '\u2028', '\u2029', '\u202F',
      '\u205F', '\u3000'
  ];

  /**
  * Remove chars from beginning of string.
  */
  var ltrim = (string, chars) => {
    chars = chars || WHITE_SPACES;

    let start = 0,
        len = string.length,
        charLen = chars.length,
        found = true,
        i, c;

    while (found && start < len) {
        found = false;
        i = -1;
        c = string.charAt(start);

        while (++i < charLen) {
            if (c === chars[i]) {
                found = true;
                start++;
                break;
            }
        }
    }

    return (start >= len) ? '' : string.substr(start, len);
  };

  /**
  * Remove chars from end of string.
  */
  var rtrim = (string, chars) => {
    chars = chars || WHITE_SPACES;

    var end = string.length - 1,
        charLen = chars.length,
        found = true,
        i, c;

    while (found && end >= 0) {
        found = false;
        i = -1;
        c = string.charAt(end);

        while (++i < charLen) {
            if (c === chars[i]) {
                found = true;
                end--;
                break;
            }
        }
    }

    return (end >= 0) ? string.substring(0, end + 1) : '';
  }

  /**
   * Remove white-spaces from beginning and end of string.
   */
  var trim = (string, chars) => {
    chars = chars || WHITE_SPACES;
    return ltrim(rtrim(string, chars), chars);
  }

  /**
   * Convert to lower case, remove accents, remove non-word chars and
   * replace spaces with the specified delimeter.
   * Does not split camelCase text.
   */
  var slugify = (string, delimeter) => {
    if (delimeter == null) {
        delimeter = "-";
    }

    string = replaceAccents(string);
    string = removeNonWord(string);
    string = trim(string) //should come after removeNonWord
            .replace(/ +/g, delimeter) //replace spaces with delimeter
            .toLowerCase();
    return string;
  };

  /**
  * Replaces spaces with hyphens, split camelCase text, remove non-word chars, remove accents and convert to lower case.
  */
  var hyphenate = string => {
    string = unCamelCase(string);
    return slugify(string, "-");
  }

  const shouldRegister = name => {
    return customElements.get(name) ? false : true;
  };

  var define = klass => {
    const name = hyphenate(klass.name);
    return shouldRegister(name) ? customElements.define(name, klass) : '';
  }

  const charIt = (chars, string) => `${chars[0]}${string}${chars[1]}`;

  let offset = 0;

  /**
   * @param {object} element HTMLElement
   * @param {function} template custom-html templateResult
   * @param {object} properties {}
   */
  var render = (element, template, properties) => {
    const result = template(properties);
    if (element.shadowRoot) element = element.shadowRoot;
    if (!element.innerHTML) {
      element.innerHTML = result.template;
    }
    const length = element.innerHTML.length;
    result.changes.forEach(change => {
      const position = change.from.position;
      const chars = [
        element.innerHTML.charAt(((position[0] - 1) + offset)),
        element.innerHTML.charAt(((position[1]) + offset))
      ];
      element.innerHTML = element.innerHTML.replace(
        charIt(chars, change.from.value), charIt(chars, change.to.value)
      );
      offset = element.innerHTML.length - length;
    });
    return;
  }

  // TODO: check for change & render change only
  const set = [];

  /**
   *
   * @example
   ```js
    const template = html`<h1>${'name'}</h1>`;
    let templateResult = template({name: 'Olivia'})
    element.innerHTML = templateResult.template;
    templateResult = template({name: 'Jon'})
    element.innerHTML = templateResult.template;

    // you can also update the changes only
    templateResult.changes.forEach(change => {
      change.from.value // previous value
      change.from.position // previous position
      change.to.value // new value
      change.to.position // new position
      // check https://github.com/vandeurenglenn/custom-renderer for an example how to implement.
    });

   ```
   */
  const html$1 = (strings, ...keys) => {
    return ((...values) => {
      const dict = values[values.length - 1] || {};
      let template = strings[0];
      const changes = [];
      if (values[0]  !== undefined) {
        keys.forEach((key, i) => {
          let value = Number.isInteger(key) ? values[key] : dict[key];
          if (value === undefined && Array.isArray(key)) {
            value = key.join('');
          } else if(value === undefined && !Array.isArray(key)) {
            value = set[i].value; // set previous value, doesn't require developer to pass all properties set
          }
          const string = JSON.stringify(strings[i + 1]).replace(/\r?\\n|\r/g, '').replace(/"/g, '');
          const stringLength = string.length;
          const start = template.length;
          const end = template.length + value.length;
          const position = [start, end];

          if (set[i] && set[i].value !== value) {
            changes.push({
              from: {
                value: set[i].value,
                position: set[i].position,
              },
              to: {
                value,
                position
              }
            });
            set[i].value = value;
            set[i].position = [start, end];
          } else if (!set[i]) {
            set.push({value, position: [start, end]});
            changes.push({
              from: {
                value: null,
                position
              },
              to: {
                value,
                position
              }
            });
          }
          template += `${value}${string}`;
        });
      } else {
        template += JSON.stringify(strings[0]).replace(/\r?\\n|\r/g, '').replace(/"/g, '');
      }
      return {
        template,
        changes
      };
    });
  };

  window.html = window.html || html$1;

  var RenderMixin = (base = HTMLElement) =>
  class RenderMixin extends base {

    constructor() {
      super();
        // check template for slotted and set shadowRoot when nece
      if (this.template && this.shouldAttachShadow() && !this.shadowRoot)
        this.attachShadow({mode: 'open'});
      // this._isValidRenderer(this.render);
    }

    shouldAttachShadow() {
      return Boolean(String(this.template({}).template).match(/<slot>(.*)<\/slot>/));
    }

    connectedCallback() {
      if (super.connectedCallback) super.connectedCallback();
        this.render = (properties = this.properties, template = this.template) =>
          render(this, template, properties);

      if (this.render) {
        this.render();
        this.rendered = true;
      }  }
  }

  window.Backed = window.Backed || {};
  // binding does it's magic using the propertyStore ...
  window.Backed.PropertyStore = window.Backed.PropertyStore || new Map();

  // TODO: Create & add global observer
  var PropertyMixin = base => {
    return class PropertyMixin extends base {
      static get observedAttributes() {
        return Object.entries(this.properties).map(entry => {if (entry[1].reflect) {return entry[0]} else return null});
      }

      get properties() {
        return customElements.get(this.localName).properties;
      }

      constructor() {
        super();
        if (this.properties) {
          for (const entry of Object.entries(this.properties)) {
            const { observer, reflect, renderer } = entry[1];
            // allways define property even when renderer is not found.
            this.defineProperty(entry[0], entry[1]);
          }
        }
      }

      connectedCallback() {
        if (super.connectedCallback) super.connectedCallback();
        if (this.attributes)
          for (const attribute of this.attributes) {
            if (String(attribute.name).includes('on-')) {
              const fn = attribute.value;
              const name = attribute.name.replace('on-', '');
              this.addEventListener(String(name), event => {
                let target = event.path[0];
                while (!target.host) {
                  target = target.parentNode;
                }
                if (target.host[fn]) {
                  target.host[fn](event);
                }
              });
            }
        }
      }

      attributeChangedCallback(name, oldValue, newValue) {
        this[name] = newValue;
      }

      /**
       * @param {function} options.observer callback function returns {instance, property, value}
       * @param {boolean} options.reflect when true, reflects value to attribute
       * @param {function} options.render callback function for renderer (example: usage with lit-html, {render: render(html, shadowRoot)})
       */
      defineProperty(property = null, {strict = false, observer, reflect = false, renderer, value}) {
        Object.defineProperty(this, property, {
          set(value) {
            if (value === this[`___${property}`]) return;
            this[`___${property}`] = value;

            if (reflect) {
              if (value) this.setAttribute(property, String(value));
              else this.removeAttribute(property);
            }

            if (observer) {
              if (observer in this) this[observer]();
              else console.warn(`observer::${observer} undefined`);
            }

            if (renderer) {
              const obj = {};
              obj[property] = value;
              if (renderer in this) this.render(obj, this[renderer]);
              else console.warn(`renderer::${renderer} undefined`);
            }

          },
          get() {
            return this[`___${property}`];
          },
          configurable: strict ? false : true
        });
        // check if attribute is defined and update property with it's value
        // else fallback to it's default value (if any)
        const attr = this.getAttribute(property);
        this[property] = attr || this.hasAttribute(property) || value;
      }
    }
  }

  define(class CustomRipple extends RenderMixin(HTMLElement) {
    constructor() {
      super();
      this.attachShadow({mode: 'open'});
    }
  	/**
  	 * Runs the ripple
  	 */
  	run() {
  		this.classList.add('run');
  		setTimeout(() => {
  			this.classList.remove('run');
  		}, 160);
  	}

    get template() {
      return html`
    <style>
      :host {
        background: rgba(0,0,0,0.12);
        position: absolute;
        opacity: 0;
        right: 0;
        bottom: 0;
        border-radius: var(--custom-ripple-radius, 50%);
        outline: none;
        transition: transform cubic-bezier(0.22, 0.61, 0.36, 1) 600ms;
        transform: translate3d(0,0,0);
      }
      :host(.run) {
        opacity: 1;
        top: 0;
        left: 0;
        transition: transform cubic-bezier(0, 0, 0.2, 1) 400ms;
        transform: translate3d(0,0,0);
      }
    </style>
    `;
    }
  });

  /**
  * @extends RenderMixin
  */
  define(class CustomButton extends RenderMixin(PropertyMixin(HTMLElement)) {
  	static get properties() {
  		return {}
  	}
  	constructor() {
  		super();
  		// Bind methods
      this.onMouseDown = this.onMouseDown.bind(this);
      this.onMouseUp = this.onMouseUp.bind(this);
      this.onMouseClick = this.onMouseClick.bind(this);
      this.onMouseOver = this.onMouseOver.bind(this);
      this.onMouseOut = this.onMouseOut.bind(this);
  	}
  	connectedCallback() {
      super.connectedCallback();
  		this.addEventListener('mousedown', this.onMouseDown);
  		this.addEventListener('mouseup', this.onMouseUp);
  		this.addEventListener('click', this.onMouseClick);
      this.addEventListener('mouseover', this.onMouseOver);
      this.addEventListener('mouseout', this.onMouseOut);
  	}

  	disconnectedCallback() {
      super.disconnectedCallback();
  		this.removeEventListener('mousedown', this.onMouseDown);
  		this.removeEventListener('mouseup', this.onMouseUp);
  		this.removeEventListener('click', this.onMouseClick);
      this.removeEventListener('mouseover', this.onMouseOver);
      this.removeEventListener('mouseout', this.onMouseOut);
  	}

  	get ripple() {
  		return this.shadowRoot.querySelector('custom-ripple');
  	}

  	get isLink() {
  		return this.hasAttribute('is-link');
  	}

    /**
     * @return {String}
     */
    get name() {
    	return this.getAttribute('name') + '-button-click' || 'custom-button-click';
    }

  	/**
  	 * Add's mousedown to classList
  	 */
  	onMouseDown() {
  		this.classList.add('mousedown');
  		this.ripple.run();
  	}

  	/**
  	 * Set's boxShadow=none & removes mousedown from the classList
  	 */
  	onMouseUp() {
  		this.classList.remove('mousedown');
  	}

  	/**
  	 * @param {Object} event
  	 */
  	onMouseClick(event) {
  		document.dispatchEvent(new CustomEvent(this.name)); // Fire event
  		if (this.isLink) {
  			window.location.hash = this.getAttribute('name');
  		}
  	}

    onMouseOver() {
      this.classList.add('focus');
    }

    onMouseOut() {
      this.classList.remove('focus');
    }

    get template() {
      return html`
    <style>
      :host {
      	display: inline-block;
      	position: relative;
      	margin: var(--custom-button-padding, 6px 8px);
      	align-items: center;
        height:  36px;
        min-width: 88px;
      	cursor: pointer;
      	z-index: 0;
      	line-height: 1;
        font-family: 'Roboto', sans-serif;
        font-weight: 700;
      	box-sizing: border-box;
        outline: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;

      	--custom-ripple-radius: 2px;
      }
      :host([no-shadow]) button {
      	box-shadow: none;
      }
      :host(.focus) button {
        background-color: var(--custom-button-focus-color, #EEE);
      }
      button {
        display: flex;
        flex-direction: column;
        position: relative;
        width: 100%;
        height: 100%;
        align-items: center;
        justify-content: center;
        padding: var(--custom-button-padding, 8px 16px);
        border-radius: var(--custom-button-radius, 3px);
        background: var(--custom-button-background, transparent);
        color: var(--custom-button-color, #212121);

        text-transform: uppercase;
        outline: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        cursor: pointer;
        border: none;
        pointer-events: none;
      	box-sizing: border-box;

        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
        -webkit-tap-highlight-color: transparent;
        color: var(--custom-button-color, #111);

        font-size: 14pt;

        box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
                    0 1px 5px 0 rgba(0, 0, 0, 0.12),
                    0 3px 1px -2px rgba(0, 0, 0, 0.2);
      }
      :host([dense]) {
        height: 32px;
      }
      :host([dense]) button {
        font-size: 13pt;
      }
  	</style>
    <button class="container">
      <slot></slot>
      <custom-ripple></custom-ripple>
    </button>
    `;
    }
  });

}());
