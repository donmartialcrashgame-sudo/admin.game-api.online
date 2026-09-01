const cfg=window.GAME_API_CONFIG||{};
let supabaseClient=null;
const $=id=>document.getElementById(id);
function error(message){$('loginError').textContent=message;$('loginError').hidden=false}
function configured(){return cfg.SUPABASE_URL&&cfg.SUPABASE_ANON_KEY&&!cfg.SUPABASE_URL.includes('PASTE_')&&!cfg.SUPABASE_ANON_KEY.includes('PASTE_')}
async function init(){
 if(!configured()){error('Supabase authentication is not configured.');return}
 supabaseClient=window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY);
 const {data}=await supabaseClient.auth.getSession();
 if(data.session) await verifyAdmin(data.session.user);
}
async function verifyAdmin(user){
 const {data,error}=await supabaseClient.from('admin_users').select('user_id,role').eq('user_id',user.id).eq('role','admin').maybeSingle();
 if(error||!data){await supabaseClient.auth.signOut();error('This account is not authorized for the administrator portal.');return}
 window.location.href='dashboard.html';
}
$('loginForm').addEventListener('submit',async e=>{
 e.preventDefault();$('loginError').hidden=true;
 if(!supabaseClient)return error('Supabase authentication is not configured.');
 const email=$('email').value.trim(),password=$('password').value;
 if(!email||!password)return error('Enter your email and password.');
 const btn=e.submitter;btn.disabled=true;
 try{const {data,error:authError}=await supabaseClient.auth.signInWithPassword({email,password});if(authError)throw authError;if(!data.session)throw new Error('No authenticated session was created.');await verifyAdmin(data.user)}catch(err){error('Sign in failed. Check your email and password.')}finally{btn.disabled=false}
});
$('togglePassword').addEventListener('click',()=>{const p=$('password'),b=$('togglePassword');const show=p.type==='password';p.type=show?'text':'password';b.textContent=show?'Hide':'Show';b.setAttribute('aria-label',show?'Hide password':'Show password')});
init();
