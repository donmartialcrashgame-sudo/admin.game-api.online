const cfg=window.GAME_API_CONFIG||{};let supabaseClient=null;const $=id=>document.getElementById(id);
function configured(){return cfg.SUPABASE_URL&&cfg.SUPABASE_ANON_KEY&&!cfg.SUPABASE_URL.includes('PASTE_')&&!cfg.SUPABASE_ANON_KEY.includes('PASTE_')}
async function init(){
 if(!configured()){location.replace('index.html');return}
 supabaseClient=window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY);
 const {data}=await supabaseClient.auth.getSession();
 if(!data.session){location.replace('index.html');return}
 const {data:admin,error}=await supabaseClient.from('admin_users').select('user_id,role').eq('user_id',data.session.user.id).eq('role','admin').maybeSingle();
 if(error||!admin){await supabaseClient.auth.signOut();location.replace('index.html');return}
 $('adminEmail').textContent=data.session.user.email||'Administrator';render('overview');
 supabaseClient.auth.onAuthStateChange((event,session)=>{if(!session)location.replace('index.html')});
}
$('logoutBtn').addEventListener('click',async()=>{await supabaseClient.auth.signOut();location.replace('index.html')});
document.querySelectorAll('.nav-item').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.nav-item').forEach(x=>x.classList.remove('active'));btn.classList.add('active');render(btn.dataset.page)}));
function render(page){const titles={overview:'Overview',users:'Users',games:'Games',api:'API & Keys',transactions:'Transactions',logs:'Activity Logs',settings:'Settings'};$('pageTitle').textContent=titles[page]||'Overview';const pages={overview:`<div class="grid"><div class="card"><div class="stat-label">TOTAL USERS</div><div class="stat-value">—</div><div class="stat-note">Customer accounts</div></div><div class="card"><div class="stat-label">ACTIVE GAMES</div><div class="stat-value">—</div><div class="stat-note">Crash & Big Odd rounds</div></div><div class="card"><div class="stat-label">API KEYS</div><div class="stat-value">—</div><div class="stat-note">Issued API credentials</div></div><div class="card"><div class="stat-label">SYSTEM</div><div class="stat-value">Online</div><div class="stat-note">Supabase connected</div></div></div><div class="section"><h3>Administration</h3><div class="empty">You are authenticated as an administrator. We will add each dashboard module one at a time.</div></div>`,users:`<div class="empty">Users module — coming next.</div>`,games:`<div class="empty">Games module — coming next.</div>`,api:`<div class="empty">API & Keys module — coming next.</div>`,transactions:`<div class="empty">Transactions module — coming next.</div>`,logs:`<div class="empty">Activity Logs module — coming next.</div>`,settings:`<div class="empty">Settings module — coming next.</div>`};$('pageContent').innerHTML=pages[page]||pages.overview}init();
