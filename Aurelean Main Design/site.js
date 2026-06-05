// AURELEAN — shared behaviors
(function(){
  // nav shadow on scroll
  var nav = document.querySelector('.nav');
  if(nav){
    var onScroll = function(){ nav.classList.toggle('scrolled', window.scrollY > 12); };
    onScroll(); window.addEventListener('scroll', onScroll, {passive:true});
  }

  // mobile menu
  var burger = document.querySelector('.nav-burger');
  var drawer = document.querySelector('.mobile-drawer');
  if(burger && drawer){
    burger.addEventListener('click', function(){
      var open = drawer.classList.toggle('open');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    drawer.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){ drawer.classList.remove('open'); document.body.style.overflow=''; });
    });
  }

  // reveal on scroll — opt-in hiding so content is never trapped invisible.
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  var vh = window.innerHeight || 800;
  if(!('IntersectionObserver' in window)){
    // no IO: leave everything visible
  } else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ e.target.classList.remove('pre'); io.unobserve(e.target); }
      });
    }, {threshold:0.04, rootMargin:'0px 0px -6% 0px'});
    reveals.forEach(function(el){
      var r = el.getBoundingClientRect();
      // only hide + animate elements that start below the fold
      if(r.top > vh*0.82){
        el.classList.add('pre');
        io.observe(el);
      }
    });
    // safety: nothing stays hidden past 3s
    window.addEventListener('load', function(){
      setTimeout(function(){ reveals.forEach(function(el){ el.classList.remove('pre'); }); }, 3000);
    });
  }

  // stat counters
  var seen = false;
  var statsBand = document.querySelector('[data-stats]');
  if(statsBand){
    var so = new IntersectionObserver(function(ents){
      ents.forEach(function(e){
        if(e.isIntersecting && !seen){ seen=true; runCounters(); }
      });
    }, {threshold:0.4});
    so.observe(statsBand);
  }
  function runCounters(){
    document.querySelectorAll('[data-count]').forEach(function(el){
      var target = parseFloat(el.getAttribute('data-count'));
      var suffix = el.getAttribute('data-suffix') || '';
      var dur = 1400, start = performance.now();
      function tick(now){
        var p = Math.min((now-start)/dur, 1);
        var eased = 1 - Math.pow(1-p, 3);
        var val = target * eased;
        var out = target >= 1000 ? Math.round(val).toLocaleString() : (Math.round(val*10)/10);
        el.textContent = out + suffix;
        if(p<1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }

  // year
  document.querySelectorAll('[data-year]').forEach(function(el){ el.textContent = new Date().getFullYear(); });
})();
