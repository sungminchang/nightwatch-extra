module.exports = "\
  var sizzle;\
  if (window.Sizzle) {\
    sizzle = window.Sizzle;\
  } else if (window.____injectedSizzle____) {\
    sizzle = window.____injectedSizzle____;\
  }\
  if (sizzle) {\
    sizzle.selectors.pseudos.visible = \
      function (elem) { \
        return elem.offsetWidth > 0 || elem.offsetHeight > 0 || elem.getClientRects().length > 0;\
      };\
    sizzle.selectors.pseudos.hidden = \
      function (elem) {\
          return !sizzle.selectors.pseudos.visible(elem);\
      };\
  }\
  return sizzle;";