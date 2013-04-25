
//
// testing ruote-fluo-editor
//
// Tue Aug 14 01:13:12 JST 2012
//

function eq(actual, expected, message) {

  deepEqual(John.parse('{' + actual + '}'), expected, message)
}

test('attributes parse test', function() {

  eq('alpha', { alpha: null });
  eq('"alpha"', { alpha: null });

  eq('ref:alpha', { ref: 'alpha' });
  eq('ref:"alpha"', { ref: 'alpha' });
  eq('ref: "alpha"', { ref: 'alpha' });

  eq('"ref":"alpha"', { ref: 'alpha' });
  eq('"ref": "alpha"', { ref: 'alpha' });

  eq(' "${f:success}"', { '${f:success}': null });

  eq('alpha, "task": "clean lab"', { alpha: null, task: 'clean lab' });
  eq('"alpha", "task": "clean lab"', { alpha: null, task: 'clean lab' });

  eq('"val":1, "var":[2]', { val: 1, 'var': [ 2 ] });

  eq('"name": "my def", "revision": 0', { name: 'my def', revision: 0 });

  //eq('${f:nada}', { '${f:nada}': null });
  eq('"${f:nada}"', { '${f:nada}': null });

  //eq('${f:next}, "if": "${f:ok}"', { '${f:next}': null, 'if': '${f:ok}' });
  eq('"${f:next}", "if": "${f:ok}"', { '${f:next}': null, 'if': '${f:ok}' });
});
