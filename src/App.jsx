import React, { useEffect, useMemo, useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
  useLocation,
  useParams,
} from 'react-router-dom';

import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  where,
} from 'firebase/firestore';

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';

import {
  Package,
  ShoppingBag,
  Users,
  Factory,
  LayoutDashboard,
  Settings,
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  Check,
  Ban,
  ArrowLeft,
  LogOut,
  User,
  Menu,
  ChevronDown,
  ExternalLink,
  ClipboardList,
  Tags,
  UserRoundCog,
  RefreshCw,
  Eye,
  EyeOff,
  Save,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Truck,
  DollarSign,
  BarChart3,
  MessageSquare,
  Layers,
  Mail,
  KeyRound,
  Heart,
  UserRound,
} from 'lucide-react';

import { db, storage, functions } from './firebase';
import { useAuth } from './auth';

import './index.css';

/* =========================================================
   HELPERS
========================================================= */

function money(value) {
  const number = Number(value || 0);

  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
  }).format(number);
}

function dateValue(value) {
  if (!value) return '—';

  if (value?.toDate) {
    return value.toDate().toLocaleString('en-ZA');
  }

  if (value?.seconds) {
    return new Date(value.seconds * 1000).toLocaleString('en-ZA');
  }

  try {
    return new Date(value).toLocaleString('en-ZA');
  } catch {
    return '—';
  }
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getImage(item) {
  return (
    item?.image ||
    item?.imageUrl ||
    item?.photo ||
    item?.thumbnail ||
    '/assets/placeholder.jpg'
  );
}

const CART_KEY = 'kcc_cart_v1';
function readCart() { try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch { return []; } }
function writeCart(items) { localStorage.setItem(CART_KEY, JSON.stringify(items)); window.dispatchEvent(new Event('kcc-cart-updated')); }
function addToCart(product, quantity = 1) {
  const cart = readCart();
  const existing = cart.find(item => item.id === product.id);
  if (existing) existing.quantity += quantity;
  else cart.push({ id: product.id, name: product.name, image: product.image || product.images?.[0] || '', price: Number(product.price || 0), quantity });
  writeCart(cart);
}
function cartTotal(items) { return items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0); }

/* =========================================================
   LAYOUT
========================================================= */

function Layout({ children }) {
  const { user, profile, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const accountPath = user ? (profile?.role === 'admin' ? '/admin' : '/account') : '/login';
  return (
    <div className="app-shell">
      <div className="announcement">OCEAN VIEW · CAPE TOWN &nbsp; / &nbsp; CRAFTED LOCALLY, DESIGNED TO LAST</div>
      <header className="site-header">
        <div className="shell nav">
          <Link to="/" className="brand brand-logo" aria-label="Knot & Cross Collective home">
            <img src="/logo..-removebg-preview.png" alt="Knot & Cross Collective" />
          </Link>
          <button className="mobile" onClick={() => setMobileOpen(v => !v)} aria-label="Open menu">{mobileOpen ? <X/> : <Menu/>}</button>
          <nav className={mobileOpen ? 'nav-links open' : 'nav-links'}>
            <Link to="/shop" onClick={() => setMobileOpen(false)}>Shop</Link>
            <Link to="/rental" onClick={() => setMobileOpen(false)}>Rental</Link>
            <Link to="/services" onClick={() => setMobileOpen(false)}>Services</Link>
            <Link to="/designers" onClick={() => setMobileOpen(false)}>Designers</Link>
            <Link to="/about" onClick={() => setMobileOpen(false)}>Our Story</Link>
          </nav>
          <div className="nav-actions">
            {!user ? <Link to="/login" className="login-nav">Login</Link> : <Link to={accountPath} className="login-nav">My account</Link>}
            <Link to="/cart" className="bag" aria-label="Shopping bag"><ShoppingBag size={18}/></Link>
            {user && <button className="logout-mini" onClick={logout} title="Sign out"><LogOut size={16}/></button>}
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer className="site-footer">
        <div className="shell footer-grid">
          <div><Link to="/" className="footer-brand"><img src="/logo..-removebg-preview.png" alt="Knot & Cross Collective"/></Link><p>Premium fashion, CMT, design development and a creative ecosystem rooted in Ocean View, Cape Town.</p></div>
          <div><h4>Explore</h4><Link to="/shop">Shop</Link><Link to="/rental">Rental</Link><Link to="/services">Services</Link><Link to="/about">Our Story</Link></div>
          <div><h4>Account</h4><Link to="/login">Login</Link><Link to="/register">Create account</Link><Link to="/forgot-password">Forgot password</Link></div>
          <div><h4>Contact</h4><a href="mailto:design@knotandcross.co.za">design@knotandcross.co.za</a><span>Ocean View, Cape Town</span><span>Appointments only</span></div>
        </div>
        <div className="shell footer-bottom"><span>© {new Date().getFullYear()} Knot & Cross Collective</span><span>We make with purpose.</span></div>
      </footer>
    </div>
  );
}

/* =========================================================
   HOME
========================================================= */

function Home() {
  const [featured, setFeatured] = useState([]);
  useEffect(() => onSnapshot(collection(db,'products'), snap => {
    setFeatured(snap.docs.map(d=>({id:d.id,...d.data()})).filter(p=>p.active!==false && p.featured===true).slice(0,4));
  }), []);
  return <Layout>
    <section className="hero hero-new">
      <div className="hero-media"><img src="/assets/from-friendship.jpg" alt="Knot & Cross Collective fashion craftsmanship"/></div>
      <div className="hero-overlay"/>
      <div className="shell hero-content">
        <p className="eyebrow">KNOT & CROSS COLLECTIVE · OCEAN VIEW</p>
        <h1>Where craftsmanship<br/><i>meets connection.</i></h1>
        <p>Premium garments, fashion development and creative opportunity — made locally, with intention.</p>
        <div className="hero-cta"><Link className="btn btn-light" to="/shop">Shop the collection</Link><Link className="hero-outline" to="/rental">Explore rental</Link></div>
      </div>
      <div className="hero-caption">CMT · DESIGN · COMMUNITY · CAPE TOWN</div>
    </section>
    <section className="section intro"><div className="shell split"><div><p className="eyebrow">THE COLLECTIVE</p><h2>Two threads. One purpose.</h2></div><div><p className="lead">The knot anchors every stitch. The cross is where threads meet. Together they represent strength, craftsmanship and the paths that connect people, generations, skills and opportunity.</p><Link className="text-link" to="/about">Read our story →</Link></div></div></section>
    <section className="section featured-home"><div className="shell"><div className="section-head"><div><p className="eyebrow">CURATED BY THE COLLECTIVE</p><h2>Featured pieces.</h2></div><Link className="text-link" to="/shop">View all pieces →</Link></div>{featured.length ? <div className="product-grid home-product-grid">{featured.map(p=><Link to={`/product/${p.slug||p.id}`} className="product-card" key={p.id}><div className="product-image"><img src={getImage(p)} alt={p.name}/><span className="product-ribbon">{p.type === 'rental' ? 'RENTAL' : 'FOR SALE'}</span></div><div className="product-card-info"><div><h3>{p.name}</h3><p>{p.category || 'Collective piece'}</p></div><span className="product-price">{p.type === 'rental' ? 'Rental enquiry' : money(p.price)}</span></div></Link>)}</div> : <div className="featured-empty"><Package/><div><h3>The next collection is being prepared.</h3><p>Featured pieces published by the collective will appear here.</p></div></div>}</div></section>
    <section className="service-band"><div className="shell service-band-inner"><div><p className="eyebrow">MORE THAN A STORE</p><h2>Wear it. Rent it. Make it.</h2><p>Discover pieces for purchase and rental, then work with our team on CMT, sampling and fashion development.</p></div><div className="service-band-links"><Link to="/shop">Shop <span>↗</span></Link><Link to="/rental">Rental <span>↗</span></Link><Link to="/services">Production <span>↗</span></Link></div></div></section>
    <section className="image-band"><img src="/assets/community.jpg" alt="Fashion community and craftsmanship"/><div><p className="eyebrow">COMMUNITY · CRAFT · POSSIBILITY</p><h2>Building a fashion hub where skills create opportunity.</h2><Link className="btn btn-light" to="/about">Our vision</Link></div></section>
  </Layout>;
}

/* =========================================================
   SHOP
========================================================= */

function Shop() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [type, setType] = useState('all');

  useEffect(() => {
    const unsubscribeProducts = onSnapshot(
      collection(db, 'products'),
      (snapshot) => {
        setProducts(
          snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data(),
          }))
        );
      }
    );

    const unsubscribeCategories = onSnapshot(
      collection(db, 'categories'),
      (snapshot) => {
        setCategories(
          snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data(),
          }))
        );
      }
    );

    return () => {
      unsubscribeProducts();
      unsubscribeCategories();
    };
  }, []);

  const visibleProducts = useMemo(() => {
    return products.filter((product) => {
      const active = product.active !== false;

      const matchesSearch =
        !search ||
        String(product.name || '')
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory = category === 'all' || product.category === category || product.categoryId === category;
      const matchesType = type === 'all' || (product.type || 'sale') === type;
      return active && matchesSearch && matchesCategory && matchesType;
    });
  }, [products, search, category]);

  return (
    <Layout>
      <section className="shell page-section">
        <div className="page-heading">
          <div>
            <p className="eyebrow">THE COLLECTION</p>
            <h1>Shop</h1>
          </div>

          <div className="shop-search">
            <Search size={17} />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search pieces..."
            />
          </div>
        </div>

        <div className="shop-type-filter"><button className={type === 'all' ? 'active' : ''} onClick={() => setType('all')}>All pieces</button><button className={type === 'sale' ? 'active' : ''} onClick={() => setType('sale')}>For sale</button><button className={type === 'rental' ? 'active' : ''} onClick={() => setType('rental')}>For rental</button></div>
        <div className="category-filter">
          <button
            className={category === 'all' ? 'active' : ''}
            onClick={() => setCategory('all')}
          >
            All
          </button>

          {categories.map((item) => (
            <button
              key={item.id}
              className={
                category === item.id || category === item.name
                  ? 'active'
                  : ''
              }
              onClick={() =>
                setCategory(item.id === category ? 'all' : item.id)
              }
            >
              {item.name}
            </button>
          ))}
        </div>

        <div className="product-grid">
          {visibleProducts.map((product) => (
            <Link
              to={`/product/${product.slug || product.id}`}
              className="product-card"
              key={product.id}
            >
              <div className="product-image"><img src={getImage(product)} alt={product.name} /><span className="product-ribbon">{product.type === 'rental' ? 'RENTAL' : 'FOR SALE'}</span></div>

              <div className="product-card-info">
                <div>
                  <h3>{product.name}</h3>
                  <p>{product.category || 'Collection'}</p>
                </div>

                <span className="product-price">{product.type === 'rental' ? 'Rental enquiry' : money(product.price)}</span>
              </div>
            </Link>
          ))}
        </div>

        {!visibleProducts.length && (
          <div className="empty page-empty">
            <Package />
            <h2>No pieces found</h2>
            <p>Try another search or category.</p>
          </div>
        )}
      </section>
    </Layout>
  );
}

