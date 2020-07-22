import assert from 'assert';
import { initRecurly, apiTest, stubBraintree, stubWindowOpen } from '../../support/helpers';

apiTest(function (requestMethod) {
  describe.only(`BraintreeStrategy (${requestMethod})`, function () {
    const validOpts = { braintree: { clientAuthorization: 'valid' } };

    stubWindowOpen();
    stubBraintree();

    beforeEach(function () {
      this.sandbox = sinon.createSandbox();
      this.recurly = initRecurly({ cors: requestMethod === 'cors' });
      this.venmo = this.recurly.Venmo(validOpts);
    });

    describe('start', function () {
      it('calls tokenize through braintree', function () {
        this.sandbox.spy(this.venmo.strategy.venmo, 'tokenize'); // TODO: PAIR WITH GREG ON THESE TESTS
        this.venmo.start();
        assert(this.venmo.strategy.venmo.tokenize.calledOnce);
      });
    })

    describe('destroy', function () {
      it('closes the window and removes listeners', function () {
        this.sandbox.spy(this.venmo, 'off');
        this.venmo.start();
        // need to instantiate the spy after calling paypal.start to spy on `strategy.close`
        this.sandbox.spy(this.venmo.strategy, 'close');
        // need to preserve this because paypal.destroy() deletes the strategy
        const closeRef = this.venmo.strategy.close;
        this.venmo.destroy();
        assert(closeRef.calledOnce);
        assert(this.venmo.off.calledOnce);
      });
    });
  });
});
