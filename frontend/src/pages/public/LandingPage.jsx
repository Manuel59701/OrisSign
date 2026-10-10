import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { formatCurrency } from '../../utils/helpers';
import { Shield, MapPin, Phone, Mail, Clock, Users, AmenityIcon, CheckCircle } from '../../components/Icons';
import './LandingPage.css';

const aboutSlides = [
  {
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&h=1080&fit=crop',
    eyebrow: 'Our Story',
    title: 'A Legacy of Luxury & Elegance',
    text: 'Oris Signatures stands as a beacon of refined hospitality, offering guests an experience that transcends ordinary accommodation. From the warmth of our lobby to the serenity of our suites, every detail reflects our commitment to excellence — meticulously designed rooms, world-class amenities and impeccable service that make every moment crafted to perfection.',
  },
  {
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&h=1080&fit=crop',
    eyebrow: 'Dining',
    title: 'Flavours Crafted to Delight',
    text: 'From sunrise breakfast buffets to candle-lit dinners, our kitchen serves a refined menu of continental classics and authentic Nigerian favourites — grilled seafood, slow-cooked stews, small chops, artisan pastries and signature chef\'s tasting plates. Pair it with curated wines, fresh-pressed juices or enjoy poolside grills and 24-hour in-room dining.',
  },
  {
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1920&h=1080&fit=crop',
    eyebrow: 'Wellness & Leisure',
    title: 'Unwind, Recharge, Repeat',
    text: 'Escape into our sun-drenched pool, soothe away the day with signature spa treatments and steam therapy, or keep your routine at our fully equipped fitness centre. Landscaped gardens, quiet lounges and a 24/7 concierge ensure relaxation never has to end.',
  },
  {
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1920&h=1080&fit=crop',
    eyebrow: 'Celebrations',
    title: 'Moments Worth Remembering',
    text: 'Four versatile event spaces set the stage for weddings, banquets, conferences and private celebrations. Our dedicated planners, state-of-the-art sound and lighting, and tailored catering packages take care of every detail — so you can be fully present for the moments that matter most.',
  },
];

const amenitySvgs = {
  pool: (
    <>
      <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
      <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
      <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
    </>
  ),
  dining: (
    <>
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Z" />
      <path d="M21 15v7" />
    </>
  ),
  spa: (
    <>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </>
  ),
  fitness: (
    <>
      <path d="m6.5 6.5 11 11" />
      <path d="m21 21-1-1" />
      <path d="m3 3 1 1" />
      <path d="m18 22 4-4" />
      <path d="m2 6 4-4" />
      <path d="m3 10 7-7" />
      <path d="m14 21 7-7" />
    </>
  ),
  parking: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
    </>
  ),
  wifi: (
    <>
      <path d="M5 12.55a11 11 0 0 1 14 0" />
      <path d="M8.5 16.03a6 6 0 0 1 7 0" />
      <path d="M12 20h.01" />
    </>
  ),
};

