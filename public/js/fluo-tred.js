
/*
 *  OpenWFEru - open source ruby workflow and bpm engine
 *  (c) 2008 John Mettraux
 *
 *  OpenWFEru is freely distributable under the terms 
 *  of a BSD-style license.
 *  For details, see the OpenWFEru web site: http://openwferu.rubyforge.org
 *
 *  This piece of hacked was created during the RubyKaigi2008,
 *  between Tsukuba and Akihabara.
 */

//var flow = [ 'process-definition', { 'name': 'toto', 'revision': '1.0' }, [
//    [ 'sequence', {}, [
//      [ 'participant', { 'ref': 'alpha' }, [] ],
//      [ 'bravo', {}, [] ]
//    ]]
//  ]
//]

//
// <div> <!-- expression -->
//   <div> <!-- opening -->
//     <span>sequence</span>  <span>(atts)</span>
//   </div>
//   <div> <!-- c0 -->
//     <div>alpha</div>
//   </div>
//   <div> <!-- c1 -->
//     <div>bravo</div>
//   </div>
//   <div>end</div> <!-- end -->
// </div>
//

HTMLElement.prototype.firstChildOfClass = function (className) {
  
  for (var i=0; i < this.childNodes.length; i++) {
    var c = this.childNodes[i];
    if (c.className == className) return c;
  }

  return null;
}

var EditableSpan = function() {
  
  function toInput (espan) {

    var text = espan.firstChild.nodeValue;
    var einput = document.createElement("input");
    einput.className = espan.className;
    einput.setAttribute('type', 'text');
    einput.setAttribute('value', text);
    einput.setAttribute('onkeyup', "return EditableSpan.onKey(event, this);");
    einput.setAttribute('onblur', "EditableSpan.toSpan(this);");
    espan.parentNode.replaceChild(einput, espan);
    einput.focus();
  }

  function toSpan (einput) {

    var espan = document.createElement("span");

    var text = einput.value;

    if (text == '---' || text == '') {
      text = '---';
      espan.style.opacity = 0.1;
    }

    espan.className = einput.className;
    espan.appendChild(document.createTextNode(text));
    espan.setAttribute("onclick", "EditableSpan.toInput(this);");
    einput.parentNode.replaceChild(espan, einput);

    Tred.triggerChange(espan);
  }

  function onKey (evt, einput) {

    var e = evt || window.event;
    var c = e.charCode || e.keyCode;

    //if (c == 38) {
    //  var ps = einput.parentNode.previousSibling;
    //  einput.parentNode.parentNode.insertBefore(einput.parentNode, ps);
    //}
    //else if (c == 40) {
    //  alert("down");
    //}
    //else 
    if (c == 13) {

      einput.blur();
    }

    return false;
  }

  function toEditableSpan (span) {

    span.setAttribute('onclick', 'EditableSpan.toInput(this);');

    if (span.firstChild.nodeValue == '') {
      span.firstChild.nodeValue = '---';
      span.style.opacity = 0.1;
    }
  }

  return {

    toInput: toInput,
    onKey: onKey,
    toSpan: toSpan,
    toEditableSpan: toEditableSpan
  };
}();

