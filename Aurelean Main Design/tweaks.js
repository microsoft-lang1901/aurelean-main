// AURELEAN — Tweaks panel (shared across pages, persisted in localStorage)
(function(){
  var LS = 'aurelean.tweaks';
  var DEFAULTS = { accent:'gold', font:'cormorant', density:'comfortable' };

  var ACCENTS = {
    gold:      { '--gold':'#c4a064', '--gold-2':'#d9bd86', '--gold-deep':'#a8854b', '--gold-soft':'rgba(196,160,100,0.14)', label:'Gold' },
    bronze:    { '--gold':'#b07a4e', '--gold-2':'#cf9a6c', '--gold-deep':'#915f38', '--gold-soft':'rgba(176,122,78,0.14)', label:'Bronze' },
    champagne: { '--gold':'#cdb38b', '--gold-2':'#e3cda9', '--gold-deep':'#a8916b', '--gold-soft':'rgba(205,179,139,0.16)', label:'Champagne' },
    sage:      { '--gold':'#8d9b7e', '--gold-2':'#a9b69a', '--gold-deep':'#6f7d61', '--gold-soft':'rgba(141,155,126,0.15)', label:'Sage' }
  };
  var FONTS = {
    cormorant: { v:"'Cormorant Garamond','Cormorant',Georgia,serif", label:'Cormorant' },
    playfair:  { v:"'Playfair Display',Georgia,serif", label:'Playfair' },
    times:     { v:"'Times New Roman',Times,serif", label:'Times' },
    grotesk:   { v:"'Segoe UI',system-ui,Arial,sans-serif", label:'Segoe UI' }
  };

  var state = load();
  apply(state);

  function load(){
    try{ return Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem(LS)||'{}')); }
    catch(e){ return Object.assign({}, DEFAULTS); }
  }
  function save(){
    localStorage.setItem(LS, JSON.stringify(state));
    try{ window.parent.postMessage({type:'__edit_mode_set_keys', edits:state}, '*'); }catch(e){}
  }
  function apply(s){
    var r = document.documentElement;
    var a = ACCENTS[s.accent]||ACCENTS.gold;
    Object.keys(a).forEach(function(k){ if(k.charAt(0)==='-') r.style.setProperty(k, a[k]); });
    r.style.setProperty('--serif', (FONTS[s.font]||FONTS.cormorant).v);
    if(s.density==='compact'){
      r.style.setProperty('--pad','clamp(18px,3.4vw,44px)');
      r.style.setProperty('--maxw','1180px');
      document.body && document.body.classList.add('density-compact');
    } else {
      r.style.removeProperty('--pad'); r.style.removeProperty('--maxw');
      document.body && document.body.classList.remove('density-compact');
    }
    if(s.font==='playfair' || true) ensureFontLink(s.font);
  }
  function ensureFontLink(font){
    if(font==='playfair' && !document.getElementById('tw-playfair')){
      var l=document.createElement('link'); l.id='tw-playfair'; l.rel='stylesheet';
      l.href='https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600&display=swap';
      document.head.appendChild(l);
    }
  }

  // ---- panel ----
  var panel;
  function build(){
    if(panel) return panel;
    panel = document.createElement('div');
    panel.id = 'tw-panel';
    panel.innerHTML =
      '<div class="tw-head"><span>Tweaks</span><button class="tw-x" aria-label="Close">&times;</button></div>'+
      group('Accent', 'accent', Object.keys(ACCENTS).map(function(k){
        return '<button class="tw-sw" data-k="accent" data-v="'+k+'" title="'+ACCENTS[k].label+'"><i style="background:'+ACCENTS[k]['--gold']+'"></i>'+ACCENTS[k].label+'</button>';
      }).join(''))+
      group('Headline', 'font', Object.keys(FONTS).map(function(k){
        return '<button class="tw-opt" data-k="font" data-v="'+k+'" style="font-family:'+FONTS[k].v+'">'+FONTS[k].label+'</button>';
      }).join(''))+
      group('Density', 'density', ['comfortable','compact'].map(function(k){
        return '<button class="tw-opt" data-k="density" data-v="'+k+'">'+(k.charAt(0).toUpperCase()+k.slice(1))+'</button>';
      }).join(''));
    document.body.appendChild(panel);
    injectCSS();
    sync();
    panel.addEventListener('click', function(e){
      if(e.target.closest('.tw-x')){ hide(); try{ window.parent.postMessage({type:'__edit_mode_dismissed'},'*'); }catch(_){ } return; }
      var b = e.target.closest('[data-k]'); if(!b) return;
      state[b.getAttribute('data-k')] = b.getAttribute('data-v');
      apply(state); save(); sync();
    });
    return panel;
  }
  function group(title, key, inner){
    return '<div class="tw-grp"><div class="tw-lbl">'+title+'</div><div class="tw-row" data-grp="'+key+'">'+inner+'</div></div>';
  }
  function sync(){
    if(!panel) return;
    panel.querySelectorAll('[data-k]').forEach(function(b){
      b.classList.toggle('on', state[b.getAttribute('data-k')]===b.getAttribute('data-v'));
    });
  }
  function show(){ build(); panel.classList.add('open'); }
  function hide(){ if(panel) panel.classList.remove('open'); }

  function injectCSS(){
    if(document.getElementById('tw-css')) return;
    var s=document.createElement('style'); s.id='tw-css';
    s.textContent =
    '#tw-panel{position:fixed;right:18px;bottom:18px;z-index:9999;width:268px;background:#1b1813;color:#f4f0e8;'+
    'border:1px solid rgba(244,240,233,.14);border-radius:10px;padding:6px;box-shadow:0 24px 60px -20px rgba(0,0,0,.7);'+
    'font-family:\"Segoe UI\",system-ui,Arial,sans-serif;transform:translateY(14px) scale(.98);opacity:0;pointer-events:none;'+
    'transition:.3s cubic-bezier(.22,.61,.36,1);}'+
    '#tw-panel.open{transform:none;opacity:1;pointer-events:auto;}'+
    '.tw-head{display:flex;justify-content:space-between;align-items:center;padding:10px 12px 8px;font-family:"Cormorant Garamond",serif;font-size:19px;letter-spacing:.04em;}'+
    '.tw-x{background:none;border:0;color:rgba(244,240,233,.5);font-size:20px;cursor:pointer;line-height:1;}'+
    '.tw-x:hover{color:#f4f0e8;}'+
    '.tw-grp{padding:10px 12px;border-top:1px solid rgba(244,240,233,.08);}'+
    '.tw-lbl{font-size:9.5px;letter-spacing:.16em;text-transform:uppercase;color:rgba(244,240,233,.42);margin-bottom:9px;}'+
    '.tw-row{display:flex;flex-wrap:wrap;gap:6px;}'+
    '.tw-sw{display:inline-flex;align-items:center;gap:6px;background:rgba(244,240,233,.04);border:1px solid rgba(244,240,233,.12);'+
    'color:rgba(244,240,233,.8);border-radius:100px;padding:5px 10px 5px 6px;font-size:11px;cursor:pointer;transition:.2s;}'+
    '.tw-sw i{width:12px;height:12px;border-radius:50%;display:inline-block;}'+
    '.tw-opt{flex:1;min-width:54px;background:rgba(244,240,233,.04);border:1px solid rgba(244,240,233,.12);color:rgba(244,240,233,.8);'+
    'border-radius:6px;padding:8px 6px;font-size:12px;cursor:pointer;transition:.2s;}'+
    '.tw-sw:hover,.tw-opt:hover{border-color:rgba(244,240,233,.34);}'+
    '.tw-sw.on,.tw-opt.on{border-color:var(--gold,#c4a064);color:#fff;background:rgba(196,160,100,.12);}';
    document.head.appendChild(s);
  }

  // ---- host protocol (listener BEFORE announce) ----
  window.addEventListener('message', function(e){
    var t = e.data && e.data.type;
    if(t==='__activate_edit_mode') show();
    else if(t==='__deactivate_edit_mode') hide();
  });
  try{ window.parent.postMessage({type:'__edit_mode_available'}, '*'); }catch(e){}
})();
