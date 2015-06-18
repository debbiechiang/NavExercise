// Build menu
//    Get JSON 
//    Parse JSON
//    Inject it into the DOM
// Mobile menu functionality
//    
// Init everything 
//    Add event handling

/** 
 * Retrieves the JSON from the API 
 * Builds the menu and injects it into the DOM
 */
var BuildMenu = (function(){

  /**
   * Constructor for BuildMenu
   * url: [string] url for the API call.
   * location: [string] selector for DOM node into which to insert the finished menu 
   */
  function BuildMenu(url, location){
    this.url = url;
    this.menuWrapper = document.querySelector(location);
    this.getJSON();
  }

  /* 
   * Executes a GET requst to the API to retrieve the JSON
   */
  BuildMenu.prototype.getJSON = function(){
    var request = new XMLHttpRequest();
    request.open('GET', this.url, true);

    request.onload = function(){
      if (request.status >= 200 && request.status < 400){
        // successful request!
        var data = JSON.parse(request.responseText);
        this.createMenu(data, true); 
      } 
    }.bind(this); 

    request.send();
  };

  /** 
   * Parses through some data, creates a node list, 
   * hangs the appropriate classes on it, and appends it to the DOM.
   * data: [object] parsed JSON object from the call to the API.
   * isMainMenu: [boolean] whether to build a main menu or a submenu. 
   */
  BuildMenu.prototype.createMenu = function(data, isMainMenu){
    var menu = document.createElement('nav');
    menu.classList.add((isMainMenu) ? 'menu__itemContainer' : 'menu__submenu');

    // loop through the JSON and create a menu item for each 
    data.items.forEach(function(el, i, arr){
      var menuItem = document.createElement('div');
      var menuLink; 

      menuItem.classList.add('menu__item');

      if (isMainMenu){
        if (el.items.length === 0){
          // create just primary link
          menuLink = this.createLink(el, true, false);
          menuItem.appendChild(menuLink);
        } else {
          // create a primary link with chevron and a submenu
          var submenu = this.createMenu(el, false);
          menuLink = this.createLink(el, true, true);
          menuItem.appendChild(menuLink);
          menuItem.appendChild(submenu);
        }
      } else {
        // create a secondary link
        menuLink = this.createLink(el, false, false);
        menuItem.appendChild(menuLink);
      }

      menu.appendChild(menuItem);
    }, this);

    if (isMainMenu) this.menuWrapper.appendChild(menu); 

    return menu;
  };

  /** 
   * Builds a menu link (a.menu__link)
   * el: [object] JSON representation of the link node
   * isPrimary: [boolean] whether link is part of main menu or a submenu
   * hasSubNav: [boolean] appends chevron if necessary
   */
  BuildMenu.prototype.createLink = function(el, isPrimary, hasSubNav){
    var link = document.createElement('a');
    link.setAttribute('href', el.url);
    link.classList.add('menu__link');
    link.classList.add((isPrimary) ? 'menu__link--primary' : 'menu__link--secondary');
    link.innerHTML = el.label;
    
    if (hasSubNav) {
      var chevron = this.createChevron(); 
      link.appendChild(chevron);
    }

    return link; 
  }; 

  /** 
   * Builds a chevron 
   */
  BuildMenu.prototype.createChevron = function(){
    var chevron = document.createElement('span');
    chevron.classList.add('menu__chevron');
    return chevron; 
  };

  return BuildMenu;
})();

// INITIALIZE EVERYTHING
var buildMenu = new BuildMenu('/api/nav.json', '.menu__flexContainer');