var Tred = function () {

  function onChange (jsonTree) {

    alert("please override me");
  }

  function createGhostButton (text, callback) {

    var s = document.createElement("span");
    s.callback = callback;
    s.appendChild(document.createTextNode(text));
    s.className = "tred_ghost_button";
    s.setAttribute("onclick", "this.callback()");
    s.setAttribute("onmouseout", "this.style.opacity = '0.05';");
    s.setAttribute("onmouseover", "this.style.opacity = '0.7';");
    return s;
  }

  function renderAttributes (node, atts) {

    var satts = document.createElement("span");
    satts.appendChild(document.createTextNode(atts));
    satts.className = "tred_expression_atts";

    EditableSpan.toEditableSpan(satts);

    node.appendChild(satts);
  }

  function renderOpening (node, exp) {

    var opening = document.createElement("div");

    //
    // expression name

    var sname = document.createElement("span");
    sname.appendChild(document.createTextNode(exp[0]));
    sname.setAttribute("onclick", "EditableSpan.toInput(this);");
    sname.className = "tred_expression_name";
    opening.appendChild(sname);

    //
    // attributes

    var atts = [];
    for (key in exp[1]) { 
      var skey = key.replace(/-/, '_');
      atts.push("" + skey + ': "' + exp[1][key] + '"');
    }

    //atts = atts.substring(0, atts.length-2);
    atts = atts.join(', ');
    renderAttributes(opening, atts);

    opening.appendChild(createGhostButton(
      " +",
      function () {
        Tred.addExpression(this.parentNode.parentNode, [ "---", {}, [] ]);
      }));
    opening.appendChild(createGhostButton(
      " -",
      function () {
        Tred.removeExpression(this.parentNode.parentNode);
      }));

    opening.appendChild(createGhostButton(
      " u",
      function () {
        Tred.moveExpression(this.parentNode.parentNode, -1);
      }));

    opening.appendChild(createGhostButton(
      " d",
      function () {
        Tred.moveExpression(this.parentNode.parentNode, +1);
      }));

    node.appendChild(opening);
  }

  function renderEnding (node, exp) {

    var ending = document.createElement("div");
    ending.className = "tred_text";
    if (exp[2].length > 0) ending.appendChild(document.createTextNode("end"));
    node.appendChild(ending);
  }

  function renderExpressionString (node, s) {

    var opening = document.createElement("div");

    var sname = document.createElement("span");
    sname.appendChild(document.createTextNode(s));
    sname.setAttribute("onclick", "EditableSpan.toInput(this);");
    sname.className = "tred_expression_string";
    opening.appendChild(sname);

    node.appendChild(opening);
  }

  function addExpression (parentExpNode, exp) {

    var end = parentExpNode.lastChild;
    var node = renderExpression(parentExpNode, exp);
    parentExpNode.replaceChild(node, end);
    parentExpNode.appendChild(end);

    triggerChange(parentExpNode);
  }

  function removeExpression (expNode) {

    var p = expNode.parentNode;
    p.removeChild(expNode);

    triggerChange(p);
  }

  function renderExpression (parentNode, exp, isRootExp) {

    //
    // draw expression

    var node = document.createElement("div");
    node.className = "tred_expression";
    if ( ! isRootExp) node.setAttribute("style", "margin-left: 14px;");
    parentNode.appendChild(node);

    if ( ! (exp instanceof Array)) {

        renderExpressionString(node, exp.toString());
        return;
    }

    renderOpening(node, exp);

    //
    // draw children

    for (var i=0; i < exp[2].length; i++) { 

      var child = exp[2][i];

      renderExpression(node, child);
    }

    renderEnding(node, exp);

    return node;
  }

  function renderFlow (parentNode, flow) {

    renderExpression(parentNode, flow, true);

    parentNode.className = "tred_root";
  }

  function moveExpression (elt, delta) {

    var p = elt.parentNode;

    if (delta == -1) { // move up
        if (elt.previousSibling.className != "tred_expression") return;
        p.insertBefore(elt, elt.previousSibling);
    }
    else { // move down
        if (elt.nextSibling.className != "tred_expression") return;
        p.insertBefore(elt, elt.nextSibling.nextSibling);
    }

    Tred.triggerChange(p); // onChange() points to the original version !
  }

  function triggerChange (elt) {

    var tredRoot = findTredRoot(elt);
    var tree = toJson(tredRoot);

    Tred.onChange(tree); // onChange() points to the original version !
  }

  function findTredRoot (node) {

      if (node.className == 'tred_root') return node;
      return findTredRoot(node.parentNode);
  }

  function toJson (node) {

    node.focus();
      //
      // making sure all the input boxes got blurred...

    if (node.className != 'tred_expression') {
      node = node.firstChildOfClass('tred_expression');
    }

    //
    // expression itself

    //var spans = node.firstChild.getElementsByTagName("span");
    var spans = node.getElementsByTagName("span");


    var expname = spans[0].firstChild.nodeValue;

    if (spans[0].className == 'tred_expression_string') return expname;

    var expatts = spans[1].firstChild.nodeValue;

    if (expatts == '---') expatts = '';

    //
    // children

    var divs = node.childNodes;
    var children = [];
    //if (divs.length > 1) {
    //  for (var i=1; i<divs.length-1; i++) children.push(toJson(divs[i]));
    //}
    for (var i=0; i<divs.length; i++) {
      var e = divs[i];
      if (e.nodeType != 1) continue;
      if (e.className != "tred_expression") continue;
      children.push(toJson(e));
    }
    //children = children.join(", ");

    //
    // done

    expatts = eval("({"+expatts+"})");
    return [ expname, expatts, children ];
  }

  //
  // public methods
  //
  return {
    renderFlow: renderFlow,
    toJson: toJson,
    onChange: onChange,
    addExpression: addExpression,
    removeExpression: removeExpression,
    triggerChange: triggerChange,
    moveExpression: moveExpression
  };
}();
