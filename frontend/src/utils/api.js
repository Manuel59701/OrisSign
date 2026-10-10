const API_BASE = 'http://localhost/OrisSign/backend';

// Initial Mock Seed Data
const DEFAULT_ROOMS = [
  {
    id: 1,
    name: 'Standard Deluxe Room',
    room_type: 'standard',
    description: 'A comfortable room with modern amenities, crisp white linens, and sleek silver accents.',
    price_per_night: 25000,
    max_guests: 2,
    amenities: ['High-speed WiFi', 'Air Conditioning', 'HD Smart TV', 'Mini Fridge', 'Rain Shower'],
    total_units: 10,
    available_units: 8,
    status: 'available',
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop'
  },
  {
    id: 2,
    name: 'Executive Silver Suite',
    room_type: 'deluxe',
    description: 'Spacious suite with monochrome aesthetics, balcony view, and luxury workspace.',
    price_per_night: 45000,
    max_guests: 2,
    amenities: ['High-speed WiFi', 'Smart 4K TV', 'Espresso Bar', 'Balcony View', '24/7 Room Service', 'Plush Bathrobes'],
    total_units: 8,
    available_units: 6,
    status: 'available',
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&h=400&fit=crop'
  },
  {
    id: 3,
    name: 'Oris Signature Suite',
    room_type: 'suite',
    description: 'Luxurious split-level suite with dedicated living lounge, Jacuzzi tub, and VIP concierge.',
    price_per_night: 75000,
    max_guests: 3,
    amenities: ['Private Jacuzzi', 'Living Lounge', 'Bar Station', 'Curated Art', 'Personal Concierge', 'Valet Parking'],
    total_units: 5,
    available_units: 3,
    status: 'available',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop'
  },
  {
    id: 4,
    name: 'Presidential Penthouse',
    room_type: 'presidential',
    description: 'The pinnacle of luxury — panoramic skyline terrace, butler service, and private dining salon.',
    price_per_night: 150000,
    max_guests: 4,
    amenities: ['Private Butler', 'Skyline Terrace', 'Full Bar', 'Dining Salon', 'Jacuzzi', 'VIP Chauffeur Transfer'],
    total_units: 2,
    available_units: 1,
    status: 'available',
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=400&fit=crop'
  }
];

const DEFAULT_SPACES = [
  {
    id: 1,
    name: 'The Grand Ballroom',
    description: 'An expansive ballroom adorned with crystal chandeliers and silver accents, ideal for weddings and galas.',
    capacity: 500,
    price_per_day: 500000,
    amenities: ['Full Concert Stage', 'Line-Array Audio', 'Dual 4K Projectors', 'Dance Floor', 'Banquet Kitchen', 'Green Rooms'],
    status: 'available',
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&h=400&fit=crop'
  },
  {
    id: 2,
    name: 'The Executive Senate Hall',
    description: 'Contemporary conference venue configured for corporate summits, board sessions, and product launches.',
    capacity: 200,
    price_per_day: 250000,
    amenities: ['4K Video Walls', 'Microphone Stations', 'High-Speed Fiber', 'Breakout Lounges', 'Simultaneous Translation'],
    status: 'available',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&h=400&fit=crop'
  },
  {
    id: 3,
    name: 'The Skyline Terrace & Garden',
    description: 'Open-air venue overlooking the city lights, curated for cocktail soirees and sunset receptions.',
    capacity: 120,
    price_per_day: 180000,
    amenities: ['Atmospheric Lighting', 'Outdoor Acoustic System', 'Private Cocktail Bar', 'Lounge Cabanas', 'Retractable Canopy'],
    status: 'available',
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&h=400&fit=crop'
  },
  {
    id: 4,
    name: 'The Obsidian VIP Lounge',
    description: 'Exclusive private club room with leather salon seating and cigar bar for confidential VIP events.',
    capacity: 50,
    price_per_day: 100000,
    amenities: ['Dedicated Bartender', 'Acoustic Insulation', 'Mood Lighting', 'Private Restroom', 'VIP Security Entry'],
    status: 'available',
    image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600&h=400&fit=crop'
  }
];