/* =========================================================
   PRODUCT
========================================================= */

function Product() {
  const { slug } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'products'),
      (snapshot) => {
        const found = snapshot.docs
          .map((item) => ({
            id: item.id,
            ...item.data(),
          }))
          .find(
            (item) =>
              item.slug === slug || item.id === slug
          );

        setProduct(found || null);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <div className="empty page-empty">
          <RefreshCw className="spin" />
          <p>Loading product...</p>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="empty page-empty">
          <Package />
          <h2>Product not found</h2>
          <Link to="/shop" className="btn btn-dark">
            Back to shop
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="shell product-detail">
        <Link to="/shop" className="back-link">
          <ArrowLeft size={16} />
          Back to shop
        </Link>

        <div className="product-detail-grid">
          <div className="product-detail-image">
            <img src={getImage(product)} alt={product.name} />
          </div>

          <div className="product-detail-copy">
            <p className="eyebrow">
              {product.category || 'COLLECTION'}
            </p>

            <h1>{product.name}</h1>

            <p>{product.description || 'A piece from the Knot & Cross Collective.'}</p>

            <div className="detail-meta">
              <span>
                Stock: {Number(product.stock || 0)}
              </span>

              <span>
                {product.active !== false
                  ? 'Available'
                  : 'Unavailable'}
              </span>
            </div>

            <button
              className="btn btn-dark wide"
              disabled={product.active === false || Number(product.stock || 0) <= 0}
              onClick={() => {
                addToCart(product);
                window.alert('Added to your bag.');
              }}
            >
              Add to bag
            </button>
          </div>
        </div>
      </section>
    </Layout>
  );
}

/* =========================================================
   AUTH
========================================================= */

