import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { formatCurrency } from '../../utils/helpers';
import './LandingPage.css';

export default function LandingPage() {
  const [rooms, setRooms] = useState([]);
  const [eventSpaces, setEventSpaces] = useState([]);
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

  const amenityIcons = {
    'WiFi': '📶', 'Air Conditioning': '❄️', 'TV': '📺', 'Smart TV': '📺',
    'Mini Fridge': '🧊', 'Mini Bar': '🍸', 'Full Bar': '🍾', 'Balcony': '🌇',
    'Room Service': '🛎️', 'Jacuzzi': '🛁', 'Living Room': '🛋️', 'Dining Room': '🍽️',
    'Butler Service': '🤵', 'Private Terrace': '🏖️', 'Concierge': '💼',
    'Stage': '🎤', 'Sound System': '🔊', 'Projector': '📽️', 'Dance Floor': '💃',
    'Catering Kitchen': '👨‍🍳', 'Dressing Room': '👗', 'Video Conferencing': '📹',
    'Whiteboard': '📋', 'Breakout Rooms': '🚪', 'Outdoor Lighting': '💡',
    'BBQ Area': '🍖', 'Lounge Seating': '🪑', 'Rain Cover': '☂️',
    'Private Bar': '🥂', 'Mood Lighting': '🕯️', 'Premium Seating': '💺',
    'Dedicated Staff': '👨‍💼',
  };

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
            <a href="#rooms" onClick={() => setMobileMenu(false)}>Rooms</a>
            <a href="#events" onClick={() => setMobileMenu(false)}>Events</a>
            <a href="#gallery" onClick={() => setMobileMenu(false)}>Gallery</a>
            <a href="#about" onClick={() => setMobileMenu(false)}>About</a>
            <a href="#contact" onClick={() => setMobileMenu(false)}>Contact</a>
            <Link to="/book" className="btn btn-primary btn-sm" onClick={() => setMobileMenu(false)}>Book Now</Link>
          </nav>

          <button className="mobile-toggle" onClick={() => setMobileMenu(!mobileMenu)}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </header>

      {/* ========== HERO ========== */}
      <section className="hero">
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
            <a href="#rooms" className="btn btn-outline btn-lg" style={{borderColor: 'rgba(255,255,255,0.4)', color: 'rgba(255,255,255,0.9)'}}>Explore</a>
          </div>
        </div>
        <div className="hero-scroll">
          <a href="#about">
            <div className="scroll-indicator">
              <div className="scroll-dot"></div>
            </div>
          </a>
        </div>
      </section>

      {/* ========== ABOUT ========== */}
      <section id="about" className="section">
        <div className="container">
          <div className="about-grid">
            <div className="about-images reveal">
              <div className="about-img-main">
                <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=700&fit=crop" alt="Oris Signatures Hotel" />
              </div>
              <div className="about-img-secondary">
                <img src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop" alt="Lobby" />
              </div>
            </div>
            <div className="about-content reveal">
              <p className="text-accent" style={{fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.85rem'}}>Our Story</p>
              <h2>A Legacy of<br />Luxury & Elegance</h2>
              <div className="section-header">
                <div className="divider" style={{margin: '1rem 0'}}></div>
              </div>
              <p>
                Oris Signatures stands as a beacon of refined hospitality, offering guests 
                an experience that transcends ordinary accommodation. Our meticulously designed 
                rooms, world-class amenities, and impeccable service create an atmosphere where 
                every moment is crafted to perfection.
              </p>
              <p>
                From the warmth of our lobby to the serenity of our suites, every detail 
                reflects our commitment to excellence. Whether you're here for business, 
                leisure, or celebrating life's most important moments, we ensure your stay 
                is nothing short of extraordinary.
              </p>
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
                  <span className="stat-number">5★</span>
                  <span className="stat-label">Service</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== AMENITIES BAR ========== */}
      <section className="amenities-bar section-dark">
        <div className="container">
          <div className="amenities-grid">
            {[
              { icon: '🏊', label: 'Swimming Pool' },
              { icon: '🍽️', label: 'Fine Dining' },
              { icon: '💆', label: 'Spa & Wellness' },
              { icon: '🏋️', label: 'Fitness Center' },
              { icon: '🅿️', label: 'Valet Parking' },
              { icon: '📶', label: 'Free WiFi' },
            ].map((item, i) => (
              <div key={i} className="amenity-item reveal">
                <span className="amenity-icon">{item.icon}</span>
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
                        {amenityIcons[amenity] || '✨'} {amenity}
                      </span>
                    ))}
                  </div>
                  <div className="room-card-footer">
                    <span className="room-guests">👥 Up to {room.max_guests} guests</span>
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
                    <span>👥 Up to {space.capacity} guests</span>
                    <span className="event-price">{formatCurrency(space.price_per_day)} / day</span>
                  </div>
                  <div className="room-amenities">
                    {(space.amenities || []).slice(0, 4).map((amenity, j) => (
                      <span key={j} className="room-amenity" title={amenity}>
                        {amenityIcons[amenity] || '✨'} {amenity}
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
                <div className="contact-icon">📍</div>
                <div>
                  <h4>Location</h4>
                  <p>123 Luxury Avenue, Victoria Island, Lagos, Nigeria</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">📞</div>
                <div>
                  <h4>Phone</h4>
                  <p>+234 (0) 801 234 5678</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">✉️</div>
                <div>
                  <h4>Email</h4>
                  <p>info@orissignatures.com</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">🕐</div>
                <div>
                  <h4>Front Desk</h4>
                  <p>24 hours, 7 days a week</p>
                </div>
              </div>
            </div>

            <form className="contact-form reveal" onSubmit={handleContactSubmit}>
              {contactSuccess && (
                <div className="form-success">✅ Message sent successfully! We'll get back to you soon.</div>
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
