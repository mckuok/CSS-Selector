// Unique ID for the className.
const ID_SELECTOR_CLASS = 'crx_id_selector';
const SAME_SELECTOR_CLASS = 'crx_same_selectors';
const INITIAL_SAME_SELECTOR_CLASS = 'crx_initial_same_selectors';

const SIDEBAR_ID = 'crx_sidebar';

const ID_PREFIX = 'ID = ';
const SELECTOR_PREFIX = 'Selector = ';

const LINE_LENGTH = 160;
const LINE_HEIGHT = 15;

// Previous dom, that we want to track, so we can remove the previous styling.
var prevDOM = null;
var prevIdentifiers = null;
// path of the element
var path = "";
var sidebarOpen = false;

// Mouse listener for any move event on the current document.
document.addEventListener('mousemove', function (e) {

  var srcElement = e.srcElement;
  var isId = false;
  var identifiers = null;
  path = "";

  /* Get identifier */
  if (srcElement.id) {
    path = srcElement.id; 
    isId = true;
  } else {
    path = getClassPath(srcElement);
  }

  identifiers =  $((isId ? '#' : '') + path);

  /* Display selector to sidebar */
  if (sidebarOpen) {
    var innerHTML =  (isId ? ID_PREFIX : SELECTOR_PREFIX) + path + '<br><br> Same Selector Count = ' + identifiers.length;
    document.getElementById(SIDEBAR_ID).innerHTML = innerHTML;

    var linesheight = (Math.ceil(innerHTML.length / LINE_LENGTH) + 1) * LINE_HEIGHT;
    if (linesheight < 70) {
      linesheight = 70;
    }
    $('#'+SIDEBAR_ID).css('height', linesheight + 'px');
  }

  document.execCommand('copy');

  /*Reset DOM */
  if (prevDOM != null) {
    prevDOM.classList.remove(ID_SELECTOR_CLASS);
    prevIdentifiers.removeClass(SAME_SELECTOR_CLASS);
    prevIdentifiers.removeClass(INITIAL_SAME_SELECTOR_CLASS);
  }

  /*Highlight DOM */
  srcElement.classList.add(ID_SELECTOR_CLASS);  
  if (!isId) {
    identifiers.addClass(SAME_SELECTOR_CLASS);

    identifiers.each(function(i, identifier) {
      var identifierObj = $(identifier);
      
      if (identifierObj.hasClass(ID_SELECTOR_CLASS)) {
        identifierObj.removeClass(SAME_SELECTOR_CLASS);
        identifierObj.addClass(INITIAL_SAME_SELECTOR_CLASS);
        return false;
      }
    });
  }   

  prevDOM = srcElement;
  prevIdentifiers = identifiers;

}, false);

/* Handles copying */
document.addEventListener('copy', function(e) {
  e.clipboardData.setData('text/plain', path);
  e.preventDefault();
});




/*Handle requests from background.html*/
function handleRequest(request,  sender, sendResponse) {
  if (request.callFunction == "toggleSidebar")
    toggleSidebar();
}

chrome.extension.onRequest.addListener(handleRequest);

/* Open side bar */
function toggleSidebar() {
  if(sidebarOpen) {
    var el = document.getElementById(SIDEBAR_ID);
    el.parentNode.removeChild(el);
    sidebarOpen = false;
  }
  else {
    var sidebar = document.createElement('div');
    sidebar.id = SIDEBAR_ID;
    document.body.appendChild(sidebar);

    sidebarOpen = true;
  }
}

/* Get selector path */
function getClassPath(element) {
  var parents = [],
    elm,
    entry;

  for (elm = element; elm; elm = elm.parentNode) {
    entry = elm.tagName.trim().toLowerCase();
    if (entry === "html") {
      break;
    }
    if (elm.className) {
      entry += "." + elm.className.trim().replace(/ +(?= )/g, '').replace(/ /g, '.');
    }
    parents.push(entry);
  }
  parents.reverse();
  return parents.join(" ").replace("." + ID_SELECTOR_CLASS, "").replace("." + INITIAL_SAME_SELECTOR_CLASS, "");

}
