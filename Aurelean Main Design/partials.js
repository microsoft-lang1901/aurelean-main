// AURELEAN — shared nav + footer chrome, injected so every page stays consistent.
(function(){
  var page = document.body.getAttribute('data-page') || '';
  var LOGO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M12 3 L21 20 H3 Z"/><path d="M12 10 L16.5 20 H7.5 Z" stroke-opacity=".55"/></svg>';
  var links = [
    ['Platform','Platform.html','platform'],
    ['Solutions','Solutions.html','solutions'],
    ['Trade','Trade.html','trade'],
    ['Intelligence','Platform.html#intelligence',''],
    ['Developers','Developers.html','developers'],
    ['Company','#company','']
  ];
  function navLinks(){
    return links.map(function(l){
      return '<a href="'+l[1]+'"'+(l[2]&&l[2]===page?' class="active"':'')+'>'+l[0]+'</a>';
    }).join('');
  }
  function drawerLinks(){
    return links.map(function(l){
      return '<a href="'+l[1]+'" style="padding:16px 0;border-bottom:1px solid var(--line-dk);font-size:20px;font-family:var(--serif)">'+l[0]+'</a>';
    }).join('');
  }

  var navHTML =
  '<header class="nav" data-screen-label="nav"><div class="wrap nav-in">'+
    '<a href="Home.html" class="logo">'+LOGO+'AURELEAN</a>'+
    '<nav class="nav-links">'+navLinks()+'</nav>'+
    '<div class="nav-right"><a href="App.html" class="signin">Sign in</a>'+
    '<a href="Request-Access.html" class="btn btn-gold">Request Access</a>'+
    '<button class="nav-burger" aria-label="Menu"><svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 7h18M3 12h18M3 17h18"/></svg></button>'+
    '</div></div></header>'+
  '<div class="mobile-drawer">'+drawerLinks()+
    '<a href="Request-Access.html" class="btn btn-gold" style="margin-top:20px;justify-content:center">Request Access</a></div>';

  var footHTML =
  '<footer class="footer" id="company"><div class="wrap"><div class="footer-grid">'+
    '<div><a href="Home.html" class="logo" style="color:var(--on-dk)">'+LOGO+'AURELEAN</a>'+
    '<p class="mut" style="margin-top:18px;max-width:30ch;font-size:13px">AI-native operational intelligence for global sourcing, procurement, and manufacturing coordination.</p></div>'+
    '<div><h5>Platform</h5><ul><li><a href="Platform.html">Overview</a></li><li><a href="Trade.html">Trade</a></li><li><a href="Platform.html#intelligence">Intelligence</a></li><li><a href="Platform.html#ai">AI Agent</a></li><li><a href="Platform.html#infra">Infrastructure</a></li></ul></div>'+
    '<div><h5>Solutions</h5><ul><li><a href="Solutions.html">Luxury Textiles</a></li><li><a href="Solutions.html">Furnishings</a></li><li><a href="Solutions.html">Material Sourcing</a></li><li><a href="Solutions.html">Manufacturing</a></li></ul></div>'+
    '<div><h5>Company</h5><ul><li><a href="#">About</a></li><li><a href="#">Careers</a></li><li><a href="#">Newsroom</a></li><li><a href="#">Contact</a></li></ul></div>'+
    '<div><h5>Resources</h5><ul><li><a href="Developers.html">Developers</a></li><li><a href="Developers.html#reference">Documentation</a></li><li><a href="#">Security</a></li><li><a href="#">Privacy</a></li></ul></div>'+
    '</div><div class="footer-bottom"><span>© <span data-year></span> AURELEAN. All rights reserved.</span>'+
    '<span class="kicker-mono" style="color:var(--on-dk-dim)">Operational intelligence, end to end.</span></div></div></footer>';

  var navMount = document.getElementById('site-nav');
  var footMount = document.getElementById('site-footer');
  if(navMount) navMount.outerHTML = navHTML;
  if(footMount) footMount.outerHTML = footHTML;
})();
