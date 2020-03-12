const assert = require('assert');
const {
  init,
  assertIsAToken,
  styleHostedField,
  FIELD_TYPES
} = require('./support/helpers');
const util = require('./support/util');
const sel = require('./support/form.elements');
const data = require('./support/data');
const cards = require('./support/credit.cards');

describe('Expiration date validations', async () => {
  beforeEach(init);

  it('Test fontColor change for card field (fields.card.style.fontColor)', async function () {
    // Assert the default is black
    await browser.switchToFrame(0);
    const number = await $(sel.number);
    const expiry = await $(sel.expiry);
    const cvv = await $(sel.cvv);
    await assertFontColorIs(number, '#545457');
    await assertFontColorIs(expiry, '#545457');
    await assertFontColorIs(cvv, '#545457');

    // Change the fontColor
    await browser.switchToFrame(null);

    // Assert the fontColor has changed all the combined card field
    await browser.switchToFrame(0);
    await assertFontColorIs(number, '#008000');
    await assertFontColorIs(expiry, '#008000');
    await assertFontColorIs(cvv, '#008000');
  });

  it('Test fontColor change for individual fields (fields.number.style.fontColor)', async function () {
    // Assert the default is black
    await browser.switchToFrame(0);
    const number = await $(sel.number);
    const expiry = await $(sel.expiry);
    const cvv = await $(sel.cvv);
    await assertFontColorIs(number, '#545457');
    await assertFontColorIs(expiry, '#545457');
    await assertFontColorIs(cvv, '#545457');

    // Change the fontColor
    await browser.switchToFrame(null);
    const result = await styleHostedField(FIELD_TYPES.NUMBER, { fontColor: 'blue' });

    // Assert the fontColor has changed all the combined card field
    await browser.switchToFrame(0);
    await assertFontColorIs(number, '#545457');
    await assertFontColorIs(expiry, '#545457');
    await assertFontColorIs(cvv, '#545457');
   });

  // The font color should changed to red if an incorrect data was entered
  it('Test expiry changed font color to red', async function () {
    await browser.switchToFrame(0);
    const number = await $(sel.number)
    const expiry = await $(sel.expiry)
    const cvv = await $(sel.cvv)

    await number.setValue(cards.visa.number1)
    await expiry.setValue(cards.visa.expiry)
    await cvv.setValue(cards.visa.cvv)

    // Expect the default color is black
    await assertFontColorIs(number, '#545457');
    await assertFontColorIs(expiry, '#545457');
    await assertFontColorIs(cvv, '#545457');

    //Now enter all invalid entries and expected the font color changed to red
    await number.setValue('4111 1111 111A 1111')
    await expiry.setValue('124')
    await cvv.setValue('1X3')

    //Switch set the focus back to the main frame
    await browser.switchToFrame(null);
    await (await $(sel.firstName)).addValue('');

    //Switch back to the iframe and hosted fields color should all be red
    await browser.switchToFrame(0);
    await assertFontColorIs(number, '#e35256');
    await assertFontColorIs(expiry, '#e35256');
    await assertFontColorIs(cvv, '#e35256');
  });