function AuthPage({ mode = 'login' }) {
  const nav = useNavigate();

  const {
    login,
    register,
    loginWithGoogle,
    user,
    profile,
    loading,
  } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [imageFiles, setImageFiles] = useState([]);

  useEffect(() => {
    if (mode !== 'login') return;

    if (loading) return;

    if (!user) return;

    console.log('LOGIN REDIRECT CHECK');
    console.log('USER UID:', user.uid);
    console.log('USER EMAIL:', user.email);
    console.log('PROFILE:', profile);
    console.log('ROLE:', profile?.role);

    if (profile?.role === 'admin') {
      nav('/admin', { replace: true });
      return;
    }

    if (profile?.role === 'customer') {
      nav('/account', { replace: true });
      return;
    }

    setError(
      'Your account is authenticated, but no valid user role was found.'
    );
  }, [user, profile, loading, mode, nav]);

  async function googleLogin() {
    setBusy(true);
    setError('');
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(String(err?.message || 'Google sign-in failed.').replace(/^Firebase:\s*/i, ''));
    } finally {
      setBusy(false);
    }
  }

  async function submit(e) {
    e.preventDefault();

    setBusy(true);
    setError('');

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password);
        nav('/account', { replace: true });
      }
    } catch (err) {
      console.error(err);

      setError(
        String(err?.message || 'Authentication failed.')
          .replace(/^Firebase:\s*/i, '')
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Layout>
      <section className="auth-page">
        <div className="auth-image">
          <img
            src="/assets/from-friendship.jpg"
            alt="Knot and Cross"
          />

          <div>
            <p className="eyebrow">KNOT & CROSS</p>

            <h2>
              Come inside.
              <br />
              <i>Stay awhile.</i>
            </h2>
          </div>
        </div>

        <div className="auth-panel">
          <p className="eyebrow">
            {mode === 'login'
              ? 'WELCOME BACK'
              : 'JOIN THE COLLECTIVE'}
          </p>

          <h1>
            {mode === 'login'
              ? 'Sign in'
              : 'Create your account'}
          </h1>

          {mode === 'login' && (
            <>
              <button type="button" className="btn btn-google wide" onClick={googleLogin} disabled={busy}>
                <span className="google-mark">G</span>
                Continue with Google
              </button>
              <div className="auth-divider"><span>or continue with email</span></div>
            </>
          )}

          <form onSubmit={submit}>
            {mode === 'register' && (
              <label>
                Full name

                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </label>
            )}

            <label>
              Email

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <label>
              Password

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength="6"
                required
              />
            </label>

            {error && (
              <div className="form-error">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <button
              className="btn btn-dark wide"
              disabled={busy || (mode === 'login' && loading)}
            >
              {busy
                ? 'Please wait...'
                : mode === 'login'
                  ? 'Sign in'
                  : 'Create account'}
            </button>
          </form>

          {mode === 'login' && (
            <Link className="forgot-link" to="/forgot-password">Forgot password?</Link>
          )}

          <p className="switch-auth">
            {mode === 'login' ? (
              <>
                New here?{' '}
                <Link to="/register">
                  Create an account
                </Link>
              </>
            ) : (
              <>
                Already a member?{' '}
                <Link to="/login">
                  Sign in
                </Link>
              </>
            )}
          </p>
        </div>
      </section>
    </Layout>
  );
}

/* =========================================================
   CUSTOMER ACCOUNT
========================================================= */

function Account() {
  const { user, profile, logout, updateCustomerProfile } = useAuth();
  const [tab,setTab]=useState('overview'); const [orders,setOrders]=useState([]); const [products,setProducts]=useState([]);
  const [form,setForm]=useState({name:profile?.name||user?.displayName||'',phone:profile?.phone||''}); const [saving,setSaving]=useState(false); const [message,setMessage]=useState('');
  useEffect(()=>{ if(!user)return; setForm({name:profile?.name||user.displayName||'',phone:profile?.phone||''}); const a=onSnapshot(query(collection(db,'orders'),where('userId','==',user.uid)),snap=>setOrders(snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0))),()=>setOrders([])); const b=onSnapshot(collection(db,'products'),snap=>setProducts(snap.docs.map(d=>({id:d.id,...d.data()})).filter(p=>p.active!==false))); return ()=>{a();b();}; },[user,profile]);
  if(!user)return <Navigate to="/login" replace/>;
  async function saveProfile(e){e.preventDefault();setSaving(true);setMessage('');try{await updateCustomerProfile(form);setMessage('Your account details have been updated.')}catch(err){setMessage(err.message)}finally{setSaving(false)}}
  const sale=products.filter(p=>(p.type||'sale')==='sale').slice(0,4), rental=products.filter(p=>p.type==='rental').slice(0,4);
  return <Layout><section className="shell account-dashboard account-new"><div className="account-hero"><div><p className="eyebrow">MEMBER SPACE</p><h1>Welcome{profile?.name?`, ${profile.name}`:''}.</h1><p className="muted">Your personal space for discovering, buying and renting from the collective.</p></div><button className="btn btn-outline" onClick={logout}><LogOut size={16}/> Sign out</button></div>
    <div className="account-layout"><aside className="account-sidebar"><button className={tab==='overview'?'active':''} onClick={()=>setTab('overview')}><UserRound size={17}/> Overview</button><button className={tab==='shop'?'active':''} onClick={()=>setTab('shop')}><ShoppingBag size={17}/> Discover</button><button className={tab==='rental'?'active':''} onClick={()=>setTab('rental')}><RefreshCw size={17}/> Rentals</button><button className={tab==='orders'?'active':''} onClick={()=>setTab('orders')}><ClipboardList size={17}/> Orders</button><button className={tab==='settings'?'active':''} onClick={()=>setTab('settings')}><Settings size={17}/> Settings</button></aside>
    <div className="account-main">
      {tab==='overview' && <><div className="account-welcome-grid"><div className="account-panel account-profile-card"><p className="eyebrow">YOUR PROFILE</p><div className="profile-summary"><div className="profile-avatar">{(profile?.name||user.email||'K').charAt(0).toUpperCase()}</div><div><strong>{profile?.name||user.displayName||'Knot & Cross customer'}</strong><span>{user.email}</span></div></div><button className="btn btn-dark" onClick={()=>setTab('settings')}>Manage account</button></div><div className="account-stat"><span>ORDERS</span><strong>{orders.length}</strong><small>Your purchase history</small></div><div className="account-stat account-stat-dark"><span>RENTALS</span><strong>{rental.length}</strong><small>Pieces currently available</small></div></div><AccountCollection title="Shop the latest" eyebrow="FOR SALE" products={sale} empty="Products published for sale will appear here." link="/shop" action="View shop"/><AccountCollection title="Dress differently" eyebrow="FOR RENTAL" products={rental} empty="Rental pieces published by the admin will appear here." link="/rental" action="Explore rental"/></>}
      {tab==='shop' && <AccountCollection title="Discover the collection" eyebrow="FOR SALE" products={sale} empty="No sale pieces are published yet." link="/shop" action="Browse all" full/>}
      {tab==='rental' && <AccountCollection title="Rental wardrobe" eyebrow="BORROW THE LOOK" products={rental} empty="No rental pieces are available yet." link="/rental" action="Rental enquiry" full/>}
      {tab==='orders' && <div className="account-panel"><p className="eyebrow">PURCHASE HISTORY</p><h2>Your orders</h2>{orders.length?<div className="order-list">{orders.map(o=><div className="order-row" key={o.id}><div><strong>#{o.id.slice(0,8).toUpperCase()}</strong><span>{dateValue(o.createdAt)}</span></div><span className="status-badge status-pending">{o.status||o.orderStatus||'pending'}</span></div>)}</div>:<div className="account-empty"><ShoppingBag/><h3>Your first piece is waiting.</h3><p>Complete a purchase and your order history will appear here.</p><Link className="btn btn-dark" to="/shop">Explore the shop</Link></div>}</div>}
      {tab==='settings' && <div className="account-panel"><p className="eyebrow">PERSONAL DETAILS</p><h2>Settings</h2>{message&&<div className="success-message">{message}</div>}<form onSubmit={saveProfile} className="settings-form"><label>Full name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></label><label>Email<input value={user.email||''} disabled/></label><label>Phone number<input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="Optional"/></label><button className="btn btn-dark" disabled={saving}><Save size={16}/>{saving?'Saving...':'Save changes'}</button></form><div className="settings-action"><div><strong>Password</strong><p>Send a secure password reset email to your account.</p></div><Link className="btn btn-outline" to="/forgot-password">Reset password</Link></div></div>}
    </div></div></section></Layout>
}

function AccountCollection({title,eyebrow,products,empty,link,action,full}) { return <section className={`account-collection ${full?'account-collection-full':''}`}><div className="account-section-head"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div><Link className="text-link" to={link}>{action} →</Link></div>{products.length?<div className="account-product-grid">{products.map(p=><Link className="account-product" to={`/product/${p.slug||p.id}`} key={p.id}><div><img src={getImage(p)} alt={p.name}/><span>{p.type==='rental'?'RENTAL':'FOR SALE'}</span></div><strong>{p.name}</strong><small>{p.type==='rental'?'Rental enquiry':money(p.price)}</small></Link>)}</div>:<div className="account-empty compact"><Package/><p>{empty}</p><Link className="btn btn-light" to={link}>{action}</Link></div>}</section> }

function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault(); setBusy(true); setError(''); setMessage('');
    try {
      await resetPassword(email);
      setMessage('If an account exists for that email, a password reset message has been sent.');
    } catch (err) {
      setError(String(err?.message || 'Unable to send reset email.').replace(/^Firebase:\s*/i, ''));
    } finally { setBusy(false); }
  }

  return (
    <Layout>
      <section className="auth-page">
        <div className="auth-image"><img src="/assets/from-friendship.jpg" alt="Knot & Cross Collective"/><div><p className="eyebrow">ACCOUNT SECURITY</p><h2>Find your way<br/><i>back in.</i></h2></div></div>
        <div className="auth-panel">
          <p className="eyebrow">PASSWORD RESET</p><h1>Forgot password?</h1>
          <p className="muted">Enter your email and we’ll send a secure password reset link.</p>
          <form onSubmit={submit}>
            <label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label>
            {error && <div className="form-error">{error}</div>}
            {message && <div className="success-message">{message}</div>}
            <button className="btn btn-dark wide" disabled={busy}>{busy ? 'Sending...' : 'Send reset link'}</button>
          </form>
          <Link className="forgot-link" to="/login">Back to sign in</Link>
        </div>
      </section>
    </Layout>
  );
}


/* =========================================================
   SIMPLE PUBLIC PAGES
========================================================= */

function About() {
  return <Layout>
    <section className="about-hero"><img src="/assets/two-paths.jpg" alt="The founders' journey"/><div className="shell"><p className="eyebrow">OUR STORY · OCEAN VIEW</p><h1>Paths crossed.<br/><i>Purpose found.</i></h1></div></section>
    <section className="shell about-copy"><p className="eyebrow">KNOT & CROSS COLLECTIVE</p><h2>A lifelong dream, built together.</h2><p>Our story began many years ago when our paths first crossed as young dreamers with a shared passion for fashion and design. Life took us on different journeys, and four years ago those paths crossed again.</p><p>We spent three years working full-time while studying fashion design part-time. Today, as graduates and independent women, we are building a business rooted in resilience, professional expertise and technical design — one that makes beautiful garments while creating pathways for people to grow.</p><p>The knot and the cross are our reminder that strength is created through connection: between people, skills, generations, designers and opportunity.</p>
      <div className="vision-grid"><div><p className="eyebrow">OUR VISION</p><h3>To build a thriving, self-sustaining fashion hub in the South Peninsula.</h3><p>We want to bridge premium garment manufacturing and community empowerment while giving designers of all generations a voice and platform.</p></div><div><p className="eyebrow">OUR MISSION</p><h3>Exceptional CMT and design services with meaningful local impact.</h3><p>We aim to help local women develop sewing and pattern-making skills that can become sustainable trade opportunities.</p></div></div>
      <div className="contact-strip"><p className="eyebrow">VISIT BY APPOINTMENT</p><strong>Ocean View, Cape Town, South Africa</strong><a href="mailto:design@knotandcross.co.za">design@knotandcross.co.za</a></div>
    </section>
  </Layout>;
}

function Designers() {
  const [designers, setDesigners] = useState([]);

  useEffect(() => {
    return onSnapshot(collection(db, 'designers'), (snapshot) => {
      setDesigners(
        snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }))
      );
    });
  }, []);

  return (
    <Layout>
      <section className="shell page-section">
        <p className="eyebrow">THE PEOPLE</p>
        <h1>Designers</h1>

        <div className="designer-grid">
          {designers
            .filter((designer) => designer.active !== false)
            .map((designer) => (
              <div className="designer-card" key={designer.id}>
                <img
                  src={getImage(designer)}
                  alt={designer.name}
                />

                <h3>{designer.name}</h3>

                <p>
                  {designer.bio ||
                    designer.description ||
                    'Independent designer.'}
                </p>
              </div>
            ))}
        </div>
      </section>
    </Layout>
  );
}

