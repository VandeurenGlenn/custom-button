import { define } from '../backed/src/utils.js';
import LitMixin from '../backed/src/mixins/lit-mixin.js';
import PropertyMixin from '../backed/src/mixins/property-mixin.js';
import '../custom-ripple/custom-ripple.js';
/**
* @extends LitMixin
*/
define(class CustomButton extends LitMixin(PropertyMixin(HTMLElement)) {
	static get properties() {
		return {}
	}
	constructor() {
		super()
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
		this.ripple.run();
	}

  onMouseOver() {
    this.classList.add('focus');
  }

  onMouseOut() {
    this.classList.remove('focus');
  }

  render() {
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
