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
    link.setAttribute('tabindex', (isPrimary) ? 0 : -1);
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
  var $mobileDimmer = document.querySelector('.content__dimmer--mobile');
  var $desktopDimmer = document.querySelector('.content__dimmer--desktop');
  var $content = document.querySelector('.content__wrapper');
  var $body = document.querySelector('body');
  var $menuToggle = document.querySelector('.menu__toggle');
  var $headerLogo = document.querySelector('.header__logo');

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
    $menuToggle.classList.toggle('menu__toggle--on');
    $menu.classList.toggle('menu--open');
    $headerLogo.classList.toggle('header__logo--on');
    $body.classList.toggle('lock');
    $mobileDimmer.classList.toggle('content__dimmer--on');
    $content.classList.toggle('content__wrapper--push');
  };

  /** 
   * Toggle an individual subnav. Show/hide subnav, turns carat.
   * node: [object] DOM node that identifies the subnav to toggle
   */
  MobileNav.prototype.toggleSubnav = function(node){
    var parentNode = node.closest('.menu__item');

    // if toggling to open, turn on the desktop dimmer. 
    if (!parentNode.classList.contains('menu__item--open')){
      $desktopDimmer.classList.add('content__dimmer--on');
    }

    // toggle the subnav
    parentNode.classList.toggle('menu__item--open');

    // Toggle subnav link tabindex to preserve mobile menu accessibility
    var subnavLink = parentNode.querySelectorAll('.menu__link--secondary');
    Array.prototype.slice.call(subnavLink).forEach(function(el){
      var tabindex = el.getAttribute('tabindex');
      el.setAttribute('tabindex', (tabindex === "-1" ) ? 0 : -1);
    });

  };

  /**
   * Closes all subnavs. For use when the main menu closes.
   * exceptFor [object]: optional node to leave open.
   */
  MobileNav.prototype.closeAllSubnav = function(exceptFor){
    var openSubnavs = $menu.querySelectorAll('.menu__item--open');
    Array.prototype.slice.call(openSubnavs).forEach(function(el){
      if(el !== exceptFor)
        this.toggleSubnav(el);
    }, this);
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

  // Dimmer toggling
  document.querySelector('.content__wrapper').addEventListener('click', function(e){
    if (e.target && e.target.closest('.content__dimmer--mobile')){
      // on mobile, just close the entire nav. 
      mobileNav.toggleNav();
    } else if (e.target && e.target.closest('.content__dimmer--desktop')){
      // on desktop, close the dimmer and close the subnavs.
      document.querySelector('.content__dimmer--desktop').classList.remove('content__dimmer--on');
      mobileNav.closeAllSubnav();
    }
  });

  // Event delegation for the submenu items that are being built on the fly
  document.querySelector('.menu').addEventListener('click', function(e){
    if (e.target && e.target.closest('.menu__link--hasSubNav')){
      e.preventDefault();
      mobileNav.closeAllSubnav(e.target.closest('.menu__item--open'));
      mobileNav.toggleSubnav(e.target);
    } else {
      // navigate to the link and close the nav.
      mobileNav.closeAllSubnav();
    }
  });


});