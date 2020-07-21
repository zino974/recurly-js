import loadScript from 'load-script';
import after from '../../../util/after';
import { VenmoStrategy } from './index';

const debug = require('debug')('recurly:venmo:strategy:braintree');

export const BRAINTREE_CLIENT_VERSION = '3.50.0';

/**
 * Braintree-specific Venmo handler
 */

export class BraintreeStrategy extends VenmoStrategy {
  constructor (...args) {
    super(args)
    this.load();
  }

  configure (options) {
    super.configure(options);
    if (!options.braintree || !options.braintree.clientAuthorization) {
      throw this.error('venmo-config-missing', { opt: 'braintree.clientAuthorization' });
    }
    this.config.clientAuthorization = options.braintree.clientAuthorization;
  }

  /**
   * Loads Braintree client and modules
   *
   * @todo semver client detection
   */
  load () {
    debug('loading Braintree libraries');

    const part = after(2, () => this.initialize());
    const get = (lib, done = () => {}) => {
      const uri = `https://js.braintreegateway.com/web/${BRAINTREE_CLIENT_VERSION}/js/${lib}.min.js`;
      loadScript(uri, error => {
        if (error) this.error('venmo-load-error', { cause: error });
        else done();
      });
    };

    const modules = () => {
      if (this.braintreeClientAvailable('venmo')) part();
      else get('venmo', part);
      if (this.braintreeClientAvailable('dataCollector')) part();
      else get('data-collector', part);
    };

    if (this.braintreeClientAvailable()) modules();
    else get('client', modules);
  }

  /**
   * Initializes a Braintree client, device data collection module, and venmo client
   */
  initialize () {
    debug('Initializing Braintree client');

    const authorization = this.config.clientAuthorization;
    const braintree = window.braintree;

    braintree.client.create({ authorization }, (error, client) => {
      if (error) return this.fail('venmo-braintree-api-error', { cause: error });
      debug('Braintree client created');
      braintree.venmo.create({ client }, (error, venmo) => {
        if (error) return this.fail('venmo-braintree-api-error', { cause: error });
        debug('Venmo client created');
        this.venmo = venmo;
        this.emit('ready');
      });
    });
  }

  handleVenmoError (err) {
    if (err.code === 'VENMO_CANCELED') {
      console.log('App is not available or user aborted payment flow');
    } else if (err.code === 'VENMO_APP_CANCELED') {
      if (error.code === 'VENMO_POPUP_CLOSED')
        console.log('User canceled payment flow');
    } else {
      console.error('An error occurred:', err.message);
    }

    this.emit('cancel');
    return this.error('venmo-braintree-tokenize-braintree-error', { cause: error });
  }

  handleVenmoSuccess (payload) {
    this.recurly.request.post({
      route: '/venmo/token',
      data: { type: 'braintree', payload },
      done: (error, token) => {
        if (error) return this.error('venmo-braintree-tokenize-recurly-error', { cause: error });
        this.emit('token', token);
      }
    });
  }

  start () {
    let tokenOpts = Object.assign({}, this.config.display, { flow: 'vault' });

    // Tokenize with Braintree
    this.venmo.tokenize().then(this.handleVenmoSuccess.bind(this)).catch(this.handleVenmoError.bind(this))
  }

  destroy () {
    if (this.close) {
      this.close();
    }
    this.off();
  }

  braintreeClientAvailable (module) {
    const bt = window.braintree;
    return bt && bt.client && bt.client.VERSION === BRAINTREE_CLIENT_VERSION && (module ? module in bt : true);
  }
}