export default function LandingPage() {
  const [rooms, setRooms] = useState([]);
  const [eventSpaces, setEventSpaces] = useState([]);
  const [aboutIndex, setAboutIndex] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.getRooms().then(setRooms).catch(() => {});
    api.getEventSpaces().then(setEventSpaces).catch(() => {});

    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [rooms, eventSpaces]);

  // About section auto-advancing slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      setAboutIndex(i => (i + 1) % aboutSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [aboutIndex]);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactLoading(true);
    try {
      await api.sendContactMessage(contactForm);
      setContactSuccess(true);
      setContactForm({ name: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => setContactSuccess(false), 5000);
    } catch (err) {
      alert(err.error || 'Failed to send message');
    }
    setContactLoading(false);
  };

  const roomImages = [
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=400&fit=crop',
  ];

  const eventImages = [
    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=600&h=400&fit=crop',
  ];

  return (
    <div className="landing-page">
      {/* ========== HEADER ========== */}
      <header className={`header ${isScrolled ? 'header-scrolled' : ''}`}>
        <div className="container header-inner">
          <Link to="/" className="logo">
            <span className="logo-text">ORIS</span>
            <span className="logo-sub">SIGNATURES</span>
          </Link>

          <nav className={`nav ${mobileMenu ? 'nav-open' : ''}`}>
            <a href="#about" onClick={() => setMobileMenu(false)}>About</a>
            <a href="#rooms" onClick={() => setMobileMenu(false)}>Rooms</a>
            <a href="#events" onClick={() => setMobileMenu(false)}>Events</a>
            <a href="#gallery" onClick={() => setMobileMenu(false)}>Gallery</a>
            <a href="#contact" onClick={() => setMobileMenu(false)}>Contact</a>
            <Link to="/admin" className="nav-admin-link" onClick={() => setMobileMenu(false)}><Shield width="13" height="13" /> Admin Login</Link>
            <Link to="/book" className="btn btn-primary btn-sm" onClick={() => setMobileMenu(false)}>Book Now</Link>
          </nav>

          <button className="mobile-toggle" onClick={() => setMobileMenu(!mobileMenu)}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </header>

      {/* ========== HERO ========== */}
      <section className="hero">
        <video
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
          poster="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&h=1080&fit=crop"
        >
          <source src="https://videos.pexels.com/video-files/4185240/4185240-hd_1920_1080_25fps.mp4" type="video/mp4" />
        </video>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <p className="hero-tagline animate-fade-in-up">Welcome to</p>
          <h1 className="hero-title animate-fade-in-up animate-delay-1">Oris Signatures</h1>
          <p className="hero-subtitle animate-fade-in-up animate-delay-2">Where Luxury Meets Comfort</p>
          <div className="hero-divider animate-fade-in-up animate-delay-3"></div>
          <p className="hero-desc animate-fade-in-up animate-delay-3">
            Experience world-class hospitality in the heart of elegance. 
            Unforgettable stays, extraordinary events, timeless memories.
          </p>
          <div className="hero-actions animate-fade-in-up animate-delay-4">
            <Link to="/book" className="btn btn-outline btn-lg">Reserve a Room</Link>
            <a href="#rooms" className="btn btn-outline btn-lg">Explore</a>
          </div>
        </div>
      </section>

      {/* ========== DIVIDER ========== */}
      <div className="section-divider" aria-hidden="true">
        <span className="section-divider-line"></span>
        <span className="section-divider-gem"></span>
        <span className="section-divider-line"></span>
      </div>

      {/* ========== ABOUT ========== */}
      <section id="about" className="about-showcase">
        <div className="about-slides">
          {aboutSlides.map((slide, i) => (
            <div
              key={i}
              className={`about-slide${i === aboutIndex ? ' active' : ''}`}
              style={{ backgroundImage: `url('${slide.image}')` }}
            />
          ))}
          <div className="about-overlay"></div>
        </div>

        <div className="container about-inner">
          <div className="about-panel reveal visible">
            <p className="about-eyebrow">{aboutSlides[aboutIndex].eyebrow}</p>
            <h2 className="about-title" key={`t-${aboutIndex}`}>{aboutSlides[aboutIndex].title}</h2>
            <div className="about-divider"></div>
            <p className="about-text" key={`p-${aboutIndex}`}>{aboutSlides[aboutIndex].text}</p>

            <div className="about-stats">
              <div className="stat">
                <span className="stat-number">25+</span>
                <span className="stat-label">Luxury Rooms</span>
              </div>
              <div className="stat">
                <span className="stat-number">4</span>
                <span className="stat-label">Event Spaces</span>
              </div>
              <div className="stat">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Concierge</span>
              </div>
              <div className="stat">
                <span className="stat-number">5-Star</span>
                <span className="stat-label">Service</span>
              </div>
            </div>

            <div className="about-nav">
              {aboutSlides.map((slide, i) => (
                <button
                  key={i}
                  className={`about-nav-btn${i === aboutIndex ? ' active' : ''}`}
                  onClick={() => setAboutIndex(i)}
                  aria-label={`Show ${slide.eyebrow}`}
                >
                  <span className="about-nav-label">{slide.eyebrow}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========== AMENITIES BAR ========== */}
      <section className="amenities-bar section-dark">
        <div className="container">
          <div className="amenities-grid">
            {[
              { icon: 'pool', label: 'Swimming Pool' },
              { icon: 'dining', label: 'Fine Dining' },
              { icon: 'spa', label: 'Spa & Wellness' },
              { icon: 'fitness', label: 'Fitness Center' },
              { icon: 'parking', label: 'Valet Parking' },
              { icon: 'wifi', label: 'Free WiFi' },
            ].map((item, i) => (
              <div key={i} className="amenity-item reveal">
                <span className="amenity-icon" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    width="30"
                    height="30"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {amenitySvgs[item.icon]}
                  </svg>
                </span>
                <span className="amenity-label">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== ROOMS ========== */}
      <section id="rooms" className="section section-silver">
        <div className="container">
          <div className="section-header reveal">
            <p className="text-accent" style={{fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.85rem'}}>Accommodations</p>
            <h2>Our Rooms & Suites</h2>
            <div className="divider"></div>
            <p className="subtitle">Each room is a sanctuary of comfort, designed with refined taste and equipped with premium amenities.</p>
          </div>

          <div className="rooms-grid">
            {rooms.map((room, i) => (
              <div key={room.id} className="room-card reveal" style={{animationDelay: `${i * 0.1}s`}}>
                <div className="room-card-img">
                  <img src={room.image_url || roomImages[i % roomImages.length]} alt={room.name} />
                  <div className="room-card-price">
                    <span>{formatCurrency(room.price_per_night)}</span>
                    <small>/ night</small>
                  </div>
                  <div className="room-card-type">{room.room_type}</div>
                </div>
                <div className="room-card-body">
                  <h3>{room.name}</h3>
                  <p>{room.description}</p>
                  <div className="room-amenities">
                    {(room.amenities || []).slice(0, 5).map((amenity, j) => (
                      <span key={j} className="room-amenity" title={amenity}>
                        <AmenityIcon name={amenity} /> {amenity}
                      </span>
                    ))}
                  </div>
                  <div className="room-card-footer">
                    <span className="room-guests"><Users width="15" height="15" /> Up to {room.max_guests} guests</span>
                    <Link to="/book" className="btn btn-primary btn-sm">Book Now</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== EVENTS ========== */}
      <section id="events" className="section">
        <div className="container">
          <div className="section-header reveal">
            <p className="text-accent" style={{fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.85rem'}}>Celebrations & Gatherings</p>
            <h2>Event Spaces</h2>
            <div className="divider"></div>
            <p className="subtitle">From grand celebrations to intimate gatherings, our versatile event spaces set the perfect stage.</p>
          </div>

          <div className="events-grid">
            {eventSpaces.map((space, i) => (
              <div key={space.id} className="event-card reveal" style={{animationDelay: `${i * 0.1}s`}}>
                <div className="event-card-img">
                  <img src={space.image_url || eventImages[i % eventImages.length]} alt={space.name} />
                  <div className="event-card-overlay">
                    <Link to="/events/book" className="btn btn-outline">Book This Space</Link>
                  </div>
                </div>
                <div className="event-card-body">
                  <h3>{space.name}</h3>
                  <p>{space.description}</p>
                  <div className="event-card-details">
                    <span><Users width="15" height="15" /> Up to {space.capacity} guests</span>
                    <span className="event-price">{formatCurrency(space.price_per_day)} / day</span>
                  </div>
                  <div className="room-amenities">
                    {(space.amenities || []).slice(0, 4).map((amenity, j) => (
                      <span key={j} className="room-amenity" title={amenity}>
                        <AmenityIcon name={amenity} /> {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== GALLERY ========== */}
      <section id="gallery" className="section section-dark">
        <div className="container">
          <div className="section-header reveal">
            <p className="text-accent" style={{fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.85rem'}}>Visual Tour</p>
            <h2 style={{color: '#fff'}}>Gallery</h2>
            <div className="divider"></div>
          </div>

          <div className="gallery-grid reveal">
            {[
              'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop',
              'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop',
              'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&h=600&fit=crop',
              'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&h=400&fit=crop',
              'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&h=600&fit=crop',
              'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop',
              'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop',
              'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=400&fit=crop',
            ].map((url, i) => (
              <div key={i} className={`gallery-item gallery-item-${i + 1}`}>
                <img src={url} alt={`Gallery ${i + 1}`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CTA BANNER ========== */}
      <section className="cta-section">
        <div className="cta-overlay"></div>
        <div className="cta-content">
          <h2 className="reveal">Ready for an Extraordinary Experience?</h2>
          <p className="reveal">Book your stay today and discover the epitome of luxury hospitality.</p>
          <div className="cta-actions reveal">
            <Link to="/book" className="btn btn-outline btn-lg">Book a Room</Link>
            <Link to="/events/book" className="btn btn-accent btn-lg">Book an Event</Link>
          </div>
        </div>
      </section>

      {/* ========== CONTACT ========== */}
      <section id="contact" className="section">
        <div className="container">
          <div className="section-header reveal">
            <p className="text-accent" style={{fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.85rem'}}>Get In Touch</p>
            <h2>Contact Us</h2>
            <div className="divider"></div>
            <p className="subtitle">Have a question or need assistance? We'd love to hear from you.</p>
          </div>

          <div className="contact-grid">
            <div className="contact-info reveal">
              <div className="contact-item">
                <div className="contact-icon"><MapPin /></div>
                <div>
                  <h4>Location</h4>
                  <p>123 Luxury Avenue, Victoria Island, Lagos, Nigeria</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon"><Phone /></div>
                <div>
                  <h4>Phone</h4>
                  <p>+234 (0) 801 234 5678</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon"><Mail /></div>
                <div>
                  <h4>Email</h4>
                  <p>info@orissignatures.com</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon"><Clock /></div>
                <div>
                  <h4>Front Desk</h4>
                  <p>24 hours, 7 days a week</p>
                </div>
              </div>
            </div>

            <form className="contact-form reveal" onSubmit={handleContactSubmit}>
              {contactSuccess && (
                <div className="form-success"><CheckCircle width="16" height="16" /> Message sent successfully! We'll get back to you soon.</div>
              )}
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input type="text" className="form-control" required value={contactForm.name}
                    onChange={e => setContactForm({...contactForm, name: e.target.value})} placeholder="John Doe" />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" className="form-control" required value={contactForm.email}
                    onChange={e => setContactForm({...contactForm, email: e.target.value})} placeholder="john@example.com" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input type="tel" className="form-control" value={contactForm.phone}
                    onChange={e => setContactForm({...contactForm, phone: e.target.value})} placeholder="+234 801 234 5678" />
                </div>
                <div className="form-group">
                  <label>Subject</label>
                  <input type="text" className="form-control" value={contactForm.subject}
                    onChange={e => setContactForm({...contactForm, subject: e.target.value})} placeholder="Inquiry about..." />
                </div>
              </div>
              <div className="form-group">
                <label>Message *</label>
                <textarea className="form-control" required value={contactForm.message}
                  onChange={e => setContactForm({...contactForm, message: e.target.value})} placeholder="How can we help you?" rows="5"></textarea>
              </div>
              <button type="submit" className="btn btn-primary btn-lg" disabled={contactLoading} style={{width: '100%'}}>
                {contactLoading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="logo" style={{marginBottom: '1rem'}}>
                <span className="logo-text" style={{color: '#fff'}}>ORIS</span>
                <span className="logo-sub" style={{color: 'var(--color-silver)'}}>SIGNATURES</span>
              </div>
              <p>Where luxury meets comfort. Experience world-class hospitality in the heart of elegance.</p>
              <div className="footer-social">
                <a href="#" className="social-link">𝕏</a>
                <a href="#" className="social-link">IG</a>
                <a href="#" className="social-link">FB</a>
                <a href="#" className="social-link">IN</a>
              </div>
            </div>
            <div className="footer-links">
              <h4>Quick Links</h4>
              <a href="#about">About Us</a>
              <a href="#rooms">Rooms & Suites</a>
              <a href="#events">Events</a>
              <a href="#gallery">Gallery</a>
              <a href="#contact">Contact</a>
              <Link to="/admin">Admin Login</Link>
            </div>
            <div className="footer-links">
              <h4>Services</h4>
              <Link to="/book">Room Booking</Link>
              <Link to="/events/book">Event Booking</Link>
              <a href="#">Dining</a>
              <a href="#">Spa & Wellness</a>
              <a href="#">Airport Transfer</a>
            </div>
            <div className="footer-links">
              <h4>Contact</h4>
              <p>123 Luxury Avenue,<br/>Victoria Island, Lagos</p>
              <p>+234 (0) 801 234 5678</p>
              <p>info@orissignatures.com</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} Oris Signatures. All rights reserved.</p>
            <div className="footer-bottom-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
