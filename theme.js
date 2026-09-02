/* Shared Game API admin appearance + settings. Reads only admin settings through the protected RPC. */
(function(){
  var cfg=window.GAME_API_CONFIG||{};
  if(!cfg.SUPABASE_URL||!cfg.SUPABASE_ANON_KEY)return;
  function apply(s){
    var theme=s.theme||'dark', root=document.documentElement;
    root.dataset.theme=theme;
    root.dataset.accent=s.accent_color||'blue';
    if(s.compact_sidebar)root.classList.add('compact-sidebar');else root.classList.remove('compact-sidebar');
    if(s.reduced_motion)root.classList.add('reduced-motion');else root.classList.remove('reduced-motion');
  }
  function boot(){
    if(!window.supabase)return;
    var db=window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY);
    db.rpc('admin_get_settings').then(function(r){
      if(r.error||!r.data)return;
      var s={};r.data.forEach(function(x){try{s[x.key]=JSON.parse(x.value)}catch(e){s[x.key]=x.value}});apply(s);
    });
    db.channel('admin-settings-theme').on('postgres_changes',{event:'UPDATE',schema:'public',table:'admin_settings'},function(p){
      var k=p.new.key,v=p.new.value;try{v=JSON.parse(v)}catch(e){};var s={};s[k]=v; if(k==='theme'||k==='accent_color'||k==='compact_sidebar'||k==='reduced_motion'){
        var patch={};patch[k]=v;apply(patch);
        db.rpc('admin_get_settings').then(function(r){if(!r.error){var all={};r.data.forEach(function(x){try{all[x.key]=JSON.parse(x.value)}catch(e){all[x.key]=x.value}});apply(all)}});
      }
    }).subscribe();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
