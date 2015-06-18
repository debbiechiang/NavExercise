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
    link.classList.add('menu__link', (isPrimary) ? 'menu__link--primary' : 'menu__link--secondary');
    link.innerHTML = el.label;
    
    if (hasSubNav) {
      var chevron = this.createChevron(); 
      link.classList.add('menu__link--hasSubNav');
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

/**
 * Handles the mobile nav main menu / sub menu toggle and hide.
 */
var MobileNav = (function(){
  // private
  var $dimmer = document.querySelector('.content__dimmer');
  var $content = document.querySelector('.content__wrapper');
  var $menuToggle = document.querySelector('.menu__toggle');

  var $menu; 
  
  /**
   * Constructor for mobile nav functionality
   */
  function MobileNav(mainMenu){
    $menu = document.querySelector(mainMenu);
  }

  /**
   * Toggle the main nav. Turns on dimmer, pushes over content, 
   * opens menu, makes burger into an X.
   */ 
  MobileNav.prototype.toggleNav = function(){
    // if toggling to closed, also close all submenus. 
    if ($menu.closest('.menu--open')){
      this.closeAllSubnav();
    }
    $dimmer.classList.toggle('content__dimmer--on');
    $content.classList.toggle('content__wrapper--push');
    $menuToggle.classList.toggle('menu__toggle--on');
    $menu.classList.toggle('menu--open');
  };

  /** 
   * Toggle an individual subnav. Show/hide subnav, turns carat.
   */
  MobileNav.prototype.toggleSubnav = function(node){
    var parentNode = node.closest('.menu__item');
    parentNode.classList.toggle('menu__item--open');
  };

  /**
   * Closes all subnavs. For use when the menu closes.
   */
  MobileNav.prototype.closeAllSubnav = function(){
    var openSubnavs = document.querySelectorAll('.menu__item--open');
    Array.prototype.slice.call(openSubnavs).forEach(function(el){
      el.classList.remove('menu__item--open');
    });
  };

  return MobileNav;
})();

/**
 * Initialization at page load, event handling.
 */
document.addEventListener("DOMContentLoaded", function(event) { 

  // Initialize everything
  var buildMenu = new BuildMenu('/api/nav.json', '.menu__flexContainer');
  var mobileNav = new MobileNav('.menu');

  // Main menu toggle
  document.querySelector('.menu__toggle').addEventListener('click', function(e){
    e.preventDefault();
    mobileNav.toggleNav();
  });

  // a click on the dimmer will also close the menu
  document.querySelector('.content__wrapper').addEventListener('click', function(e){
    if (e.target && e.target.closest('.content__dimmer--on')){
      mobileNav.toggleNav();
    }
  });

  // event delegation for the submenu items that are being built on the fly
  document.querySelector('.menu').addEventListener('click', function(e){
    if (e.target && e.target.closest('.menu__link--hasSubNav')){
      e.preventDefault();
      mobileNav.toggleSubnav(e.target);
    }
  });


});