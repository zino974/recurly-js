const assert = require('assert');
const {
  init,
  styleHostedField,
  assertStyleIs,
  FIELD_TYPES,
  SEL
} = require('./support/helpers');

/**
 *  Style Properties Array
 *  [0] = recurly.config property
 *  [1] = DOM CSS Property
 *  [2] = Style Value to be changed
 *  [3] = Style Value to be asserted
 */
const PROPERTIES = [
  ['fontFamily',          'font-family',           'Arial,sans-serif',     'arial'                           ],
  ['fontFeatureSettings', 'font-feature-settings', '"smcp", "zero"',       '"smcp", "zero"'                  ],
  ['fontKerning',         'font-kerning',          'none',                 'none'                            ],
  ['fontSize',            'font-size',             '1.25em',               '20px'                            ],
  ['fontStretch',         'font-stretch',          '190%',                 '190%'                            ],
  ['fontStyle',           'font-style',            'oblique 10deg',        'oblique 10deg'                   ],
  ['fontVariant',         'font-variant',          'small-caps',           'small-caps'                      ],
  ['fontWeight',          'font-weight',           'bold',                 700                               ],
  ['letterSpacing',       'letter-spacing',        '0.3em',                '6px'                             ],
  ['lineHeight',          'line-height',           '150%',                 '30px'                            ],
  ['textAlign',           'text-align',            'left',                 'left'                            ],
  ['textDecoration',      'text-decoration',       'underline dotted red', 'underline dotted rgb(255, 0, 0)' ],
  ['textRendering',       'text-rendering',        'optimizeSpeed',        'optimizespeed'                   ],
  ['textShadow',          'text-shadow',           'red 2px 5px',          'rgb(255,0,0)2px5px0px'           ],
  ['textTransform',       'text-transform',        'lowercase',            'lowercase'                       ]
];

// This sets all the properties as a group
const GROUP_PROPERTIES = {
  fontFamily:          'monospace',
  fontFeatureSettings: '"swsh", "2"',
  fontKerning:         'auto',
  fontSize:            '2.00em',
  fontStretch:         '150%',
  fontStyle:           'italic',
  fontVariant:         'common-ligatures tabular-nums',
  fontWeight:          'bold',
  letterSpacing:       '.2rem',
  lineHeight:          '2.5',
  textAlign:           'justify',
  textDecoration:      'green wavy underline',
  textRendering:       'geometricPrecision',
  textShadow:          '5px 5px #558ABB',
  textTransform:       'full-size-kana'
};

// These are the expected group properties after them were set
const GROUP_PROPERTIES_VALUE = [
  ['font-family',           'monospace'                       ],
  ['font-feature-settings', 'normal'                          ],
  ['font-kerning',          'auto'                            ],
  ['font-size',             '26px'                            ],
  ['font-stretch',          '150%'                            ],
  ['font-style',            'italic'                          ],
  ['font-variant',          'common-ligatures tabular-nums'   ],
  ['font-weight',           700                               ],
  ['letter-spacing',        '3.2px'                           ],
  ['line-height',           '65px'                            ],
  ['text-align',            'justify'                         ],
  ['text-decoration',       'underline wavy rgb(0, 128, 0)'   ],
  ['text-rendering',        'geometricprecision'              ],
  ['text-shadow',           'rgb(85,138,187)5px5px0px'        ],
  ['text-transform',        'none'                            ]
];


describe('Changing common property style tests for hosted-fields-card-distinct fixture', async () => {
  beforeEach(init({ fixture: 'hosted-fields-card-distinct' }));

  it.only(`Test changing style fields individual fields for: ${PROPERTIES.map(p => p[0])}`, async function () {
    await browser.switchToFrame(0);
    const input = await $('.recurly-hosted-field-input');
    for (const type of ['number', 'month', 'year', 'cvv']) {
      for (const [rjsProp, cssProp, newValue, assertValue] of PROPERTIES) {
        await browser.switchToFrame(null);
        const frame = await $(`.recurly-hosted-field-${type} iframe`);
        const config = await styleHostedField(FIELD_TYPES[type.toUpperCase()], { [rjsProp]: newValue });

        await browser.switchToFrame(frame);
        await assertStyleIs(input, cssProp, assertValue);
      }
    }
  });

  it(`Test changing style fields individual fields for: GROUP_PROPERTIES`, async function () {
    await browser.switchToFrame(0);
    const input = await $('.recurly-hosted-field-input');
    for (const type of ['number', 'month', 'year', 'cvv']) {
      await browser.switchToFrame(null);
      const frame = await $(`.recurly-hosted-field-${type} iframe`);
      const config = await styleHostedField(FIELD_TYPES[type.toUpperCase()], GROUP_PROPERTIES);

      for await (const [prop, value] of GROUP_PROPERTIES_VALUE) {
        await browser.switchToFrame(frame);
        await assertStyleIs(input, prop, value);
        await browser.switchToFrame(null);
      }
    }
  });
});