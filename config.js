// Frontend-safe Supabase configuration only. Never place the service-role/secret key here.
window.GAME_API_CONFIG={
  SUPABASE_URL:'https://qbagxeqquskkjksoraiz.supabase.co',
  SUPABASE_ANON_KEY:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJxYmFneGVxcXVza2tqa3NvcmFpejIiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc4NzMyMzg5OCwiZXhwIjoyMTAyODk5ODk4fQ.CpvwORFZrDtM5TVzqUlkHyc39E4jofCebQ16Ne-wShk'
};
(function(){
  var path=(location.pathname||'').split('/').pop().toLowerCase();
  if(path==='index.html'||path==='')return;
  var s=document.createElement('script');s.src='theme.js';s.defer=true;document.head.appendChild(s);
})();