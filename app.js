const cfg=window.GAME_API_CONFIG||{};
const loginScreen=document.getElementById('loginScreen');
const dashboard=document.getElementById('dashboard');
const pageContent=document.getElementById('pageContent');
const pageTitle=document.getElementById('pageTitle');
const adminEmail=document.getElementById('adminEmail');
const loginError=document.getElementById('loginError');
let supabaseClient=null;

function showError(message){loginError.textContent=message;loginError.hidden=false}
function configured(){return cfg.SUPABASE_URL&&cfg.SUPABASE_ANON_KEY&&!cfg.SUPABASE_URL.includes('PASTE_')&&!cfg.SUPABASE_ANON_KEY.includes('PASTE_')}

async function start(){
  if(!configured()){showError('Admin authentication is not configured yet. Add the Supabase project URL and publishable/anon key in config.js.');return}
  supabaseClient=window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY);
  const {data}=await supabaseClient.auth.getSession();
  if(data.session) await authorize(data.session.user); else loginScreen.hidden=false;
  supabaseClient.auth.onAuthStateChange(async(event,session)=>{
    if(session) await authorize(session.user); else {dashboard.hidden=true;loginScreen.hidden=false}
  });
}

async function authorize(user){
  // The frontend does not decide admin access. The database/RLS policies must enforce it.
  // Expected Supabase profile/role design: user metadata or a protected admin_users table.
  // This client checks the signed-in user's metadata as a UX gate; sensitive data must still be protected by RLS.
  const role=user.app_metadata?.role||user.user_metadata?.role;
  if(role!=='admin'){
    await supabaseClient.auth.signOut();
    showError('Access denied. This account is not an administrator.');
    return;
  }
  loginScreen.hidden=true;dashboard.hidden=false;adminEmail.textContent=user.email||'Administrator';render('overview');
}

document.getElementById('loginForm').addEventListener('submit',async e=>{
 e.preventDefault();loginError.hidden=true;
 if(!supabaseClient){showError('Supabase is not configured yet.');return}
 const email=document.getElementById('email').value.trim();const password=document.getElementById('password').value;
 const {error}=await supabaseClient.auth.signInWithPassword({email,password});
 if(error)showError(error.message);
});

document.getElementById('logoutBtn').addEventListener('click',async()=>{if(supabaseClient)await supabaseClient.auth.signOut()});
document.querySelectorAll('.nav-item').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.nav-item').forEach(x=>x.classList.remove('active'));btn.classList.add('active');render(btn.dataset.page)}));

function render(page){
 const titles={overview:'Overview',users:'Users',games:'Games',api:'API & Keys',transactions:'Transactions',logs:'Activity Logs',settings:'Settings'};pageTitle.textContent=titles[page]||'Overview';
 const pages={
 overview:`<div class="grid"><div class="card"><div class="stat-label">TOTAL USERS</div><div class="stat-value">—</div><div class="stat-note">Connect your users table</div></div><div class="card"><div class="stat-label">ACTIVE GAMES</div><div class="stat-value">—</div><div class="stat-note">Live database data</div></div><div class="card"><div class="stat-label">API REQUESTS</div><div class="stat-value">—</div><div class="stat-note">Request analytics</div></div><div class="card"><div class="stat-label">SYSTEM</div><div class="stat-value">Online</div><div class="stat-note">Admin console ready</div></div></div><div class="section"><h3>Administration</h3><div class="empty">The dashboard shell is ready. Once we connect your existing Supabase tables, these cards will show live statistics.</div></div>`,
 users:`<div class="toolbar"><input placeholder="Search users..."></div><div class="empty">Users management will load securely from Supabase here.</div>`,
 games:`<div class="empty">Game rounds and game controls will appear here.</div>`,
 api:`<div class="empty">API keys, usage and request monitoring will appear here. Secret keys will never be exposed in browser code.</div>`,
 transactions:`<div class="empty">Transaction management will appear here when connected to your transaction table.</div>`,
 logs:`<div class="empty">Administrator activity logs will appear here.</div>`,
 settings:`<div class="card"><h3>Security</h3><p class="stat-note">Use Supabase Auth, Row Level Security and protected Edge Functions for privileged operations.</p></div>`};
 pageContent.innerHTML=pages[page]||pages.overview;
}
start();
