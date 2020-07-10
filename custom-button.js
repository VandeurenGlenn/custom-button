export default customElements.define('custom-button', class CustomButton extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({mode: 'open'});

    this.shadowRoot.innerHTML = `
    <style>
      * {
        pointer-events: none;
      }
      :host {
        --shadow-elevation-0dp:
                    0 0px 0px 0 rgba(0, 0, 0, 0.14),
                    0 0px 0px 0 rgba(0, 0, 0, 0.12),
                    0 0px 0px 0px rgba(0, 0, 0, 0.2);
        --shadow-elevation-3dp:
                    0 3px 4px 0 rgba(0, 0, 0, 0.14),
                    0 1px 8px 0 rgba(0, 0, 0, 0.12),
                    0 3px 3px -2px rgba(0, 0, 0, 0.4);
        --custom-button-height: 40px;
        display: block;
        width: 124px;
        height: var(--custom-button-height);
        pointer-events: auto;
        cursor: pointer;
        border-radius: calc(var(--custom-button-height) / 3);
      }
      button {
        display: block;
        width: 124px;
        height: var(--custom-button-height);
        border: none;
        border-radius: calc(var(--custom-button-height) / 3);
        user-select: none;
        outline: none;
        text-transform: uppercase;
        background: transparent;
        color: #ddd;
      }
      button:hover {
        box-shadow: var(--shadow-elevation-3dp);
        transition: box-shadow 16ms ease-in;
        background: #3f435452;
        /* color: #333; */
      }
      button:active {
        box-shadow: var(--shadow-elevation-0dp);
        transition: box-shadow 96ms ease-out;
        background: transparent;
        /* color: #ddd; */
      }
    </style>
    <button><slot></slot></button>
    `
  }
  
  connectedCallback() {
    this.shadowRoot.querySelector('button')
  }
})