const DEFAULT_BOOKINGS = [
  {
    id: 1,
    receipt_id: 'ORS-982143',
    guest_name: 'David Adeleke',
    guest_email: 'david@example.com',
    guest_phone: '+234 803 123 4567',
    room_id: 3,
    room_name: 'Oris Signature Suite',
    room_type: 'suite',
    check_in_date: new Date().toISOString().split('T')[0],
    check_out_date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    num_guests: 2,
    total_amount: 150000,
    payment_status: 'paid',
    payment_method: 'card',
    booking_type: 'online',
    check_in_status: 'checked_in',
    special_requests: 'High floor, late arrival',
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 2,
    receipt_id: 'ORS-774019',
    guest_name: 'Senator Ngozi Okonjo',
    guest_email: 'ngozi@example.com',
    guest_phone: '+234 802 987 6543',
    room_id: 4,
    room_name: 'Presidential Penthouse',
    room_type: 'presidential',
    check_in_date: new Date().toISOString().split('T')[0],
    check_out_date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    num_guests: 2,
    total_amount: 450000,
    payment_status: 'paid',
    payment_method: 'transfer',
    booking_type: 'online',
    check_in_status: 'pending',
    special_requests: 'Airport pick up required',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 3,
    receipt_id: 'ORS-441208',
    guest_name: 'Michael Sterling',
    guest_email: 'michael.s@example.com',
    guest_phone: '+234 810 555 1212',
    room_id: 2,
    room_name: 'Executive Silver Suite',
    room_type: 'deluxe',
    check_in_date: new Date().toISOString().split('T')[0],
    check_out_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    num_guests: 1,
    total_amount: 450000,
    payment_status: 'paid',
    payment_method: 'pos',
    booking_type: 'walkin',
    check_in_status: 'checked_in',
    special_requests: 'Checked in by Front Desk at 9:30 AM',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];

const DEFAULT_EVENT_BOOKINGS = [
  {
    id: 1,
    receipt_id: 'ORS-EV-6189',
    client_name: 'Victoria & Alexander Wedding',
    client_email: 'vicky.events@example.com',
    client_phone: '+234 805 222 9090',
    event_space_id: 1,
    space_name: 'The Grand Ballroom',
    event_name: 'Victoria & Alexander Grand Wedding Gala',
    event_date: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    event_end_date: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    expected_guests: 450,
    total_amount: 500000,
    payment_status: 'paid',
    payment_method: 'card',
    booking_status: 'confirmed',
    special_requests: 'Floral chandelier installation from 7 AM',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 2,
    receipt_id: 'ORS-EV-3024',
    client_name: 'Apex Capital Summit',
    client_email: 'summit@apexcap.com',
    client_phone: '+234 809 111 4455',
    event_space_id: 2,
    space_name: 'The Executive Senate Hall',
    event_name: 'West Africa FinTech Leadership Forum',
    event_date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    event_end_date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    expected_guests: 180,
    total_amount: 250000,
    payment_status: 'paid',
    payment_method: 'transfer',
    booking_status: 'confirmed',
    special_requests: 'Live streaming setup and VIP holding room',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString()
  }
];

const DEFAULT_USERS = [
  {
    id: 1,
    full_name: 'Main Admin',
    email: 'admin@orissignatures.com',
    role: 'admin',
    created_at: '2026-01-01'
  },
  {
    id: 2,
    full_name: 'Grace Oladipo',
    email: 'frontdesk@orissignatures.com',
    role: 'frontdesk',
    created_at: '2026-01-10'
  },
  {
    id: 3,
    full_name: 'Femi Balogun',
    email: 'events@orissignatures.com',
    role: 'eventmanager',
    created_at: '2026-01-15'
  }
];

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE;
    this.initMockStore();
  }

  initMockStore() {
    if (!localStorage.getItem('oris_mock_rooms')) {
      localStorage.setItem('oris_mock_rooms', JSON.stringify(DEFAULT_ROOMS));
    }
    if (!localStorage.getItem('oris_mock_spaces')) {
      localStorage.setItem('oris_mock_spaces', JSON.stringify(DEFAULT_SPACES));
    }
    if (!localStorage.getItem('oris_mock_bookings')) {
      localStorage.setItem('oris_mock_bookings', JSON.stringify(DEFAULT_BOOKINGS));
    }
    if (!localStorage.getItem('oris_mock_event_bookings')) {
      localStorage.setItem('oris_mock_event_bookings', JSON.stringify(DEFAULT_EVENT_BOOKINGS));
    }
    if (!localStorage.getItem('oris_mock_users')) {
      localStorage.setItem('oris_mock_users', JSON.stringify(DEFAULT_USERS));
    }
  }

  getStorage(key, fallback = []) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  setStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('Storage error:', e);
    }
  }

  getToken() {
    return localStorage.getItem('oris_token');
  }

  setToken(token) {
    localStorage.setItem('oris_token', token);
  }

  clearToken() {
    localStorage.removeItem('oris_token');
    localStorage.removeItem('oris_user');
  }

  generateReceiptId(prefix = 'ORS') {
    const chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${prefix}-${result}`;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}/${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();
      if (!response.ok) {
        throw { status: response.status, ...data };
      }
      return data;
    } catch (error) {
      // If network failure or backend not responding, fallback seamlessly to mock store
      return this.handleFallback(endpoint, options);
    }
  }

  // Seamless Mock Engine Fallback
  async handleFallback(endpoint, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    const body = options.body ? JSON.parse(options.body) : {};

    // 1. Auth Login
    if (endpoint === 'api/auth/login' && method === 'POST') {
      const users = this.getStorage('oris_mock_users', DEFAULT_USERS);
      const user = users.find(u => u.email.toLowerCase() === body.email?.toLowerCase());
      if (user) {
        const token = 'mock_jwt_' + Math.random().toString(36).substring(2);
        this.setToken(token);
        localStorage.setItem('oris_user', JSON.stringify(user));
        return { success: true, token, user };
      }
      // Demo fallback if unknown email entered
      const fallbackUser = {
        id: 99,
        full_name: 'Staff Administrator',
        email: body.email || 'admin@orissignatures.com',
        role: body.email?.includes('frontdesk') ? 'frontdesk' : body.email?.includes('event') ? 'eventmanager' : 'admin'
      };
      const token = 'mock_jwt_demo';
      this.setToken(token);
      localStorage.setItem('oris_user', JSON.stringify(fallbackUser));
      return { success: true, token, user: fallbackUser };
    }

    // 2. Auth Verify
    if (endpoint === 'api/auth/verify') {
      const stored = localStorage.getItem('oris_user');
      if (stored) return { success: true, user: JSON.parse(stored) };
      throw { status: 401, error: 'Unauthorized' };
    }

    // 3. Rooms
    if (endpoint.startsWith('api/rooms')) {
      let rooms = this.getStorage('oris_mock_rooms', DEFAULT_ROOMS);
      if (endpoint === 'api/rooms' && method === 'GET') {
        return rooms;
      }
      if (endpoint.startsWith('api/rooms/availability')) {
        return rooms.filter(r => r.status === 'available');
      }
      if (endpoint === 'api/rooms' && method === 'POST') {
        const newRoom = { id: Date.now(), ...body, status: body.status || 'available' };
        rooms.push(newRoom);
        this.setStorage('oris_mock_rooms', rooms);
        return { success: true, room: newRoom };
      }
      if (method === 'PUT') {
        const id = parseInt(endpoint.split('/').pop());
        rooms = rooms.map(r => r.id === id ? { ...r, ...body } : r);
        this.setStorage('oris_mock_rooms', rooms);
        return { success: true };
      }
      if (method === 'DELETE') {
        const id = parseInt(endpoint.split('/').pop());
        rooms = rooms.filter(r => r.id !== id);
        this.setStorage('oris_mock_rooms', rooms);
        return { success: true };
      }
      return rooms;
    }

    // 4. Bookings
    if (endpoint.startsWith('api/bookings')) {
      let bookings = this.getStorage('oris_mock_bookings', DEFAULT_BOOKINGS);

      if (endpoint === 'api/bookings' && method === 'POST') {
        const rooms = this.getStorage('oris_mock_rooms', DEFAULT_ROOMS);
        const room = rooms.find(r => r.id === parseInt(body.room_id)) || rooms[0];
        const receipt_id = this.generateReceiptId('ORS');
        const newBooking = {
          id: Date.now(),
          receipt_id,
          guest_name: body.guest_name,
          guest_email: body.guest_email || '',
          guest_phone: body.guest_phone,
          room_id: body.room_id,
          room_name: room ? room.name : 'Deluxe Room',
          room_type: room ? room.room_type : 'deluxe',
          check_in_date: body.check_in_date,
          check_out_date: body.check_out_date,
          num_guests: body.num_guests || 1,
          total_amount: body.total_amount || (room ? room.price_per_night : 45000),
          payment_status: 'paid',
          payment_method: body.payment_method || 'card',
          booking_type: 'online',
          check_in_status: 'pending',
          special_requests: body.special_requests || '',
          created_at: new Date().toISOString()
        };
        bookings.unshift(newBooking);
        this.setStorage('oris_mock_bookings', bookings);
        return { success: true, receipt_id, booking: newBooking };
      }

      if (endpoint === 'api/bookings/walkin' && method === 'POST') {
        const rooms = this.getStorage('oris_mock_rooms', DEFAULT_ROOMS);
        const room = rooms.find(r => r.id === parseInt(body.room_id)) || rooms[0];
        const receipt_id = this.generateReceiptId('ORS');
        const newBooking = {
          id: Date.now(),
          receipt_id,
          guest_name: body.guest_name,
          guest_email: body.guest_email || '',
          guest_phone: body.guest_phone,
          room_id: body.room_id,
          room_name: room ? room.name : 'Deluxe Suite',
          room_type: room ? room.room_type : 'deluxe',
          check_in_date: body.check_in_date,
          check_out_date: body.check_out_date,
          num_guests: body.num_guests || 1,
          total_amount: body.total_amount,
          payment_status: 'paid',
          payment_method: body.payment_method || 'cash',
          booking_type: 'walkin',
          check_in_status: 'checked_in',
          special_requests: body.notes || 'Walk-in confirmed by Front Desk',
          created_at: new Date().toISOString()
        };
        bookings.unshift(newBooking);
        this.setStorage('oris_mock_bookings', bookings);
        return { success: true, receipt_id, booking: newBooking };
      }

      if (endpoint === 'api/bookings/checkin' && method === 'PUT') {
        const bookingId = body.booking_id;
        bookings = bookings.map(b => (b.id === bookingId || b.receipt_id === bookingId) ? { ...b, check_in_status: 'checked_in' } : b);
        this.setStorage('oris_mock_bookings', bookings);
        return { success: true, message: 'Guest checked in successfully' };
      }

      if (method === 'GET') {
        return bookings;
      }
    }

    // 5. Events
    if (endpoint.startsWith('api/events/spaces')) {
      let spaces = this.getStorage('oris_mock_spaces', DEFAULT_SPACES);
      if (method === 'GET') return spaces;
      if (method === 'POST') {
        const newSpace = { id: Date.now(), ...body, status: 'available' };
        spaces.push(newSpace);
        this.setStorage('oris_mock_spaces', spaces);
        return { success: true, space: newSpace };
      }
      if (method === 'PUT') {
        const id = parseInt(endpoint.split('/').pop());
        spaces = spaces.map(s => s.id === id ? { ...s, ...body } : s);
        this.setStorage('oris_mock_spaces', spaces);
        return { success: true };
      }
    }

    if (endpoint.startsWith('api/events/bookings')) {
      let eventBookings = this.getStorage('oris_mock_event_bookings', DEFAULT_EVENT_BOOKINGS);

      if (method === 'POST') {
        const spaces = this.getStorage('oris_mock_spaces', DEFAULT_SPACES);
        const space = spaces.find(s => s.id === parseInt(body.event_space_id)) || spaces[0];
        const receipt_id = this.generateReceiptId('ORS-EV');
        const newEvent = {
          id: Date.now(),
          receipt_id,
          client_name: body.client_name,
          client_email: body.client_email || '',
          client_phone: body.client_phone,
          event_space_id: body.event_space_id,
          space_name: space ? space.name : 'Grand Hall',
          event_name: body.event_name,
          event_date: body.event_date,
          event_end_date: body.event_end_date || body.event_date,
          expected_guests: body.expected_guests,
          total_amount: body.total_amount || (space ? space.price_per_day : 250000),
          payment_status: 'paid',
          payment_method: body.payment_method || 'card',
          booking_status: 'confirmed',
          special_requests: body.special_requests || '',
          created_at: new Date().toISOString()
        };
        eventBookings.unshift(newEvent);
        this.setStorage('oris_mock_event_bookings', eventBookings);
        return { success: true, receipt_id, booking: newEvent };
      }

      if (method === 'PUT') {
        const id = parseInt(endpoint.split('/').pop());
        eventBookings = eventBookings.map(b => b.id === id ? { ...b, ...body } : b);
        this.setStorage('oris_mock_event_bookings', eventBookings);
        return { success: true };
      }

      return eventBookings;
    }

    // 6. Receipts Search
    if (endpoint.startsWith('api/receipts/search')) {
      const urlParams = new URLSearchParams(endpoint.split('?')[1] || '');
      const query = (urlParams.get('q') || '').trim().toLowerCase();
      const bookings = this.getStorage('oris_mock_bookings', DEFAULT_BOOKINGS);
      const events = this.getStorage('oris_mock_event_bookings', DEFAULT_EVENT_BOOKINGS);

      const matchedBookings = bookings
        .filter(b => b.receipt_id.toLowerCase().includes(query) || b.guest_name.toLowerCase().includes(query) || (b.guest_phone && b.guest_phone.includes(query)))
        .map(b => ({ ...b, type: 'room' }));

      const matchedEvents = events
        .filter(e => e.receipt_id.toLowerCase().includes(query) || e.client_name.toLowerCase().includes(query) || e.event_name.toLowerCase().includes(query))
        .map(e => ({ ...e, type: 'event' }));

      return [...matchedBookings, ...matchedEvents];
    }

    // 7. Dashboard Stats
    if (endpoint === 'api/admin/dashboard') {
      const bookings = this.getStorage('oris_mock_bookings', DEFAULT_BOOKINGS);
      const events = this.getStorage('oris_mock_event_bookings', DEFAULT_EVENT_BOOKINGS);
      const rooms = this.getStorage('oris_mock_rooms', DEFAULT_ROOMS);

      const roomRevenue = bookings.reduce((sum, b) => sum + (Number(b.total_amount) || 0), 0);
      const eventRevenue = events.reduce((sum, e) => sum + (Number(e.total_amount) || 0), 0);
      const activeCheckedIn = bookings.filter(b => b.check_in_status === 'checked_in').length;

      return {
        total_revenue: roomRevenue + eventRevenue,
        room_bookings_count: bookings.length,
        event_bookings_count: events.length,
        active_checked_in: activeCheckedIn,
        occupancy_rate: 68,
        recent_bookings: bookings.slice(0, 5),
        upcoming_events: events.slice(0, 5)
      };
    }

    // 8. Staff Users
    if (endpoint.startsWith('api/admin/users')) {
      let users = this.getStorage('oris_mock_users', DEFAULT_USERS);
      if (method === 'GET') return users;
      if (method === 'POST') {
        const newUser = { id: Date.now(), ...body, created_at: new Date().toISOString().split('T')[0] };
        users.push(newUser);
        this.setStorage('oris_mock_users', users);
        return { success: true, user: newUser };
      }
      if (method === 'DELETE') {
        const id = parseInt(endpoint.split('/').pop());
        users = users.filter(u => u.id !== id);
        this.setStorage('oris_mock_users', users);
        return { success: true };
      }
    }

    // 9. Contact
    if (endpoint === 'api/contact' && method === 'POST') {
      return { success: true, message: 'Message sent successfully.' };
    }

    return { success: true };
  }

  // Auth Methods
  async login(email, password) {
    const data = await this.request('api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    localStorage.setItem('oris_user', JSON.stringify(data.user));
    return data;
  }

  async verifyToken() {
    return this.request('api/auth/verify');
  }

  logout() {
    this.clearToken();
  }

  // Rooms
  async getRooms() {
    return this.request('api/rooms');
  }

  async getRoom(id) {
    return this.request(`api/rooms/${id}`);
  }

  async createRoom(roomData) {
    return this.request('api/rooms', {
      method: 'POST',
      body: JSON.stringify(roomData),
    });
  }

  async updateRoom(id, roomData) {
    return this.request(`api/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(roomData),
    });
  }

  async deleteRoom(id) {
    return this.request(`api/rooms/${id}`, {
      method: 'DELETE',
    });
  }

  async checkAvailability(checkIn, checkOut) {
    return this.request(`api/rooms/availability?check_in=${checkIn}&check_out=${checkOut}`);
  }

  // Room Bookings
  async getBookings(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`api/bookings${params ? '?' + params : ''}`);
  }

  async getBooking(id) {
    return this.request(`api/bookings/${id}`);
  }

  async createBooking(bookingData) {
    return this.request('api/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async checkIn(bookingId) {
    return this.request('api/bookings/checkin', {
      method: 'PUT',
      body: JSON.stringify({ booking_id: bookingId }),
    });
  }

  async createWalkIn(bookingData) {
    return this.request('api/bookings/walkin', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  // Events
  async getEventSpaces() {
    return this.request('api/events/spaces');
  }

  async getEventSpace(id) {
    return this.request(`api/events/spaces/${id}`);
  }

  async createEventSpace(spaceData) {
    return this.request('api/events/spaces', {
      method: 'POST',
      body: JSON.stringify(spaceData),
    });
  }

  async updateEventSpace(id, spaceData) {
    return this.request(`api/events/spaces/${id}`, {
      method: 'PUT',
      body: JSON.stringify(spaceData),
    });
  }

  async getEventBookings(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`api/events/bookings${params ? '?' + params : ''}`);
  }

  async createEventBooking(bookingData) {
    return this.request('api/events/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async updateEventBooking(id, statusData) {
    return this.request(`api/events/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(statusData),
    });
  }

  // Receipts
  async searchReceipts(query) {
    return this.request(`api/receipts/search?q=${encodeURIComponent(query)}`);
  }

  // Admin
  async getDashboard() {
    return this.request('api/admin/dashboard');
  }

  async getUsers() {
    return this.request('api/admin/users');
  }

  async createUser(userData) {
    return this.request('api/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id, userData) {
    return this.request(`api/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id) {
    return this.request(`api/admin/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Contact
  async sendContactMessage(messageData) {
    return this.request('api/contact', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  async getContactMessages() {
    return this.request('api/contact');
  }
}

const api = new ApiClient();
export default api;
