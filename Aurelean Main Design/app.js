// AURELEAN — workspace app logic
(function(){
  // ---------- palette for mill marks ----------
  var MARKS = ['#b8a888','#9aa089','#b59a7c','#a8916b','#9c8f9a','#8a9a8d','#bfa46f','#a47c63'];
  function mk(i){ return MARKS[i % MARKS.length]; }

  // ---------- view router ----------
  var navItems = document.querySelectorAll('.nav-i[data-view]');
  var mTabs = document.querySelectorAll('.m-tab[data-view]');
  var views = document.querySelectorAll('.view[data-view]');
  var titles = { overview:'Overview', rfq:'RFQ Inbox', suppliers:'Supplier Workspace', memory:'Operational Memory' };
  function goto(v){
    views.forEach(function(s){ s.classList.toggle('on', s.getAttribute('data-view')===v); });
    navItems.forEach(function(n){ n.classList.toggle('on', n.getAttribute('data-view')===v); });
    mTabs.forEach(function(n){ n.classList.toggle('on', n.getAttribute('data-view')===v); });
    var t=document.getElementById('page-title'); if(t) t.textContent = titles[v]||'Workspace';
    // reset RFQ drill-in when leaving the inbox
    var split=document.querySelector('.split'); if(split && v!=='rfq') split.classList.remove('show-detail');
    // scroll the active view back to top (mobile)
    var av=document.querySelector('.view.on .view-pad, .view.on .split'); if(av && av.scrollTo) av.scrollTo(0,0);
    if(history.replaceState) history.replaceState(null,'',location.pathname+'#'+v);
  }
  window.__appGoto = goto;
  navItems.forEach(function(n){ n.addEventListener('click', function(){ goto(n.getAttribute('data-view')); }); });
  mTabs.forEach(function(n){ n.addEventListener('click', function(){ goto(n.getAttribute('data-view')); }); });
  document.body.addEventListener('click', function(e){
    var g=e.target.closest('[data-goto]'); if(g) goto(g.getAttribute('data-goto'));
    var back=e.target.closest('[data-mback]'); if(back){ var sp=document.querySelector('.split'); if(sp) sp.classList.remove('show-detail'); }
  });
  var initial = (location.hash||'').replace('#',''); if(titles[initial]) goto(initial);

  // ---------- data ----------
  var RFQS = [
    { id:'RFQ-2041', mill:'Lanificio Cerruti', cc:'IT', mat:'Super 150s worsted wool', qty:'120 m', status:'resp', stLabel:'Responded', bids:4, updated:'2h ago', project:'FW26 Tailoring', target:'Q3 2026' },
    { id:'RFQ-2038', mill:'Nishijin Atelier', cc:'JP', mat:'Jacquard mulberry silk', qty:'40 m', status:'sample', stLabel:'Sampling', bids:2, updated:'5h ago', project:'Eveningwear capsule', target:'Q2 2026' },
    { id:'RFQ-2035', mill:'Gobi Combing Co.', cc:'MN', mat:'Grade-A raw cashmere', qty:'200 kg', status:'sent', stLabel:'Sent', bids:1, updated:'Yesterday', project:'FW26 Knitwear', target:'Q3 2026' },
    { id:'RFQ-2032', mill:'Libeco Mills', cc:'BE', mat:'Wet-spun Belgian linen', qty:'300 m', status:'resp', stLabel:'Responded', bids:5, updated:'2d ago', project:'SS26 Shirting', target:'Q1 2026' },
    { id:'RFQ-2029', mill:'Albini 1876', cc:'IT', mat:'Giza 87 poplin', qty:'250 m', status:'draft', stLabel:'Draft', bids:0, updated:'3d ago', project:'SS26 Shirting', target:'Q1 2026' },
    { id:'RFQ-2024', mill:'Drago Biella', cc:'IT', mat:'Brushed flannel', qty:'90 m', status:'closed', stLabel:'Closed', bids:3, updated:'1w ago', project:'FW26 Tailoring', target:'Q3 2026' }
  ];
  var stClass = { draft:'st-draft', sent:'st-sent', resp:'st-resp', sample:'st-sample', closed:'st-closed', risk:'st-risk' };

  var BIDS = {
    'RFQ-2041':[
      { mill:'Lanificio Cerruti', cc:'IT', price:'€42/m', lead:'6 wk', moq:'30 m', score:94, best:true },
      { mill:'Vitale Barberis', cc:'IT', price:'€46/m', lead:'5 wk', moq:'50 m', score:91 },
      { mill:'Drago Biella', cc:'IT', price:'€44/m', lead:'6 wk', moq:'45 m', score:88 },
      { mill:'Fox Brothers', cc:'GB', price:'€51/m', lead:'7 wk', moq:'40 m', score:85 }
    ]
  };

  // ---------- KPIs ----------
  var KPIS = [
    { lbl:'Active RFQs', num:'8', delta:['+2','this week',false], ic:'<path d="M4 5h16v11H7l-3 3V5Z"/>' },
    { lbl:'Awaiting response', num:'3', delta:['2','responded today',false], ic:'<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>' },
    { lbl:'Samples in transit', num:'5', delta:['1','arriving tomorrow',false], ic:'<path d="M3 7l9-4 9 4-9 4-9-4Z"/><path d="M3 7v8l9 4 9-4V7"/>' },
    { lbl:'Spend YTD', num:'€2.4M', delta:['-8%','vs budget',true], ic:'<path d="M12 3v18M7 7h7a3 3 0 0 1 0 6H7"/>' }
  ];
  var kpiWrap = document.getElementById('kpis');
  if(kpiWrap) kpiWrap.innerHTML = KPIS.map(function(k){
    return '<div class="acard kpi"><div class="top"><span class="lbl">'+k.lbl+'</span>'+
      '<span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">'+k.ic+'</svg></span></div>'+
      '<div class="num">'+k.num+'</div>'+
      '<div class="delta"><b class="'+(k.delta[2]?'dn':'')+'">'+k.delta[0]+'</b> '+k.delta[1]+'</div></div>';
  }).join('');

  // ---------- overview active RFQs ----------
  var ovr = document.getElementById('ov-rfqs');
  if(ovr) ovr.innerHTML = RFQS.slice(0,4).map(function(r,i){
    return '<div class="rfq-row" data-rfq="'+r.id+'">'+
      '<div class="mk" style="background:linear-gradient(135deg,'+mk(i)+','+mk(i)+'bb)">'+r.mill.charAt(0)+'</div>'+
      '<div class="info"><b>'+r.mill+'</b><span>'+r.mat+' · '+r.qty+'</span></div>'+
      '<div class="meta"><span class="chip-st '+stClass[r.status]+'"><span class="d"></span>'+r.stLabel+'</span><div style="margin-top:6px">'+r.updated+'</div></div>'+
      '</div>';
  }).join('');
  if(ovr) ovr.addEventListener('click', function(e){
    var row=e.target.closest('[data-rfq]'); if(!row) return;
    selectRFQ(row.getAttribute('data-rfq')); goto('rfq');
    var sp=document.querySelector('.split'); if(sp) sp.classList.add('show-detail');
  });

  // ---------- overview activity ----------
  var ACT = [
    { ic:'<path d="M5 13l4 4L19 7"/>', t:'<b>Cerruti</b> responded to <span>RFQ-2041</span> — €42/m, 6-week lead.', tm:'2 hours ago' },
    { ic:'<path d="M3 7l9-4 9 4-9 4-9-4Z"/>', t:'Sample dispatched for <b>Nishijin silk</b> <span>RFQ-2038</span>.', tm:'5 hours ago' },
    { ic:'<path d="M12 4l1.8 5.2L19 11l-5.2 1.8L12 18l-1.8-5.2L5 11Z"/>', t:'AURELEAN drafted a follow-up to <b>3 outstanding mills</b>.', tm:'Yesterday' },
    { ic:'<path d="M9 12l2 2 4-4"/>', t:'<b>Libeco linen</b> approved for SS26 Shirting.', tm:'2 days ago' }
  ];
  var ova = document.getElementById('ov-activity');
  if(ova) ova.innerHTML = ACT.map(function(a){
    return '<div class="tl"><div class="ti"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">'+a.ic+'</svg></div>'+
      '<div class="tx">'+a.t+'<span class="tm">'+a.tm+'</span></div></div>';
  }).join('');

  // ---------- RFQ inbox list ----------
  var listWrap = document.getElementById('rfq-items');
  function renderList(){
    if(!listWrap) return;
    listWrap.innerHTML = RFQS.map(function(r,i){
      return '<div class="li" data-rfq="'+r.id+'">'+
        '<div class="r1"><b>'+r.mill+'</b><span class="chip-st '+stClass[r.status]+'"><span class="d"></span>'+r.stLabel+'</span></div>'+
        '<div class="mat">'+r.mat+' · '+r.qty+'</div>'+
        '<div class="r2"><span class="bids">'+r.id+' · '+r.bids+' bid'+(r.bids===1?'':'s')+'</span><span class="bids">'+r.updated+'</span></div>'+
        '</div>';
    }).join('');
    listWrap.querySelectorAll('.li').forEach(function(li){
      li.addEventListener('click', function(){
        selectRFQ(li.getAttribute('data-rfq'));
        var sp=document.querySelector('.split'); if(sp) sp.classList.add('show-detail');
      });
    });
  }
  renderList();

  function selectRFQ(id){
    var r = RFQS.filter(function(x){ return x.id===id; })[0]; if(!r) return;
    document.querySelectorAll('#rfq-items .li').forEach(function(li){
      li.classList.toggle('on', li.getAttribute('data-rfq')===id);
    });
    var bids = BIDS[id];
    var detail = document.getElementById('rfq-detail');
    var idx = RFQS.indexOf(r);
    var bidsHTML;
    if(bids){
      bidsHTML = '<div class="bidscroll"><table class="bidtable"><thead><tr><th>Mill</th><th>Price</th><th>Lead time</th><th>MOQ</th><th>Reliability</th><th></th></tr></thead><tbody>'+
        bids.map(function(b,i){
          return '<tr><td><div class="mill"><div class="mk" style="background:linear-gradient(135deg,'+mk(i)+','+mk(i)+'bb)">'+b.mill.charAt(0)+'</div>'+b.mill+(b.best?'<span class="best">Best value</span>':'')+'</div></td>'+
            '<td><span class="price">'+b.price+'</span></td><td>'+b.lead+'</td><td>'+b.moq+'</td>'+
            '<td><span class="score-pill">'+b.score+'<span class="bar"><i style="width:'+b.score+'%"></i></span></span></td>'+
            '<td><button class="mini-btn'+(b.best?' g':'')+'">'+(b.best?'Award':'Compare')+'</button></td></tr>';
        }).join('')+'</tbody></table></div>';
    } else if(r.status==='draft'){
      bidsHTML = '<div style="text-align:center;padding:40px;color:var(--on-lt-mut)"><p>This RFQ is a draft. Issue it to begin receiving bids.</p><button class="abtn abtn-gold" style="margin-top:16px">Issue RFQ →</button></div>';
    } else {
      bidsHTML = '<div style="text-align:center;padding:40px;color:var(--on-lt-mut)"><p>Awaiting responses. AURELEAN is monitoring this thread.</p></div>';
    }
    detail.innerHTML =
      '<div class="dt-head"><div><div class="kicker-mono" style="color:var(--on-lt-dim)">'+r.id+' · '+r.project+'</div>'+
        '<h2>'+r.mill+'</h2></div><div style="display:flex;gap:10px"><button class="abtn abtn-ghost">Message</button><button class="abtn abtn-gold">Award bid</button></div></div>'+
      '<div class="dt-sub">'+r.mat+'</div>'+
      '<div class="dt-grid">'+
        '<div class="dt-cell"><div class="l">Quantity</div><div class="v">'+r.qty+'</div></div>'+
        '<div class="dt-cell"><div class="l">Target delivery</div><div class="v">'+r.target+'</div></div>'+
        '<div class="dt-cell"><div class="l">Status</div><div class="v"><span class="chip-st '+stClass[r.status]+'"><span class="d"></span>'+r.stLabel+'</span></div></div>'+
        '<div class="dt-cell"><div class="l">Bids received</div><div class="v">'+r.bids+'</div></div>'+
      '</div>'+
      (bids?'<div class="agent-summary"><svg class="spark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M12 4l1.8 5.2L19 11l-5.2 1.8L12 18l-1.8-5.2L5 11l5.2-1.8L12 4Z"/></svg>'+
        '<p><b>AURELEAN summary —</b> 4 bids in. <b>Cerruti</b> offers the best value at €42/m (12% under your €48 budget) with the strongest reliability score. Barberis is faster by one week but 9% dearer. Recommend awarding Cerruti and holding Barberis as backup.</p></div>':'')+
      '<div class="sec-title" style="margin-top:8px"><h2>Bids &amp; comparison</h2></div>'+ bidsHTML +
      '<div class="sec-title" style="margin-top:26px"><h2>Thread</h2></div>'+
      '<div class="thread">'+
        '<div class="msg"><div class="av" style="background:linear-gradient(135deg,#c9b79a,#8a7256)">EM</div><div class="bd"><b>Elise Moreau</b><span class="tm">3 days ago</span><p>Requesting Super 150s in 4 colourways for the FW26 tailoring line. Please confirm availability and lab-dip turnaround.</p></div></div>'+
        '<div class="msg"><div class="av" style="background:linear-gradient(135deg,'+mk(idx)+','+mk(idx)+'bb)">'+r.mill.charAt(0)+'</div><div class="bd"><b>'+r.mill+'</b><span class="tm">2 hours ago</span><p>Confirmed — all four colourways in stock. Lab dips in 8 days, bulk lead 6 weeks. Quote attached at €42/m DDP.</p></div></div>'+
      '</div>';
  }
  selectRFQ('RFQ-2041');

  // ---------- suppliers pipeline ----------
  var PIPE = [
    { stage:'Shortlisted', cls:'st-draft', items:[
      { nm:'Thomas Mason', cc:'UK · GB', mat:'Sea Island cotton', score:87 },
      { nm:'Solbiati', cc:'IT', mat:'Linen-silk hopsack', score:84 }
    ]},
    { stage:'In dialogue', cls:'st-sent', items:[
      { nm:'Gobi Combing Co.', cc:'MN', mat:'Grade-A raw cashmere', score:88 },
      { nm:'Taroni Como', cc:'IT', mat:'Duchesse satin silk', score:90 },
      { nm:'Schoeller', cc:'CH', mat:'Performance shell', score:82 }
    ]},
    { stage:'Sampling', cls:'st-sample', items:[
      { nm:'Nishijin Atelier', cc:'JP', mat:'Jacquard silk', score:91 },
      { nm:'Vitale Barberis', cc:'IT', mat:'High-twist wool', score:91 }
    ]},
    { stage:'Approved', cls:'st-resp', items:[
      { nm:'Lanificio Cerruti', cc:'IT', mat:'Super 150s wool', score:94 },
      { nm:'Libeco Mills', cc:'BE', mat:'Belgian linen', score:86 },
      { nm:'Albini 1876', cc:'IT', mat:'Giza 87 poplin', score:89 }
    ]}
  ];
  var pipe = document.getElementById('pipe');
  if(pipe){
    var gi=0;
    pipe.innerHTML = PIPE.map(function(col){
      var cards = col.items.map(function(s){
        var i=gi++;
        return '<div class="scard"><div class="top"><div class="mk" style="background:linear-gradient(135deg,'+mk(i)+','+mk(i)+'bb)">'+s.nm.charAt(0)+'</div>'+
          '<div class="nm"><b>'+s.nm+'</b><span>'+s.cc+'</span></div></div>'+
          '<div class="mat">'+s.mat+'</div>'+
          '<div class="foot"><span class="score-pill">'+s.score+'<span class="bar"><i style="width:'+s.score+'%"></i></span></span>'+
          '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--on-lt-dim)" stroke-width="1.5"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg></div></div>';
      }).join('');
      return '<div class="pcol"><div class="pcolhd"><span class="nm"><span class="chip-st '+col.cls+'" style="padding:3px"><span class="d"></span></span>'+col.stage+'</span><span class="ct">'+col.items.length+'</span></div>'+cards+'</div>';
    }).join('');
  }

  // ---------- operational memory ----------
  var MEM = {
    'Today':[
      { kind:'Decision', ic:'<path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/>', title:'Awarded FW26 wool to Lanificio Cerruti', body:'Selected Cerruti over Barberis and Drago on best value (€42/m, 12% under budget) and highest reliability. Barberis retained as backup supplier.', ents:['Cerruti','RFQ-2041','FW26 Tailoring'], tm:'2h ago' },
      { kind:'Sample', ic:'<path d="M3 7l9-4 9 4-9 4-9-4Z"/><path d="M3 7v8l9 4 9-4V7"/>', title:'Nishijin silk sample dispatched', body:'Jacquard mulberry silk lab dips shipped for the eveningwear capsule. Expected arrival in 4 days; approval gate set.', ents:['Nishijin','RFQ-2038','Eveningwear'], tm:'5h ago' }
    ],
    'This week':[
      { kind:'Signal', ic:'<path d="M3 12h4l3 7 4-14 3 7h4"/>', title:'Cashmere lead times trending +3 weeks', body:'AURELEAN detected seasonal lead-time inflation across Mongolian cashmere suppliers. Flagged for the FW26 knitwear plan with a recommendation to sample earlier.', ents:['Cashmere','Gobi Combing','Market signal'], tm:'2 days ago' },
      { kind:'Decision', ic:'<path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/>', title:'Approved Libeco linen for SS26 shirting', body:'Wet-spun Belgian linen approved after lab-dip review. Locked at €18/m with a 4-week lead. Provenance and RWS certification verified.', ents:['Libeco','SS26 Shirting'], tm:'3 days ago' },
      { kind:'Message', ic:'<path d="M4 5h16v11H7l-3 3V5Z"/>', title:'Agentic follow-up sent to 3 mills', body:'AURELEAN drafted and sent follow-ups to outstanding bidders on RFQ-2041, with a 48-hour response window. Two responses received since.', ents:['RFQ-2041','Agent'], tm:'4 days ago' }
    ],
    'Earlier':[
      { kind:'Spec', ic:'<path d="M4 6h16M4 12h16M4 18h10"/>', title:'Defined FW26 tailoring fabric brief', body:'Locked the spec for the FW26 tailoring line: Super 150s–180s worsted, 240–260 g/m, four core colourways. This brief now anchors all related RFQs.', ents:['FW26 Tailoring','Spec'], tm:'2 weeks ago' }
    ]
  };
  var feed = document.getElementById('mem-feed');
  if(feed){
    var html='';
    Object.keys(MEM).forEach(function(day){
      html += '<div class="daygroup"><div class="dayhd">'+day+'</div>';
      var entries = MEM[day];
      entries.forEach(function(m,i){
        var last = (i===entries.length-1);
        html += '<div class="mem"><div class="rail"><div class="knot"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">'+m.ic+'</svg></div>'+(last?'':'<div class="line"></div>')+'</div>'+
          '<div class="body"><div class="r1"><span class="kind">'+m.kind+'</span><span class="tm">'+m.tm+'</span></div>'+
          '<h4>'+m.title+'</h4><p>'+m.body+'</p>'+
          '<div class="ents">'+m.ents.map(function(e){ return '<span class="ent"><span class="d"></span>'+e+'</span>'; }).join('')+'</div>'+
          '<div class="prov"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M12 4l1.8 5.2L19 11l-5.2 1.8L12 18l-1.8-5.2L5 11l5.2-1.8L12 4Z"/></svg>Remembered by AURELEAN · linked across '+m.ents.length+' entities</div>'+
          '</div></div>';
      });
      html += '</div>';
    });
    feed.innerHTML = html;
  }
  // memory suggestion chips fill the ask bar
  document.querySelectorAll('.mem-sugg .chip').forEach(function(c){
    c.addEventListener('click', function(){
      var inp=document.querySelector('.mem-ask input'); if(inp){ inp.value=c.textContent; inp.focus(); }
    });
  });
})();