function Services() {
  return (
    <Layout>
      <section className="shell page-section">
        <p className="eyebrow">SERVICES</p>

        <h1>Creative production.</h1>

        <div className="service-grid">
          <Link to="/consultation">
            <MessageSquare />
            <h3>Consultation</h3>
            <p>Talk to the collective about your project.</p>
          </Link>

          <Link to="/cmt">
            <Factory />
            <h3>CMT</h3>
            <p>Cut, make and trim production enquiries.</p>
          </Link>

          <Link to="/rental">
            <Layers />
            <h3>Rental</h3>
            <p>Ask about creative and production rentals.</p>
          </Link>
        </div>
      </section>
    </Layout>
  );
}

function Enquiry({ type }) {
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const collectionName =
    type === 'consultation'
      ? 'consultationRequests'
      : type === 'cmt'
        ? 'cmtEnquiries'
        : 'rentalEnquiries';

  async function submit(e) {
    e.preventDefault();

    if (!user) {
      setError('Please sign in before submitting an enquiry.');
      return;
    }

    setBusy(true);
    setError('');
    setSuccess(false);

    try {
      await addDoc(collection(db, collectionName), {
        userId: user.uid,
        name,
        email,
        message,
        type,
        status: 'new',
        createdAt: serverTimestamp(),
      });

      setSuccess(true);
      setMessage('');
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Layout>
      <section className="shell page-section narrow">
        <p className="eyebrow">{type.toUpperCase()}</p>

        <h1>
          {type === 'consultation'
            ? 'Start a conversation.'
            : type === 'cmt'
              ? 'CMT enquiry.'
              : 'Rental enquiry.'}
        </h1>

        {!user && (
          <div className="form-error">
            Please <Link to="/login">sign in</Link> first.
          </div>
        )}

        {success && (
          <div className="success-message">
            <CheckCircle size={18} />
            Your enquiry has been submitted.
          </div>
        )}

        {error && (
          <div className="form-error">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={submit} className="form-card">
          <label>
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>

          <label>
            Email
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onChangeCapture={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </label>

          <label>
            Message
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="7"
              required
            />
          </label>

          <button
            className="btn btn-dark"
            disabled={busy || !user}
          >
            {busy ? 'Sending...' : 'Submit enquiry'}
          </button>
        </form>
      </section>
    </Layout>
  );
}

/* =========================================================
   ADMIN GUARD
========================================================= */

function AdminGuard() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="admin-loading">
        <RefreshCw className="spin" />
        <p>Checking administrator access...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (profile?.role !== 'admin') {
    return (
      <Layout>
        <section className="empty page-empty">
          <Ban size={40} />

          <h2>Admin access required</h2>

          <p>
            Your account does not have administrator privileges.
          </p>

          <Link to="/account" className="btn btn-dark">
            Return to account
          </Link>
        </section>
      </Layout>
    );
  }

  return <Admin />;
}

/* =========================================================
   ADMIN DASHBOARD
========================================================= */

function Admin() {
  const { logout } = useAuth();

  const [section, setSection] = useState('dashboard');

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [designers, setDesigners] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [cmtEnquiries, setCmtEnquiries] = useState([]);
  const [rentalEnquiries, setRentalEnquiries] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeCount = 0;

    const subscribe = (collectionName, setter) => {
      return onSnapshot(
        collection(db, collectionName),
        (snapshot) => {
          setter(
            snapshot.docs.map((item) => ({
              id: item.id,
              ...item.data(),
            }))
          );

          unsubscribeCount++;

          if (unsubscribeCount >= 8) {
            setLoading(false);
          }
        },
        (error) => {
          console.error(
            `Failed loading ${collectionName}:`,
            error
          );

          unsubscribeCount++;

          if (unsubscribeCount >= 8) {
            setLoading(false);
          }
        }
      );
    };

    const unsubscribers = [
      subscribe('products', setProducts),
      subscribe('categories', setCategories),
      subscribe('designers', setDesigners),
      subscribe('orders', setOrders),
      subscribe('users', setUsers),
      subscribe(
        'consultationRequests',
        setConsultations
      ),
      subscribe('cmtEnquiries', setCmtEnquiries),
      subscribe(
        'rentalEnquiries',
        setRentalEnquiries
      ),
    ];

    return () => {
      unsubscribers.forEach((unsubscribe) => {
        try {
          unsubscribe();
        } catch {}
      });
    };
  }, []);

  const stats = {
    products: products.length,
    activeProducts: products.filter(
      (item) => item.active !== false
    ).length,

    categories: categories.length,

    designers: designers.filter(
      (item) => item.active !== false
    ).length,

    orders: orders.length,

    pendingOrders: orders.filter(
      (item) =>
        item.status === 'pending' ||
        item.orderStatus === 'pending'
    ).length,

    users: users.length,

    enquiries:
      consultations.length +
      cmtEnquiries.length +
      rentalEnquiries.length,
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <RefreshCw className="spin" size={28} />
        <p>Loading store management...</p>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <strong>KNOT & CROSS</strong>
          <span>CONTROL ROOM</span>
        </div>

        <nav>
          <AdminNavButton
            active={section === 'dashboard'}
            onClick={() => setSection('dashboard')}
            icon={<LayoutDashboard size={18} />}
          >
            Dashboard
          </AdminNavButton>

          <AdminNavButton
            active={section === 'products'}
            onClick={() => setSection('products')}
            icon={<Package size={18} />}
          >
            Products
            <small>{stats.products}</small>
          </AdminNavButton>

          <AdminNavButton
            active={section === 'categories'}
            onClick={() => setSection('categories')}
            icon={<Tags size={18} />}
          >
            Categories
          </AdminNavButton>

          <AdminNavButton
            active={section === 'designers'}
            onClick={() => setSection('designers')}
            icon={<Users size={18} />}
          >
            Designers
          </AdminNavButton>

          <AdminNavButton
            active={section === 'orders'}
            onClick={() => setSection('orders')}
            icon={<ShoppingBag size={18} />}
          >
            Orders
            <small>{stats.orders}</small>
          </AdminNavButton>

          <AdminNavButton
            active={section === 'customers'}
            onClick={() => setSection('customers')}
            icon={<UserRoundCog size={18} />}
          >
            Customers
          </AdminNavButton>

          <AdminNavButton
            active={section === 'enquiries'}
            onClick={() => setSection('enquiries')}
            icon={<ClipboardList size={18} />}
          >
            Enquiries
            <small>{stats.enquiries}</small>
          </AdminNavButton>

          <AdminNavButton
            active={section === 'settings'}
            onClick={() => setSection('settings')}
            icon={<Settings size={18} />}
          >
            Settings
          </AdminNavButton>
        </nav>

        <div className="admin-sidebar-bottom">
          <Link to="/" className="admin-back-store">
            <ExternalLink size={16} />
            View store
          </Link>

          <button
            className="admin-logout"
            onClick={logout}
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-mobile-header">
          <strong>KNOT & CROSS</strong>

          <Link to="/">
            <ExternalLink size={17} />
          </Link>
        </div>

        {section === 'dashboard' && (
          <AdminDashboard
            stats={stats}
            products={products}
            orders={orders}
          />
        )}

        {section === 'products' && (
          <ProductsManager
            products={products}
            categories={categories}
          />
        )}

        {section === 'categories' && (
          <CategoriesManager
            categories={categories}
          />
        )}

        {section === 'designers' && (
          <DesignersManager
            designers={designers}
          />
        )}

        {section === 'orders' && (
          <OrdersManager orders={orders} />
        )}

        {section === 'customers' && (
          <CustomersManager users={users} />
        )}

        {section === 'enquiries' && (
          <EnquiriesManager
            consultations={consultations}
            cmtEnquiries={cmtEnquiries}
            rentalEnquiries={rentalEnquiries}
          />
        )}

        {section === 'settings' && <AdminSettings />}
      </main>
    </div>
  );
}

function AdminSettings() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    businessName: 'Knot & Cross Collective',
    secondaryName: 'OV Fashion Lab',
    email: 'design@knotandcross.co.za',
    location: 'Ocean View, Cape Town, South Africa',
    workspace: 'Appointment-only workspace in Ocean View, Cape Town',
    currency: 'ZAR',
    showPublicPrices: false,
    contactMessage: 'Crafted with intention. Connected by purpose.',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    return onSnapshot(doc(db, 'storeSettings', 'main'), (snap) => {
      if (snap.exists()) setForm(current => ({ ...current, ...snap.data() }));
    });
  }, []);

  async function save(e) {
    e.preventDefault();
    setSaving(true); setSaved(false);
    try {
      await setDoc(doc(db, 'storeSettings', 'main'), {
        ...form,
        updatedBy: user.uid,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      setSaved(true);
    } catch (err) {
      alert(err.message);
    } finally { setSaving(false); }
  }

  function field(name, value) { setForm(current => ({ ...current, [name]: value })); }

  return (
    <>
      <AdminHeader eyebrow="CONTROL ROOM" title="Store settings" description="Manage business identity, contact details and storefront preferences." />
      <form className="settings-card admin-settings-card" onSubmit={save}>
        <div className="settings-section">
          <p className="eyebrow">BUSINESS IDENTITY</p>
          <h2>Brand details</h2>
          <div className="form-grid">
            <label>Primary brand<input value={form.businessName} onChange={e=>field('businessName',e.target.value)} required/></label>
            <label>Associated name<input value={form.secondaryName} onChange={e=>field('secondaryName',e.target.value)}/></label>
            <label>Email<input type="email" value={form.email} onChange={e=>field('email',e.target.value)} required/></label>
            <label>Currency<select value={form.currency} onChange={e=>field('currency',e.target.value)}><option value="ZAR">ZAR — South African Rand</option><option value="USD">USD — US Dollar</option><option value="GBP">GBP — Pound</option><option value="EUR">EUR — Euro</option></select></label>
          </div>
        </div>
        <div className="settings-section">
          <p className="eyebrow">LOCATION & CONTACT</p>
          <div className="form-grid">
            <label>Location<input value={form.location} onChange={e=>field('location',e.target.value)}/></label>
            <label>Workspace<input value={form.workspace} onChange={e=>field('workspace',e.target.value)}/></label>
          </div>
        </div>
        <div className="settings-section">
          <p className="eyebrow">BRAND MESSAGE</p>
          <label>Primary message<textarea rows="4" value={form.contactMessage} onChange={e=>field('contactMessage',e.target.value)}/></label>
        </div>
        <div className="modal-actions"><button className="btn btn-dark" disabled={saving}><Save size={16}/>{saving ? 'Saving...' : 'Save settings'}</button>{saved && <span className="save-confirm">Settings saved.</span>}</div>
      </form>
    </>
  );
}

/* =========================================================
   ADMIN NAV
========================================================= */

function AdminNavButton({
  active,
  onClick,
  icon,
  children,
}) {
  return (
    <button
      className={active ? 'admin-nav-button active' : 'admin-nav-button'}
      onClick={onClick}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}

/* =========================================================
   ADMIN DASHBOARD HOME
========================================================= */

function AdminDashboard({
  stats,
  products,
  orders,
}) {
  const recentProducts = products.slice(0, 5);
  const recentOrders = orders.slice(0, 5);

  return (
    <>
      <AdminHeader
        eyebrow="CONTROL ROOM"
        title="Store dashboard"
        description="Manage the Knot & Cross Collective store from one place."
      />

      <div className="admin-stat-grid">
        <StatCard
          icon={<Package />}
          label="Products"
          value={stats.products}
          detail={`${stats.activeProducts} active`}
        />

        <StatCard
          icon={<ShoppingBag />}
          label="Orders"
          value={stats.orders}
          detail={`${stats.pendingOrders} pending`}
        />

        <StatCard
          icon={<Users />}
          label="Customers"
          value={stats.users}
          detail="Registered users"
        />

        <StatCard
          icon={<ClipboardList />}
          label="Enquiries"
          value={stats.enquiries}
          detail="All enquiry types"
        />
      </div>

      <div className="admin-dashboard-grid">
        <div className="admin-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">CATALOGUE</p>
              <h2>Recent products</h2>
            </div>
          </div>

          <div className="admin-list">
            {recentProducts.map((product) => (
              <div className="admin-list-row" key={product.id}>
                <div className="list-image">
                  <img
                    src={getImage(product)}
                    alt={product.name}
                  />
                </div>

                <div className="list-content">
                  <strong>{product.name}</strong>
                  <span>{money(product.price)}</span>
                </div>

                <StatusBadge
                  status={
                    product.active === false
                      ? 'inactive'
                      : 'active'
                  }
                />
              </div>
            ))}

            {!recentProducts.length && (
              <EmptyAdmin
                icon={<Package />}
                text="No products have been added yet."
              />
            )}
          </div>
        </div>

        <div className="admin-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">SALES</p>
              <h2>Recent orders</h2>
            </div>
          </div>

          <div className="admin-list">
            {recentOrders.map((order) => (
              <div className="admin-list-row" key={order.id}>
                <div className="list-icon">
                  <ShoppingBag size={18} />
                </div>

                <div className="list-content">
                  <strong>
                    #{order.id.slice(0, 8)}
                  </strong>

                  <span>
                    {money(
                      order.total ||
                        order.amount ||
                        order.totalAmount
                    )}
                  </span>
                </div>

                <StatusBadge
                  status={
                    order.status ||
                    order.orderStatus ||
                    'pending'
                  }
                />
              </div>
            ))}

            {!recentOrders.length && (
              <EmptyAdmin
                icon={<ShoppingBag />}
                text="No orders yet."
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function StatCard({
  icon,
  label,
  value,
  detail,
}) {
  return (
    <div className="admin-stat-card">
      <div className="stat-icon">{icon}</div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </div>
  );
}

function AdminHeader({
  eyebrow,
  title,
  description,
  action,
}) {
  return (
    <div className="admin-page-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>

        {description && (
          <p className="admin-description">
            {description}
          </p>
        )}
      </div>

      {action}
    </div>
  );
}

function EmptyAdmin({ icon, text }) {
  return (
    <div className="admin-empty">
      {icon}
      <p>{text}</p>
    </div>
  );
}

/* =========================================================
   PRODUCT MANAGER
========================================================= */

function ProductsManager({
  products,
  categories,
}) {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const filtered = products.filter((product) => {
    return String(product.name || '')
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  function openCreate() {
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(product) {
    setEditing(product);
    setShowForm(true);
  }

  return (
    <>
      <AdminHeader
        eyebrow="CATALOGUE"
        title="Products"
        description="Create, edit, activate and manage store products."
        action={
          <button
            className="btn btn-dark"
            onClick={openCreate}
          >
            <Plus size={17} />
            Add product
          </button>
        }
      />

      <div className="admin-toolbar">
        <div className="admin-search">
          <Search size={17} />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
          />
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>

          <tbody>
            {filtered.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                onEdit={openEdit}
              />
            ))}
          </tbody>
        </table>

        {!filtered.length && (
          <EmptyAdmin
            icon={<Package />}
            text="No products found."
          />
        )}
      </div>

      {showForm && (
        <ProductForm
          product={editing}
          categories={categories}
          onClose={() => setShowForm(false)}
        />
      )}
    </>
  );
}

function ProductRow({
  product,
  onEdit,
}) {
  const [busy, setBusy] = useState(false);

  async function toggleStatus() {
    setBusy(true);

    try {
      await updateDoc(doc(db, 'products', product.id), {
        active: product.active === false,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    const confirmed = window.confirm(
      `Delete "${product.name}"? This cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await deleteDoc(
        doc(db, 'products', product.id)
      );
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  }

  return (
    <tr>
      <td>
        <div className="table-product">
          <img
            src={getImage(product)}
            alt={product.name}
          />

          <div>
            <strong>{product.name}</strong>
            <small>{product.slug}</small>
          </div>
        </div>
      </td>

      <td>
        {product.category || product.categoryId || '—'}
      </td>

      <td>{money(product.price)}</td>

      <td>{Number(product.stock || 0)}</td>

      <td>
        <StatusBadge
          status={
            product.active === false
              ? 'inactive'
              : 'active'
          }
        />
      </td>

      <td>
        <div className="table-actions">
          <button
            title="Edit"
            onClick={() => onEdit(product)}
          >
            <Pencil size={16} />
          </button>

          <button
            title={
              product.active === false
                ? 'Activate'
                : 'Deactivate'
            }
            disabled={busy}
            onClick={toggleStatus}
          >
            {product.active === false ? (
              <Eye size={16} />
            ) : (
              <EyeOff size={16} />
            )}
          </button>

          <button
            className="danger"
            title="Delete"
            onClick={remove}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}

/* =========================================================
   PRODUCT FORM
========================================================= */

function ProductForm({
  product,
  categories,
  onClose,
}) {
  const [form, setForm] = useState({
    name: product?.name || '',
    slug:
      product?.slug ||
      '',
    description: product?.description || '',
    price: product?.price ?? '',
    stock: product?.stock ?? '',
    category:
      product?.category ||
      product?.categoryId ||
      '',
    image:
      product?.image ||
      product?.imageUrl ||
      '',
    active: product?.active !== false,
    featured: product?.featured === true,
    type: product?.type || 'sale',
  });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function change(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function generateSlug() {
    change('slug', slugify(form.name));
  }

  async function save(e) {
    e.preventDefault();

    setBusy(true);
    setError('');

    try {
      const uploadedImages = [];
      for (const file of imageFiles) {
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '-');
        const storageRef = ref(storage, `products/${Date.now()}-${safeName}`);
        const snapshot = await uploadBytes(storageRef, file);
        uploadedImages.push(await getDownloadURL(snapshot.ref));
      }
      const existingImages = Array.isArray(product?.images) ? product.images : (product?.image ? [product.image] : []);
      const images = [...existingImages, ...uploadedImages].filter(Boolean);
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || slugify(form.name),
        description: form.description.trim(),
        price: Number(form.price || 0),
        stock: Number(form.stock || 0),
        category: form.category,
        image: images[0] || '',
        images,
        active: Boolean(form.active),
        featured: Boolean(form.featured),
        type: form.type || 'sale',
        updatedAt: serverTimestamp(),
      };

      if (product?.id) {
        await updateDoc(
          doc(db, 'products', product.id),
          payload
        );
      } else {
        await addDoc(collection(db, 'products'), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }

      onClose();
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      title={
        product
          ? 'Edit product'
          : 'Add product'
      }
      onClose={onClose}
    >
      <form onSubmit={save} className="admin-form">
        {error && (
          <div className="form-error">
            <AlertCircle size={17} />
            {error}
          </div>
        )}

        <div className="form-grid">
          <label>
            Product name
            <input
              value={form.name}
              onChange={(e) =>
                change('name', e.target.value)
              }
              required
            />
          </label>

          <label>
            Slug
            <div className="input-with-button">
              <input
                value={form.slug}
                onChange={(e) =>
                  change('slug', e.target.value)
                }
              />

              <button
                type="button"
                onClick={generateSlug}
              >
                Generate
              </button>
            </div>
          </label>
        </div>

        <label>
          Description
          <textarea
            rows="5"
            value={form.description}
            onChange={(e) =>
              change(
                'description',
                e.target.value
              )
            }
          />
        </label>

        <div className="form-grid">
          <label>
            Price (ZAR)
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) =>
                change('price', e.target.value)
              }
              required
            />
          </label>

          <label>
            Stock
            <input
              type="number"
              min="0"
              step="1"
              value={form.stock}
              onChange={(e) =>
                change('stock', e.target.value)
              }
              required
            />
          </label>
        </div>

        <label>
          Category
          <select
            value={form.category}
            onChange={(e) =>
              change('category', e.target.value)
            }
          >
            <option value="">Select category</option>

            {categories.map((category) => (
              <option
                value={category.id}
                key={category.id}
              >
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <div className="image-picker">
          <div>
            <p className="eyebrow">PRODUCT PHOTOS</p>
            <h3>Upload product images</h3>
            <p className="muted">Choose photos directly from your computer. No image URLs are required.</p>
          </div>
          <label className="upload-box">
            <Package size={22}/>
            <span>{imageFiles.length ? `${imageFiles.length} image${imageFiles.length === 1 ? '' : 's'} selected` : 'Choose product photos'}</span>
            <input type="file" accept="image/*" multiple onChange={e => setImageFiles(Array.from(e.target.files || []).slice(0, 8))}/>
          </label>
          {(form.image || imageFiles.length) && (
            <div className="image-preview-row">
              {form.image && <img src={form.image} alt="Current product" />}
              {imageFiles.map((file) => <img key={file.name + file.size} src={URL.createObjectURL(file)} alt={file.name} />)}
            </div>
          )}
        </div>

        <div className="form-grid">
          <label>Listing type<select value={form.type} onChange={e=>change('type',e.target.value)}><option value="sale">For sale</option><option value="rental">For rental</option></select></label>
          <label>Customer visibility<select value={form.active ? 'published':'draft'} onChange={e=>change('active',e.target.value==='published')}><option value="published">Published</option><option value="draft">Draft</option></select></label>
        </div>

        <div className="checkbox-grid">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) =>
                change(
                  'active',
                  e.target.checked
                )
              }
            />
            Active product
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) =>
                change(
                  'featured',
                  e.target.checked
                )
              }
            />
            Featured product
          </label>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-light"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="btn btn-dark"
            disabled={busy}
          >
            <Save size={17} />
            {busy ? 'Saving...' : 'Save product'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* =========================================================
   CATEGORY MANAGER
========================================================= */

function CategoriesManager({
  categories,
}) {
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  async function addCategory(e) {
    e.preventDefault();

    if (!name.trim()) return;

    setBusy(true);

    try {
      const id = slugify(name);

      await setDoc(doc(db, 'categories', id), {
        name: name.trim(),
        slug: id,
        active: true,
        createdAt: serverTimestamp(),
      });

      setName('');
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function toggle(category) {
    try {
      await updateDoc(
        doc(db, 'categories', category.id),
        {
          active: category.active === false,
          updatedAt: serverTimestamp(),
        }
      );
    } catch (error) {
      alert(error.message);
    }
  }

  async function remove(category) {
    if (
      !window.confirm(
        `Delete category "${category.name}"?`
      )
    ) {
      return;
    }

    try {
      await deleteDoc(
        doc(db, 'categories', category.id)
      );
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <>
      <AdminHeader
        eyebrow="CATALOGUE"
        title="Categories"
        description="Organise your products into store categories."
      />

      <div className="admin-panel">
        <form
          className="inline-create"
          onSubmit={addCategory}
        >
          <input
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            placeholder="New category name"
          />

          <button
            className="btn btn-dark"
            disabled={busy}
          >
            <Plus size={17} />
            Add category
          </button>
        </form>
      </div>

      <div className="category-admin-grid">
        {categories.map((category) => (
          <div
            className="category-admin-card"
            key={category.id}
          >
            <Tags size={20} />

            <div>
              <strong>{category.name}</strong>
              <small>{category.id}</small>
            </div>

            <StatusBadge
              status={
                category.active === false
                  ? 'inactive'
                  : 'active'
              }
            />

            <div className="table-actions">
              <button
                onClick={() =>
                  toggle(category)
                }
              >
                {category.active === false ? (
                  <Eye size={16} />
                ) : (
                  <EyeOff size={16} />
                )}
              </button>

              <button
                className="danger"
                onClick={() =>
                  remove(category)
                }
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        {!categories.length && (
          <EmptyAdmin
            icon={<Tags />}
            text="No categories created yet."
          />
        )}
      </div>
    </>
  );
}

/* =========================================================
   DESIGNER MANAGER
========================================================= */

function DesignersManager({
  designers,
}) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  return (
    <>
      <AdminHeader
        eyebrow="PEOPLE"
        title="Designers"
        description="Manage the designers and creative people represented by the collective."
        action={
          <button
            className="btn btn-dark"
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
          >
            <Plus size={17} />
            Add designer
          </button>
        }
      />

      <div className="designer-admin-grid">
        {designers.map((designer) => (
          <DesignerAdminCard
            key={designer.id}
            designer={designer}
            onEdit={() => {
              setEditing(designer);
              setShowForm(true);
            }}
          />
        ))}
      </div>

      {!designers.length && (
        <EmptyAdmin
          icon={<Users />}
          text="No designers added yet."
        />
      )}

      {showForm && (
        <DesignerForm
          designer={editing}
          onClose={() => setShowForm(false)}
        />
      )}
    </>
  );
}

function DesignerAdminCard({
  designer,
  onEdit,
}) {
  async function toggle() {
    try {
      await updateDoc(
        doc(db, 'designers', designer.id),
        {
          active: designer.active === false,
          updatedAt: serverTimestamp(),
        }
      );
    } catch (error) {
      alert(error.message);
    }
  }

  async function remove() {
    if (
      !window.confirm(
        `Delete designer "${designer.name}"?`
      )
    ) {
      return;
    }

    try {
      await deleteDoc(
        doc(db, 'designers', designer.id)
      );
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <div className="designer-admin-card">
      <img
        src={getImage(designer)}
        alt={designer.name}
      />

      <div className="designer-admin-content">
        <p className="eyebrow">
          {designer.active === false
            ? 'INACTIVE'
            : 'ACTIVE'}
        </p>

        <h3>{designer.name}</h3>

        <p>
          {designer.bio ||
            designer.description ||
            'No biography added.'}
        </p>

        <div className="table-actions">
          <button onClick={onEdit}>
            <Pencil size={16} />
          </button>

          <button onClick={toggle}>
            {designer.active === false ? (
              <Eye size={16} />
            ) : (
              <EyeOff size={16} />
            )}
          </button>

          <button
            className="danger"
            onClick={remove}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function DesignerForm({
  designer,
  onClose,
}) {
  const [form, setForm] = useState({
    name: designer?.name || '',
    bio: designer?.bio || '',
    image: designer?.image || '',
    active: designer?.active !== false,
  });

  const [busy, setBusy] = useState(false);

  async function save(e) {
    e.preventDefault();

    setBusy(true);

    try {
      const payload = {
        name: form.name.trim(),
        bio: form.bio.trim(),
        image: form.image.trim(),
        active: form.active,
        updatedAt: serverTimestamp(),
      };

      if (designer?.id) {
        await updateDoc(
          doc(db, 'designers', designer.id),
          payload
        );
      } else {
        await addDoc(
          collection(db, 'designers'),
          {
            ...payload,
            createdAt: serverTimestamp(),
          }
        );
      }

      onClose();
    } catch (error) {
      alert(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      title={
        designer
          ? 'Edit designer'
          : 'Add designer'
      }
      onClose={onClose}
    >
      <form onSubmit={save} className="admin-form">
        <label>
          Designer name

          <input
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
            required
          />
        </label>

        <label>
          Biography

          <textarea
            rows="6"
            value={form.bio}
            onChange={(e) =>
              setForm({
                ...form,
                bio: e.target.value,
              })
            }
          />
        </label>

        <label>
          Image URL

          <input
            value={form.image}
            onChange={(e) =>
              setForm({
                ...form,
                image: e.target.value,
              })
            }
          />
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) =>
              setForm({
                ...form,
                active: e.target.checked,
              })
            }
          />
          Active designer
        </label>

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-light"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="btn btn-dark"
            disabled={busy}
          >
            <Save size={17} />
            {busy ? 'Saving...' : 'Save designer'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* =========================================================
   ORDERS MANAGER
========================================================= */

function OrdersManager({
  orders,
}) {
  const [search, setSearch] = useState('');

  const filtered = orders.filter((order) => {
    const value = [
      order.id,
      order.userId,
      order.customerId,
      order.email,
      order.customerEmail,
      order.status,
      order.orderStatus,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return value.includes(search.toLowerCase());
  });

  return (
    <>
      <AdminHeader
        eyebrow="SALES"
        title="Orders"
        description="Review customer orders and update their status."
      />

      <div className="admin-toolbar">
        <div className="admin-search">
          <Search size={17} />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search orders..."
          />
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((order) => (
              <OrderRow
                key={order.id}
                order={order}
              />
            ))}
          </tbody>
        </table>

        {!filtered.length && (
          <EmptyAdmin
            icon={<ShoppingBag />}
            text="No orders found."
          />
        )}
      </div>
    </>
  );
}

function OrderRow({
  order,
}) {
  const [status, setStatus] = useState(
    order.status ||
      order.orderStatus ||
      'pending'
  );

  const [busy, setBusy] = useState(false);

  async function updateStatus(value) {
    setStatus(value);
    setBusy(true);

    try {
      await updateDoc(
        doc(db, 'orders', order.id),
        {
          status: value,
          orderStatus: value,
          updatedAt: serverTimestamp(),
        }
      );
    } catch (error) {
      console.error(error);
      alert(error.message);

      setStatus(
        order.status ||
          order.orderStatus ||
          'pending'
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <tr>
      <td>
        <strong>
          #{order.id.slice(0, 10)}
        </strong>
      </td>

      <td>
        <div>
          {order.email ||
            order.customerEmail ||
            order.userId ||
            'Unknown customer'}
        </div>
      </td>

      <td>
        {money(
          order.total ||
            order.amount ||
            order.totalAmount
        )}
      </td>

      <td>
        <StatusBadge
          status={
            order.paymentStatus ||
            order.payment ||
            'unpaid'
          }
        />
      </td>

      <td>
        <select
          value={status}
          disabled={busy}
          onChange={(e) =>
            updateStatus(e.target.value)
          }
          className="status-select"
        >
          <option value="pending">
            Pending
          </option>

          <option value="confirmed">
            Confirmed
          </option>

          <option value="processing">
            Processing
          </option>

          <option value="shipped">
            Shipped
          </option>

          <option value="completed">
            Completed
          </option>

          <option value="cancelled">
            Cancelled
          </option>
        </select>
      </td>

      <td>{dateValue(order.createdAt)}</td>
    </tr>
  );
}

/* =========================================================
   CUSTOMERS MANAGER
========================================================= */

function CustomersManager({
  users,
}) {
  const [search, setSearch] = useState('');

  const filtered = users.filter((user) => {
    return [
      user.name,
      user.email,
      user.uid,
      user.role,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  return (
    <>
      <AdminHeader
        eyebrow="CUSTOMERS"
        title="Customers"
        description="View registered users and their account roles."
      />

      <div className="admin-toolbar">
        <div className="admin-search">
          <Search size={17} />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search customers..."
          />
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>UID</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((user) => (
              <tr key={user.id}>
                <td>
                  <strong>
                    {user.name || 'Unnamed user'}
                  </strong>
                </td>

                <td>{user.email || '—'}</td>

                <td>
                  <StatusBadge
                    status={
                      user.role || 'customer'
                    }
                  />
                </td>

                <td>
                  {dateValue(user.createdAt)}
                </td>

                <td>
                  <code>
                    {user.uid || user.id}
                  </code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!filtered.length && (
          <EmptyAdmin
            icon={<Users />}
            text="No customers found."
          />
        )}
      </div>
    </>
  );
}

/* =========================================================
   ENQUIRIES
========================================================= */

function EnquiriesManager({
  consultations,
  cmtEnquiries,
  rentalEnquiries,
}) {
  const [tab, setTab] = useState('consultation');

  const data =
    tab === 'consultation'
      ? consultations
      : tab === 'cmt'
        ? cmtEnquiries
        : rentalEnquiries;

  return (
    <>
      <AdminHeader
        eyebrow="PRODUCTION"
        title="Enquiries"
        description="Manage consultation, CMT and rental enquiries."
      />

      <div className="admin-tabs">
        <button
          className={
            tab === 'consultation'
              ? 'active'
              : ''
          }
          onClick={() =>
            setTab('consultation')
          }
        >
          Consultation
          <span>{consultations.length}</span>
        </button>

        <button
          className={
            tab === 'cmt' ? 'active' : ''
          }
          onClick={() => setTab('cmt')}
        >
          CMT
          <span>{cmtEnquiries.length}</span>
        </button>

        <button
          className={
            tab === 'rental'
              ? 'active'
              : ''
          }
          onClick={() =>
            setTab('rental')
          }
        >
          Rental
          <span>{rentalEnquiries.length}</span>
        </button>
      </div>

      <div className="enquiry-grid">
        {data.map((item) => (
          <EnquiryCard
            key={item.id}
            item={item}
          />
        ))}

        {!data.length && (
          <EmptyAdmin
            icon={<ClipboardList />}
            text="No enquiries found."
          />
        )}
      </div>
    </>
  );
}

function EnquiryCard({
  item,
}) {
  const [status, setStatus] = useState(
    item.status || 'new'
  );

  async function updateStatus(value) {
    setStatus(value);

    let collectionName;

    if (item.type === 'consultation') {
      collectionName = 'consultationRequests';
    } else if (item.type === 'cmt') {
      collectionName = 'cmtEnquiries';
    } else if (item.type === 'rental') {
      collectionName = 'rentalEnquiries';
    } else {
      collectionName = 'consultationRequests';
    }

    try {
      await updateDoc(
        doc(db, collectionName, item.id),
        {
          status: value,
          updatedAt: serverTimestamp(),
        }
      );
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <div className="enquiry-card">
      <div className="enquiry-card-top">
        <div>
          <p className="eyebrow">
            {(item.type || 'enquiry').toUpperCase()}
          </p>

          <h3>
            {item.name || 'Unnamed customer'}
          </h3>

          <p>{item.email || 'No email'}</p>
        </div>

        <StatusBadge status={status} />
      </div>

      <p className="enquiry-message">
        {item.message || 'No message provided.'}
      </p>

      <div className="enquiry-footer">
        <span>
          {dateValue(item.createdAt)}
        </span>

        <select
          value={status}
          onChange={(e) =>
            updateStatus(e.target.value)
          }
        >
          <option value="new">New</option>
          <option value="reviewing">
            Reviewing
          </option>
          <option value="contacted">
            Contacted
          </option>
          <option value="completed">
            Completed
          </option>
          <option value="cancelled">
            Cancelled
          </option>
        </select>
      </div>
    </div>
  );
}

/* =========================================================
   STATUS
========================================================= */

function StatusBadge({
  status,
}) {
  const normalized = String(
    status || ''
  ).toLowerCase();

  let icon = <Clock size={13} />;

  if (
    [
      'active',
      'completed',
      'confirmed',
      'paid',
    ].includes(normalized)
  ) {
    icon = <CheckCircle size={13} />;
  }

  if (
    [
      'cancelled',
      'inactive',
      'unpaid',
      'failed',
    ].includes(normalized)
  ) {
    icon = <XCircle size={13} />;
  }

  if (
    ['shipped', 'processing'].includes(
      normalized
    )
  ) {
    icon = <Truck size={13} />;
  }

  return (
    <span
      className={`status-badge status-${normalized.replace(
        /\s+/g,
        '-'
      )}`}
    >
      {icon}
      {status || 'Unknown'}
    </span>
  );
}

/* =========================================================
   MODAL
========================================================= */

function Modal({
  title,
  onClose,
  children,
}) {
  return (
    <div className="modal-backdrop">
      <div className="admin-modal">
        <div className="modal-header">
          <div>
            <p className="eyebrow">MANAGEMENT</p>
            <h2>{title}</h2>
          </div>

          <button
            className="modal-close"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

/* =========================================================
   CART
========================================================= */

function Cart() {
  const [items, setItems] = useState(readCart());
  useEffect(() => {
    const sync = () => setItems(readCart());
    window.addEventListener('kcc-cart-updated', sync);
    return () => window.removeEventListener('kcc-cart-updated', sync);
  }, []);
  function change(id, delta) {
    const next = readCart().map(item => item.id === id ? {...item, quantity: Math.max(0, item.quantity + delta)} : item).filter(item => item.quantity > 0);
    writeCart(next); setItems(next);
  }
  function remove(id) { const next = readCart().filter(item => item.id !== id); writeCart(next); setItems(next); }
  return <Layout><section className="shell page-section">
    <p className="eyebrow">YOUR BAG</p><h1>Your collection bag</h1>
    {!items.length ? <div className="empty page-empty"><ShoppingBag/><h2>Your bag is empty</h2><p>Products added by the collective will appear here.</p><Link to="/shop" className="btn btn-dark">Explore the collection</Link></div> :
      <div className="cart-layout">
        <div>{items.map(item => <div className="cart-row" key={item.id}><img src={item.image || '/assets/brand-mark.jpg'} alt={item.name}/><div className="cart-row-main"><div><h3>{item.name}</h3><small>Price is confirmed during checkout.</small><button className="remove" onClick={()=>remove(item.id)}>Remove</button></div><div className="qty"><button onClick={()=>change(item.id,-1)}>-</button><span>{item.quantity}</span><button onClick={()=>change(item.id,1)}>+</button></div></div></div>)}</div>
        <aside className="summary"><p className="eyebrow">ORDER</p><div><span>Items</span><strong>{items.reduce((n,i)=>n+i.quantity,0)}</strong></div><hr/><div className="total"><span>Total</span><strong>{new Intl.NumberFormat('en-ZA',{style:'currency',currency:'ZAR'}).format(cartTotal(items))}</strong></div><Link to="/checkout" className="btn btn-dark wide">Continue to checkout</Link></aside>
      </div>}
  </section></Layout>;
}


/* =========================================================
   CHECKOUT
========================================================= */

function Checkout() {
  const { user } = useAuth();
  const [items, setItems] = useState(readCart());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [details, setDetails] = useState({ name: '', phone: '', address: '' });
  if (!user) return <Navigate to="/login" replace />;
  async function placeOrder(e) {
    e.preventDefault(); setBusy(true); setError('');
    try {
      const total = cartTotal(items);
      if (!items.length || total <= 0) throw new Error('Your bag is empty.');
      const orderRef = await addDoc(collection(db, 'orders'), {
        userId: user.uid, customerId: user.uid, email: user.email,
        customerName: details.name || user.displayName || '',
        phone: details.phone, shippingAddress: details.address,
        items: items.map(({id,name,price,quantity,image}) => ({id,name,price,quantity,image})),
        total, currency: 'ZAR', paymentStatus: 'unpaid', orderStatus: 'pending', status: 'pending',
        createdAt: serverTimestamp()
      });
      const checkout = httpsCallable(functions, 'createPaystackCheckout');
      const result = await checkout({ orderId: orderRef.id, email: user.email, amount: total });
      localStorage.removeItem(CART_KEY); window.location.href = result.data.authorizationUrl;
    } catch (err) { console.error(err); setError(err.message || 'Unable to start checkout.'); }
    finally { setBusy(false); }
  }
  return <Layout><section className="shell page-section narrow"><p className="eyebrow">SECURE CHECKOUT</p><h1>Complete your order.</h1>
    {!items.length ? <div className="empty page-empty"><ShoppingBag/><p>Your bag is empty.</p><Link to="/shop" className="btn btn-dark">Back to shop</Link></div> :
    <div className="checkout">
      <form className="checkout-form" onSubmit={placeOrder}>
        <div className="checkout-block"><h3>Delivery details</h3>
          <label>Full name<input value={details.name} onChange={e=>setDetails({...details,name:e.target.value})} required/></label>
          <label>Phone<input value={details.phone} onChange={e=>setDetails({...details,phone:e.target.value})} required/></label>
          <label>Delivery address<textarea rows="5" value={details.address} onChange={e=>setDetails({...details,address:e.target.value})} required/></label>
        </div>
        {error && <div className="form-error">{error}</div>}
        <button className="btn btn-dark" disabled={busy}>{busy ? 'Connecting to secure payment...' : 'Continue to secure payment'}</button>
      </form>
      <aside className="summary"><p className="eyebrow">SUMMARY</p>{items.map(i=><div key={i.id}><span>{i.name} × {i.quantity}</span><strong>{new Intl.NumberFormat('en-ZA',{style:'currency',currency:'ZAR'}).format(i.price*i.quantity)}</strong></div>)}<hr/><div className="total"><span>Total</span><strong>{new Intl.NumberFormat('en-ZA',{style:'currency',currency:'ZAR'}).format(cartTotal(items))}</strong></div><small className="secure">Payments are processed by Paystack. Card details are never stored by Knot & Cross Collective.</small></aside>
    </div>}
  </section></Layout>;
}


/* =========================================================
   APP
========================================================= */

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/shop"
        element={<Shop />}
      />

      <Route
        path="/product/:slug"
        element={<Product />}
      />

      <Route
        path="/cart"
        element={<Cart />}
      />

      <Route
        path="/checkout"
        element={<Checkout />}
      />

      <Route
        path="/login"
        element={<AuthPage mode="login" />}
      />

      <Route
        path="/register"
        element={<AuthPage mode="register" />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      <Route
        path="/account"
        element={<Account />}
      />

      <Route
        path="/services"
        element={<Services />}
      />

      <Route
        path="/designers"
        element={<Designers />}
      />

      <Route
        path="/about"
        element={<About />}
      />

      <Route
        path="/consultation"
        element={
          <Enquiry type="consultation" />
        }
      />

      <Route
        path="/cmt"
        element={<Enquiry type="cmt" />}
      />

      <Route
        path="/rental"
        element={<Enquiry type="rental" />}
      />

      <Route
        path="/admin"
        element={<AdminGuard />}
      />

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />
    </Routes>
  );
}