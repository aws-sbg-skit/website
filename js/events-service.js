/**
 * AWS SBG SKIT - Events & Registration Service Layer
 * Supports Firebase Firestore & Auth with LocalStorage sync & offline fallback.
 */

(function (window) {
  'use strict';

  const STORAGE_KEY_EVENTS = 'aws_sbg_events';
  const STORAGE_KEY_REGISTRATIONS = 'aws_sbg_registrations';
  const STORAGE_KEY_CONFIG = 'aws_sbg_firebase_config';
  const STORAGE_KEY_AUTH = 'aws_sbg_admin_auth';
  const STORAGE_KEY_CHAMPIONS = 'aws_sbg_champions_v1';
  const SESSION_AUTH_TOKEN = 'aws_sbg_admin_session';

  // Seed default champions mirroring champions.html
  const DEFAULT_CHAMPIONS = [
    {
      id: 'champ-1',
      title: 'Orientation Session Quiz Winner',
      badge: '🏆 1st PLACE',
      badgeClass: 'badge-first',
      imageUrl: 'assets/spotlight/winner-1.jpg',
      subtitle: 'Quiz Champions • Tech Merch & Certificates awarded during our inaugural session.',
      desc: 'Awarded to the top quiz champions during our inaugural AWS SBG SKIT Orientation Session! Quiz Champions received official certificates & tech merchandise.',
      likes: 42,
      createdAt: '2026-07-22T10:00:00Z'
    },
    {
      id: 'champ-2',
      title: 'Giveaway 1 Winner',
      badge: '🎁 GIVEAWAY',
      badgeClass: 'badge-giveaway',
      imageUrl: 'assets/spotlight/winner-2.jpg',
      subtitle: 'Exclusive Tech Hardware Giveaway — Gaming Mouse winner.',
      desc: 'Winner of our exclusive community tech hardware giveaway — receiving a high-performance gaming mouse.',
      likes: 35,
      createdAt: '2026-08-10T10:00:00Z'
    },
    {
      id: 'champ-3',
      title: 'Giveaway 2 Winner',
      badge: '🎁 GIVEAWAY',
      badgeClass: 'badge-giveaway',
      imageUrl: 'assets/spotlight/winner-3.jpg',
      subtitle: 'Celebrating our student builder with high-fidelity wireless earbuds giveaway prize.',
      desc: 'Celebrating our student builder with high-fidelity wireless earbuds giveaway prize.',
      likes: 39,
      createdAt: '2026-09-01T10:00:00Z'
    },
    {
      id: 'champ-4',
      title: 'Giveaway Winner',
      badge: '🎁 GIVEAWAY',
      badgeClass: 'badge-giveaway',
      imageUrl: 'assets/spotlight/winner-4.jpg',
      subtitle: 'Gaming Mouse Winner awarded for outstanding participation and trivia performance during AWS Cloud Quest.',
      desc: 'Gaming Mouse Winner awarded for outstanding participation and trivia performance during AWS Cloud Quest.',
      likes: 38,
      createdAt: '2026-09-15T10:00:00Z'
    },
    {
      id: 'champ-5',
      title: 'Quiz Winner',
      badge: '🏆 QUIZ',
      badgeClass: 'badge-first',
      imageUrl: 'assets/spotlight/winner-5.jpg',
      subtitle: 'AWS Belt Bag Winner receiving official AWS community merchandise kit for the AWS Quiz.',
      desc: 'AWS Belt Bag Winner receiving official AWS community merchandise kit for the AWS Quiz.',
      likes: 45,
      createdAt: '2026-09-27T10:00:00Z'
    },
    {
      id: 'champ-6',
      title: 'Winners',
      badge: '🏆 WINNERS',
      badgeClass: 'badge-winners',
      imageUrl: 'assets/spotlight/winner-6.jpg',
      subtitle: 'Event Prizes Distribution — celebrating outstanding student builders and quiz winners with official AWS community swag kits and notebooks.',
      desc: 'Event Prizes Distribution — celebrating outstanding student builders and quiz winners with official AWS community swag kits and notebooks.',
      likes: 49,
      createdAt: '2026-10-01T10:00:00Z'
    },
    {
      id: 'champ-7',
      title: 'AWS Cloud Quest Winner',
      badge: '⚡ CLOUD QUEST',
      badgeClass: 'badge-first',
      imageUrl: 'assets/spotlight/cloud-quest-winner-1.jpg',
      subtitle: 'AWS Cloud Quest Challenge Winner receiving the official AWS community merchandise kit.',
      desc: 'AWS Cloud Quest Challenge Winner receiving the official AWS community merchandise kit.',
      likes: 37,
      createdAt: '2026-10-13T10:00:00Z'
    },
    {
      id: 'champ-8',
      title: 'AWS Cloud Quest Winner',
      badge: '⚡ CLOUD QUEST',
      badgeClass: 'badge-first',
      imageUrl: 'assets/spotlight/cloud-quest-winner-2.jpg',
      subtitle: 'AWS Cloud Quest Challenge Winner receiving the official AWS community swag kit.',
      desc: 'AWS Cloud Quest Challenge Winner receiving the official AWS community swag kit.',
      likes: 41,
      createdAt: '2026-10-14T10:00:00Z'
    },
    {
      id: 'champ-9',
      title: 'Cloud Quest Trivia Champion',
      badge: '⚡ CLOUD QUEST',
      badgeClass: 'badge-first',
      imageUrl: 'assets/spotlight/aws-101-quiz-winner.jpg',
      subtitle: '120+ Active Builders participated in the hands-on 3D RPG cloud learning arena at SKIT Jaipur.',
      desc: '120+ Active Builders participated in the hands-on 3D RPG cloud learning arena at SKIT Jaipur.',
      likes: 54,
      createdAt: '2026-10-15T10:00:00Z'
    },
    {
      id: 'champ-10',
      title: 'Winner of Quiz in AWS 101 Session',
      badge: '🏆 QUIZ WINNER',
      badgeClass: 'badge-first',
      imageUrl: 'assets/spotlight/aws-101-quiz-winner.jpg',
      subtitle: 'Winner of the interactive quiz during the AWS 101 Technical Workshop session.',
      desc: 'Winner of the technical quiz during the AWS 101 Hands-On Workshop session receiving official AWS prize.',
      likes: 40,
      createdAt: '2026-10-26T10:00:00Z'
    }
  ];

  // Seed default events mirroring current index.html
  const DEFAULT_EVENTS = [
    {
      id: 'event-1',
      title: 'Orientation Session',
      category: 'Orientation',
      status: 'done',
      dateDisplay: '22nd July, 2026',
      dateISO: '2026-07-22',
      venue: 'Civil Audio Visual Lab, SKIT',
      description: "Meet the core team, get the full rundown on what the community runs this year, and find your track — whether you're brand new to cloud or already shipping.",
      badge: 'Done — 22nd July',
      goodies: '🎁 Goodies Included',
      tag: 'Orientation',
      capacity: 150,
      registrationOpen: false,
      feedbackUrl: '',
      photosUrl: 'https://www.meetup.com/aws-sbg-at-swami-keshvanand-institute-of-technology-jaipur/photos/36115634/',
      isFeatured: false,
      createdAt: '2026-07-01T10:00:00Z'
    },
    {
      id: 'event-2',
      title: 'Meet and Greet Session',
      category: 'Meet & Greet',
      status: 'done',
      dateDisplay: '16th Sept, 2026',
      dateISO: '2026-09-16',
      venue: 'SKIT Campus',
      description: 'Join us at our meet & greet session to know more about the community, meet core team members, and get started on cloud.',
      badge: 'Done — 16th Sept',
      goodies: '🎁 Goodies Included',
      tag: 'Meet & Greet',
      capacity: 120,
      registrationOpen: false,
      feedbackUrl: '',
      photosUrl: 'https://www.meetup.com/aws-sbg-at-swami-keshvanand-institute-of-technology/photos/36178799/',
      isFeatured: false,
      createdAt: '2026-09-01T10:00:00Z'
    },
    {
      id: 'event-3',
      title: 'Getting Started with AWS & Acing the Cloud Practitioner Certification',
      category: 'Certification',
      status: 'done',
      dateDisplay: '27th Sept, 2026',
      dateISO: '2026-09-27',
      venue: 'Seminar Hall, SKIT',
      description: 'Foundational deep-dive into AWS Cloud architecture, core cloud concepts, preparation roadmap, and proven tips to ace the AWS Certified Cloud Practitioner certification.',
      badge: 'Done — 27th Sept',
      goodies: '🎁 Goodies Included',
      tag: 'Certification',
      capacity: 160,
      registrationOpen: false,
      feedbackUrl: '',
      photosUrl: 'https://www.meetup.com/aws-sbg-at-swami-keshvanand-institute-of-technology/photos/36192178/',
      isFeatured: false,
      createdAt: '2026-09-15T10:00:00Z'
    },
    {
      id: 'event-4',
      title: 'AWS Cloud Quest',
      category: 'Cloud Quest',
      status: 'done',
      dateDisplay: '13th Oct, 2026',
      dateISO: '2026-10-13',
      venue: 'SKIT Labs & Online',
      description: 'Tired of boring slideshows and heavy documentation? Step into the arena and learn Cloud Computing by playing a real 3D role-playing game!',
      badge: 'Done — 13th Oct',
      goodies: '🎁 Goodies Included',
      tag: 'Cloud Quest',
      capacity: 100,
      registrationOpen: false,
      feedbackUrl: '',
      photosUrl: 'https://www.meetup.com/aws-sbg-at-swami-keshvanand-institute-of-technology/photos/36218463/',
      isFeatured: false,
      createdAt: '2026-10-01T10:00:00Z'
    },
    {
      id: 'event-5',
      title: 'AWS 101',
      category: 'Workshop',
      status: 'done',
      dateDisplay: '26th Oct, 2026',
      dateISO: '2026-10-26',
      venue: 'Computer Lab 3, SKIT',
      description: 'Technical Hands-On Workshop — learn AWS fundamentals, cloud infrastructure, and core services through interactive hands-on labs.',
      badge: 'Done — 26th Oct',
      goodies: '🎁 Goodies Included',
      tag: 'Workshop',
      capacity: 110,
      registrationOpen: false,
      feedbackUrl: '',
      photosUrl: 'https://www.meetup.com/aws-sbg-at-swami-keshvanand-institute-of-technology/photos/36237771/',
      isFeatured: false,
      createdAt: '2026-10-10T10:00:00Z'
    },
    {
      id: 'event-6',
      title: 'AWS re:Invent Watch & Build Party',
      category: 'Watch Party',
      status: 'open',
      dateDisplay: '5th Dec, 2026',
      dateISO: '2026-12-05',
      venue: 'Civil Audio Visual Lab, SKIT',
      description: 'Watch Party & Keynote Discussion — join us live to watch the latest announcements, breakthroughs, and game-changing cloud innovations straight from AWS re:Invent 2026.',
      badge: 'Upcoming — 5th Dec, 2026',
      goodies: '🎁 Goodies Included',
      tag: 'Watch Party',
      capacity: 120,
      registrationOpen: true,
      feedbackUrl: '',
      photosUrl: '',
      isFeatured: false,
      createdAt: '2026-11-01T10:00:00Z'
    },
    {
      id: 'event-7',
      title: 'AWSsome Hackathon',
      category: 'Hackathon',
      status: 'open',
      dateDisplay: '18th Dec, 2026',
      dateISO: '2026-12-18',
      venue: 'Auditorium & Innovation Hub, SKIT',
      description: 'The culmination of the year — a 24-hour hackathon where teams build, compete, and ship real cloud solutions. Build fast. Build on AWS.',
      badge: 'Upcoming — 18th Dec, 2026',
      goodies: '🎁 Goodies Included',
      tag: 'Hackathon',
      capacity: 150,
      registrationOpen: true,
      feedbackUrl: '',
      photosUrl: '',
      isFeatured: false,
      createdAt: '2026-11-05T10:00:00Z'
    },
    {
      id: 'event-8',
      title: 'Build with Kiro',
      category: 'Session',
      status: 'upcoming',
      dateDisplay: 'January 2027',
      dateISO: '2027-01-15',
      venue: 'Computer Center, SKIT',
      description: 'Live Building / Project Session — dive into hands-on building sessions using Kiro, learn by doing, and ship something real.',
      badge: 'Upcoming — Jan 2027',
      goodies: '🎁 Goodies Included',
      tag: 'Session',
      capacity: 80,
      registrationOpen: false,
      feedbackUrl: '',
      photosUrl: '',
      isFeatured: false,
      createdAt: '2026-11-08T10:00:00Z'
    },
    {
      id: 'event-9',
      title: 'Career & Networking Session',
      category: 'Session',
      status: 'upcoming',
      dateDisplay: 'February 2027',
      dateISO: '2027-02-10',
      venue: 'Main Auditorium, SKIT',
      description: 'Guidance & Panel Discussion — build your professional network, sharpen your career strategy, and learn from industry insiders.',
      badge: 'Upcoming — Feb 2027',
      goodies: '🎁 Goodies Included',
      tag: 'Session',
      capacity: 200,
      registrationOpen: false,
      feedbackUrl: '',
      photosUrl: '',
      isFeatured: false,
      createdAt: '2026-11-10T10:00:00Z'
    },
    {
      id: 'event-10',
      title: 'AWS Student Community Day',
      category: 'Community Day',
      status: 'upcoming',
      dateDisplay: 'Spring 2027',
      dateISO: '2027-03-20',
      venue: 'Full Campus Convention, SKIT Jaipur',
      description: "The biggest event of our year — a full-day community celebration with hands-on sessions, live demos, networking, and recognition. Don't miss it.",
      badge: '⭐ Featured Event',
      goodies: '🎁 Exclusive Merchandise',
      tag: 'Community Day',
      capacity: 350,
      registrationOpen: false,
      feedbackUrl: '',
      photosUrl: '',
      isFeatured: true,
      createdAt: '2026-11-12T10:00:00Z'
    }
  ];

  // Helper: SHA-256 hash string for credential verification
  async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Pre-hashed default credentials:
  // Default username: "admin"
  // Default password: "password123"
  // Default hash for "admin:password123":
  const DEFAULT_AUTH_HASH = 'c8b0d8a4a585323c7e2c9d7624779327548d6a033a9ee9e427d3faad84e40df6';

  // Pre-configured Firebase Configuration for AWS SBG SKIT
  const DEFAULT_FIREBASE_CONFIG = {
    apiKey: "AIzaSyB_T38x3NS7VahZSAzmgTcMCXuGjzcQMB8",
    authDomain: "aws-sbg-skit.firebaseapp.com",
    projectId: "aws-sbg-skit",
    storageBucket: "aws-sbg-skit.firebasestorage.app",
    messagingSenderId: "398679730245",
    appId: "1:398679730245:web:129a5236528324605fdb2c",
    measurementId: "G-D9HLQXV63P"
  };

  class EventsService {
    constructor() {
      this.firebaseApp = null;
      this.firestore = null;
      this.isFirebaseReady = false;
      this.initLocalStore();
      this.initFirebase();
    }

    initLocalStore() {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_EVENTS);
        if (!stored) {
          localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(DEFAULT_EVENTS));
        }
        if (!localStorage.getItem(STORAGE_KEY_CHAMPIONS)) {
          localStorage.setItem(STORAGE_KEY_CHAMPIONS, JSON.stringify(DEFAULT_CHAMPIONS));
        }
        if (!localStorage.getItem(STORAGE_KEY_REGISTRATIONS)) {
          localStorage.setItem(STORAGE_KEY_REGISTRATIONS, JSON.stringify([]));
        }
        if (!localStorage.getItem(STORAGE_KEY_AUTH)) {
          localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify({
            username: 'admin',
            // Default credential: username "admin", password "password123"
            hash: DEFAULT_AUTH_HASH
          }));
        }
      } catch (e) {
        console.warn('LocalStorage access restricted:', e);
      }
    }

    initFirebase() {
      try {
        let config = DEFAULT_FIREBASE_CONFIG;
        const configStr = localStorage.getItem(STORAGE_KEY_CONFIG);
        if (configStr) {
          try {
            const parsed = JSON.parse(configStr);
            if (parsed && parsed.apiKey) config = parsed;
          } catch (e) {}
        }

        if (config && config.apiKey && config.projectId && window.firebase) {
          if (!window.firebase.apps.length) {
            this.firebaseApp = window.firebase.initializeApp(config);
          } else {
            this.firebaseApp = window.firebase.app();
          }
          this.firestore = window.firebase.firestore();
          this.isFirebaseReady = true;
          console.log('Firebase Firestore connected successfully to project:', config.projectId);
        }
      } catch (err) {
        console.warn('Firebase initialization skipped or failed:', err);
      }
    }

    setFirebaseConfig(config) {
      if (!config) {
        localStorage.removeItem(STORAGE_KEY_CONFIG);
        this.initFirebase();
        return { success: true };
      }
      try {
        localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
        this.initFirebase();
        return { success: true };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    getFirebaseConfig() {
      try {
        const str = localStorage.getItem(STORAGE_KEY_CONFIG);
        return str ? JSON.parse(str) : DEFAULT_FIREBASE_CONFIG;
      } catch (e) {
        return DEFAULT_FIREBASE_CONFIG;
      }
    }

    // ==========================================
    // AUTHENTICATION
    // ==========================================
    async login(username, password) {
      if (!username || !password) {
        return { success: false, message: 'Please enter both username and password.' };
      }

      const cleanUser = username.trim().toLowerCase();

      // Client-side format validation
      if (cleanUser.length < 3 || cleanUser.length > 30) {
        return { success: false, message: 'Username must be between 3 and 30 characters.' };
      }
      if (password.length < 6) {
        return { success: false, message: 'Password must be at least 6 characters.' };
      }

      // Try server-side authentication endpoint first (when hosted on HTTP/HTTPS server)
      if (typeof window !== 'undefined' && window.location && window.location.protocol && window.location.protocol.startsWith('http')) {
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: cleanUser, password })
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.token) {
              sessionStorage.setItem(SESSION_AUTH_TOKEN, JSON.stringify({
                token: data.token,
                username: data.username,
                loggedInAt: new Date().toISOString(),
                serverVerified: true
              }));
              return { success: true, username: data.username };
            }
          } else if (response.status === 429) {
            const errData = await response.json().catch(() => ({}));
            const errMsg = (errData.errors && errData.errors[0]) || 'Too many failed login attempts. Please wait 5 minutes.';
            return { success: false, message: errMsg };
          }
          // Note: If response is 401, fall through to check custom/updated credentials below
        } catch (networkErr) {
          // Fall through to local fallback authentication if offline or static file server
        }
      }

      // Check stored custom credentials (LocalStorage & Firestore Sync)
      const inputHash = await sha256(`${cleanUser}:${password}`);

      try {
        let validUser = 'admin';
        let validHash = DEFAULT_AUTH_HASH;

        // Sync from Firestore if available
        if (this.isFirebaseReady && this.firestore) {
          try {
            const fireDoc = await this.firestore.collection('settings').doc('admin_auth').get();
            if (fireDoc.exists) {
              const data = fireDoc.data();
              if (data && data.hash) {
                validUser = (data.username || 'admin').toLowerCase();
                validHash = data.hash;
                localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(data));
              }
            }
          } catch (e) {}
        }

        const authDataStr = localStorage.getItem(STORAGE_KEY_AUTH);
        if (authDataStr) {
          const authData = JSON.parse(authDataStr);
          validUser = (authData.username || validUser).toLowerCase();
          validHash = authData.hash || validHash;
        }

        if (cleanUser === validUser && inputHash === validHash) {
          const token = 'sbg_adm_' + Math.random().toString(36).substring(2) + Date.now();
          sessionStorage.setItem(SESSION_AUTH_TOKEN, JSON.stringify({
            token,
            username: cleanUser,
            loggedInAt: new Date().toISOString(),
            serverVerified: false
          }));
          return { success: true, username: cleanUser };
        } else {
          return { success: false, message: 'Invalid username or password.' };
        }
      } catch (e) {
        return { success: false, message: 'Login error: ' + e.message };
      }
    }

    isAuthenticated() {
      try {
        const session = sessionStorage.getItem(SESSION_AUTH_TOKEN);
        if (!session) return false;
        const parsed = JSON.parse(session);
        return !!parsed.token;
      } catch (e) {
        return false;
      }
    }

    getCurrentUser() {
      try {
        const session = sessionStorage.getItem(SESSION_AUTH_TOKEN);
        return session ? JSON.parse(session).username : null;
      } catch (e) {
        return null;
      }
    }

    logout() {
      try {
        sessionStorage.removeItem(SESSION_AUTH_TOKEN);
      } catch (e) {}
    }

    async changeAdminPassword(currentPassword, newUsername, newPassword) {
      // 1. Retrieve active stored credentials
      const authDataStr = localStorage.getItem(STORAGE_KEY_AUTH);
      let activeUser = 'admin';
      let activeHash = DEFAULT_AUTH_HASH;

      if (authDataStr) {
        try {
          const authData = JSON.parse(authDataStr);
          activeUser = (authData.username || 'admin').toLowerCase();
          activeHash = authData.hash || DEFAULT_AUTH_HASH;
        } catch (e) {}
      }

      // 2. Verify current password
      const inputHash = await sha256(`${activeUser}:${currentPassword}`);
      if (inputHash !== activeHash) {
        return { success: false, message: 'Current password is incorrect.' };
      }

      // 3. Validate new password
      if (!newPassword || newPassword.length < 6) {
        return { success: false, message: 'New password must be at least 6 characters.' };
      }

      const finalUser = (newUsername && newUsername.trim()) ? newUsername.trim().toLowerCase() : activeUser;
      const newHash = await sha256(`${finalUser}:${newPassword}`);

      const newAuthData = {
        username: finalUser,
        hash: newHash,
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(newAuthData));

      // Also persist to Firestore if connected
      if (this.isFirebaseReady && this.firestore) {
        try {
          await this.firestore.collection('settings').doc('admin_auth').set(newAuthData);
        } catch (e) {
          console.warn('Failed to sync updated auth to Firestore:', e);
        }
      }

      // Update current session
      try {
        const session = sessionStorage.getItem(SESSION_AUTH_TOKEN);
        if (session) {
          const parsed = JSON.parse(session);
          parsed.username = finalUser;
          sessionStorage.setItem(SESSION_AUTH_TOKEN, JSON.stringify(parsed));
        }
      } catch (e) {}

      return { success: true, message: 'Admin credentials updated successfully!' };
    }

    async resetAdminCredentials() {
      const defaultAuthData = {
        username: 'admin',
        hash: DEFAULT_AUTH_HASH,
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(defaultAuthData));

      if (this.isFirebaseReady && this.firestore) {
        try {
          await this.firestore.collection('settings').doc('admin_auth').set(defaultAuthData);
        } catch (e) {}
      }

      // Update active session if logged in
      try {
        const session = sessionStorage.getItem(SESSION_AUTH_TOKEN);
        if (session) {
          const parsed = JSON.parse(session);
          parsed.username = 'admin';
          sessionStorage.setItem(SESSION_AUTH_TOKEN, JSON.stringify(parsed));
        }
      } catch (e) {}

      return { success: true, message: 'Admin credentials reset to default (Username: admin, Password: password123)' };
    }

    // ==========================================
    // EVENTS CRUD
    // ==========================================
    async getEvents() {
      // If Firebase Firestore is active, fetch from it
      if (this.isFirebaseReady && this.firestore) {
        try {
          const snapshot = await this.firestore.collection('events').get();
          if (!snapshot.empty) {
            const list = [];
            snapshot.forEach(doc => {
              list.push({ id: doc.id, ...doc.data() });
            });
            // Update local cache
            localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(list));
            return list;
          } else {
            // First time sync: seed initial roadmap events into Firestore collection
            console.log('Seeding initial community events into Firestore...');
            const seedPromises = DEFAULT_EVENTS.map(ev => 
              this.firestore.collection('events').doc(ev.id).set(ev)
            );
            await Promise.all(seedPromises);
            localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(DEFAULT_EVENTS));
            return DEFAULT_EVENTS;
          }
        } catch (err) {
          console.warn('Failed to fetch events from Firestore, falling back to local store:', err);
        }
      }

      // Local storage fallback
      try {
        const data = localStorage.getItem(STORAGE_KEY_EVENTS);
        return data ? JSON.parse(data) : DEFAULT_EVENTS;
      } catch (e) {
        return DEFAULT_EVENTS;
      }
    }

    async getEventById(eventId) {
      const events = await this.getEvents();
      return events.find(ev => ev.id === eventId) || null;
    }

    async saveEvent(eventData) {
      if (!eventData.title || !eventData.dateDisplay) {
        throw new Error('Event Title and Date are required.');
      }

      let events = await this.getEvents();
      const isNew = !eventData.id;
      const now = new Date().toISOString();

      const normalizedEvent = {
        id: eventData.id || ('event-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4)),
        title: eventData.title.trim(),
        category: eventData.category || 'Workshop',
        status: eventData.status || 'open', // 'open', 'upcoming', 'done'
        dateDisplay: eventData.dateDisplay.trim(),
        dateISO: eventData.dateISO || now.split('T')[0],
        venue: eventData.venue ? eventData.venue.trim() : 'SKIT Campus, Jaipur',
        description: eventData.description ? eventData.description.trim() : '',
        badge: eventData.badge || (eventData.status === 'done' ? 'Completed' : (eventData.status === 'open' ? 'Registrations Open' : 'Upcoming')),
        goodies: eventData.goodies || '🎁 Goodies Included',
        tag: eventData.tag || eventData.category || 'Event',
        capacity: eventData.capacity ? parseInt(eventData.capacity, 10) : 100,
        registrationOpen: eventData.registrationOpen !== false,
        feedbackUrl: eventData.feedbackUrl ? eventData.feedbackUrl.trim() : '',
        photosUrl: eventData.photosUrl ? eventData.photosUrl.trim() : '',
        bannerUrl: eventData.bannerUrl ? eventData.bannerUrl.trim() : '',
        registrationType: eventData.registrationType === 'external' ? 'external' : 'native',
        externalRegistrationUrl: eventData.registrationType === 'external' ? (eventData.externalRegistrationUrl || '').trim() : '',
        registrationFields: eventData.registrationFields || {
          phone: true,
          branch: true,
          year: true,
          rollNumber: true,
          query: true,
          custom: false,
          customLabel: ''
        },
        isFeatured: !!eventData.isFeatured,
        updatedAt: now,
        createdAt: eventData.createdAt || now
      };

      if (isNew) {
        events.unshift(normalizedEvent);
      } else {
        const index = events.findIndex(e => e.id === normalizedEvent.id);
        if (index !== -1) {
          events[index] = { ...events[index], ...normalizedEvent };
        } else {
          events.unshift(normalizedEvent);
        }
      }

      // Persist to local storage
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));

      // Persist to Firestore if ready
      if (this.isFirebaseReady && this.firestore) {
        try {
          await this.firestore.collection('events').doc(normalizedEvent.id).set(normalizedEvent, { merge: true });
        } catch (err) {
          console.warn('Failed to save event to Firestore:', err);
        }
      }

      return normalizedEvent;
    }

    async deleteEvent(eventId) {
      let events = await this.getEvents();
      events = events.filter(e => e.id !== eventId);
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));

      // Also clean up registrations
      let regs = this.getLocalRegistrations();
      regs = regs.filter(r => r.eventId !== eventId);
      localStorage.setItem(STORAGE_KEY_REGISTRATIONS, JSON.stringify(regs));

      if (this.isFirebaseReady && this.firestore) {
        try {
          await this.firestore.collection('events').doc(eventId).delete();
        } catch (err) {
          console.warn('Failed to delete event from Firestore:', err);
        }
      }

      return { success: true };
    }

    async toggleRegistrationStatus(eventId, isOpen) {
      const event = await this.getEventById(eventId);
      if (!event) throw new Error('Event not found.');
      event.registrationOpen = isOpen;
      if (isOpen && event.status === 'done') {
        event.status = 'open';
      }
      return await this.saveEvent(event);
    }

    // ==========================================
    // REGISTRATIONS
    // ==========================================
    getLocalRegistrations() {
      try {
        const data = localStorage.getItem(STORAGE_KEY_REGISTRATIONS);
        return data ? JSON.parse(data) : [];
      } catch (e) {
        return [];
      }
    }

    async getAllRegistrations() {
      if (this.isFirebaseReady && this.firestore) {
        try {
          const snapshot = await this.firestore.collection('registrations').orderBy('registeredAt', 'desc').get();
          if (!snapshot.empty) {
            const list = [];
            snapshot.forEach(doc => {
              list.push({ id: doc.id, ...doc.data() });
            });
            localStorage.setItem(STORAGE_KEY_REGISTRATIONS, JSON.stringify(list));
            return list;
          }
        } catch (err) {
          console.warn('Firestore registrations fetch failed, using local:', err);
        }
      }
      return this.getLocalRegistrations();
    }

    async getRegistrationsByEvent(eventId) {
      const all = await this.getAllRegistrations();
      return all.filter(r => r.eventId === eventId);
    }

    async registerAttendee(data) {
      const { eventId, fullName, email, phone, college, branch, year, rollNumber, query, customQuestion, customAnswer, customResponses } = data;

      // 1. Strict Validation
      if (!eventId) throw new Error('Event ID is missing.');

      const cleanName = (fullName || '').trim();
      if (!cleanName || cleanName.length < 2) {
        throw new Error('Full Name must be at least 2 characters long.');
      }
      if (!/^[a-zA-Z\s\.\-']{2,80}$/.test(cleanName)) {
        throw new Error('Full Name can only contain letters, spaces, hyphens, and dots.');
      }

      const cleanEmail = (email || '').trim().toLowerCase();
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
      if (!emailRegex.test(cleanEmail)) {
        throw new Error('Please enter a valid email address.');
      }

      // Check event exists and is open
      const event = await this.getEventById(eventId);
      if (!event) {
        throw new Error('Event not found.');
      }
      if (!event.registrationOpen) {
        throw new Error('Registrations for this event are currently closed.');
      }

      const fields = event.registrationFields || {
        phone: true,
        branch: true,
        year: true,
        rollNumber: true,
        query: true,
        custom: false,
        customQuestions: []
      };

      // Check custom questions requiredness
      if (Array.isArray(fields.customQuestions)) {
        for (const cq of fields.customQuestions) {
          if (cq && cq.required) {
            let answered = false;
            if (Array.isArray(customResponses)) {
              const matched = customResponses.find(cr => cr && cr.prompt === cq.prompt);
              if (matched && matched.answer && matched.answer.trim()) {
                answered = true;
              }
            } else if (customQuestion === cq.prompt && customAnswer && customAnswer.trim()) {
              answered = true;
            }
            if (!answered) {
              throw new Error(`Please answer the required question: "${cq.prompt}"`);
            }
          }
        }
      }

      // Mobile number validation (mandatory only if enabled for this event)
      let normalizedPhone = '';
      if (fields.phone !== false || phone) {
        const cleanPhone = (phone || '').trim().replace(/[\s\-\+]/g, '');
        normalizedPhone = cleanPhone.startsWith('91') && cleanPhone.length === 12 ? cleanPhone.substring(2) : cleanPhone;
        if (fields.phone !== false && !/^[6-9]\d{9}$/.test(normalizedPhone)) {
          throw new Error('Mobile number must be a valid 10-digit Indian number starting with 6, 7, 8, or 9.');
        }
      }

      // Roll number validation (mandatory only if enabled for this event)
      let cleanRoll = '';
      if (fields.rollNumber !== false || rollNumber) {
        cleanRoll = (rollNumber || '').trim().toUpperCase();
        if (fields.rollNumber !== false) {
          if (!cleanRoll || cleanRoll.length < 4 || cleanRoll.length > 25) {
            throw new Error('Roll Number must be between 4 and 25 characters.');
          }
          if (!/^[A-Z0-9\/\-]{4,25}$/.test(cleanRoll)) {
            throw new Error('Roll Number can only contain alphanumeric characters, hyphens, and slashes.');
          }
        }
      }

      // Check current capacity
      const currentRegistrations = await this.getRegistrationsByEvent(eventId);
      if (event.capacity && currentRegistrations.length >= event.capacity) {
        throw new Error(`This event has reached its maximum seat limit of ${event.capacity} participants.`);
      }

      // Duplicate check (by email or roll number)
      const isDuplicate = currentRegistrations.some(r => {
        const sameEmail = r.email.toLowerCase() === cleanEmail;
        const sameRoll = cleanRoll && r.rollNumber && r.rollNumber.toUpperCase() === cleanRoll;
        return sameEmail || sameRoll;
      });

      if (isDuplicate) {
        throw new Error('You have already registered for this event with this email or roll number.');
      }

      // 2. Try Serverless API Submission first (Server-side validation & verification)
      let regId = null;
      if (typeof window !== 'undefined' && window.location && window.location.protocol && window.location.protocol.startsWith('http')) {
        try {
          const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              eventId: event.id,
              fullName: cleanName,
              email: cleanEmail,
              phone: normalizedPhone,
              college: (college && college.trim()) ? college.trim() : 'SKIT Jaipur',
              branch: branch || 'CSE',
              year: year || '1st Year',
              rollNumber: cleanRoll,
              query: (query || '').trim(),
              customQuestion: (customQuestion || (fields.custom && fields.customLabel) || '').trim(),
              customAnswer: (customAnswer || '').trim()
            })
          });

          if (response.ok) {
            const resData = await response.json();
            if (resData.success && resData.registrationId) {
              regId = resData.registrationId;
            }
          } else if (response.status === 400 || response.status === 429) {
            const errData = await response.json().catch(() => ({}));
            const errMsg = (errData.errors && errData.errors[0]) || 'Registration rejected by server.';
            throw new Error(errMsg);
          }
        } catch (fetchErr) {
          if (fetchErr.message && !fetchErr.message.includes('fetch') && !fetchErr.message.includes('URL')) {
            throw fetchErr; // Re-throw actual server validation error
          }
          // Network/offline fallback
        }
      }

      // 3. Fallback ID generation if offline
      if (!regId) {
        regId = 'SBG-' + Math.random().toString(36).substring(2, 7).toUpperCase();
      }

      const registration = {
        id: regId,
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.dateDisplay,
        fullName: cleanName,
        email: cleanEmail,
        phone: normalizedPhone,
        college: (college && college.trim()) ? college.trim() : 'SKIT Jaipur',
        branch: branch ? branch.trim() : 'CSE',
        year: year ? year.trim() : '1st Year',
        rollNumber: cleanRoll,
        query: (query || '').trim(),
        customResponses: Array.isArray(customResponses) ? customResponses : [],
        customQuestion: (customQuestion || (fields.custom && fields.customLabel) || '').trim(),
        customAnswer: (customAnswer || '').trim(),
        registeredAt: new Date().toISOString()
      };

      // Save locally
      const allRegs = this.getLocalRegistrations();
      allRegs.unshift(registration);
      localStorage.setItem(STORAGE_KEY_REGISTRATIONS, JSON.stringify(allRegs));

      // Save to Firestore if connected
      if (this.isFirebaseReady && this.firestore) {
        try {
          await this.firestore.collection('registrations').doc(regId).set(registration);
        } catch (err) {
          console.warn('Failed to save registration to Firestore:', err);
        }
      }

      return {
        success: true,
        registrationId: regId,
        eventTitle: event.title,
        attendeeName: cleanName
      };
    }

    async deleteRegistration(registrationId) {
      let regs = this.getLocalRegistrations();
      regs = regs.filter(r => r.id !== registrationId);
      localStorage.setItem(STORAGE_KEY_REGISTRATIONS, JSON.stringify(regs));

      if (this.isFirebaseReady && this.firestore) {
        try {
          await this.firestore.collection('registrations').doc(registrationId).delete();
        } catch (err) {
          console.warn('Failed to delete registration from Firestore:', err);
        }
      }

      return { success: true };
    }

    // ==========================================
    // EXPORT TO CSV
    // ==========================================
    generateRegistrationsCSV(registrations, eventTitle = 'Event') {
      if (!registrations || registrations.length === 0) {
        return null;
      }

      // Collect all distinct custom question prompts across these registrations
      const customPrompts = [];
      registrations.forEach(r => {
        if (Array.isArray(r.customResponses)) {
          r.customResponses.forEach(cr => {
            if (cr && cr.prompt && !customPrompts.includes(cr.prompt)) {
              customPrompts.push(cr.prompt);
            }
          });
        } else if (r.customQuestion && !customPrompts.includes(r.customQuestion)) {
          customPrompts.push(r.customQuestion);
        }
      });

      const baseHeaders = [
        'Registration ID',
        'Registered At',
        'Event Title',
        'Full Name',
        'Email Address',
        'Phone Number',
        'College / Institute',
        'Branch / Department',
        'Year of Study',
        'Roll Number',
        'Questions / Notes'
      ];

      const headers = [
        ...baseHeaders,
        ...customPrompts.map(p => `"${p.replace(/"/g, '""')}"`)
      ];

      const rows = registrations.map(r => {
        const row = [
          `"${r.id || ''}"`,
          `"${r.registeredAt ? new Date(r.registeredAt).toLocaleString() : ''}"`,
          `"${(r.eventTitle || eventTitle).replace(/"/g, '""')}"`,
          `"${(r.fullName || '').replace(/"/g, '""')}"`,
          `"${(r.email || '').replace(/"/g, '""')}"`,
          `"${(r.phone || '').replace(/"/g, '""')}"`,
          `"${(r.college || '').replace(/"/g, '""')}"`,
          `"${(r.branch || '').replace(/"/g, '""')}"`,
          `"${(r.year || '').replace(/"/g, '""')}"`,
          `"${(r.rollNumber || '').replace(/"/g, '""')}"`,
          `"${(r.query || '').replace(/"/g, '""')}"`
        ];

        customPrompts.forEach(p => {
          let ans = '';
          if (Array.isArray(r.customResponses)) {
            const found = r.customResponses.find(cr => cr && cr.prompt === p);
            if (found) ans = found.answer || '';
          } else if (r.customQuestion === p) {
            ans = r.customAnswer || '';
          }
          row.push(`"${ans.replace(/"/g, '""')}"`);
        });

        return row;
      });

      const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\r\n');
      return csvContent;
    }

    downloadCSV(csvString, filename) {
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    // ==========================================
    // HALL OF FAME / CHAMPIONS CRUD
    // ==========================================
    async getChampions() {
      if (this.isFirebaseReady && this.firestore) {
        try {
          const snapshot = await this.firestore.collection('champions').orderBy('createdAt', 'desc').get();
          if (!snapshot.empty) {
            const list = [];
            snapshot.forEach(doc => {
              list.push({ id: doc.id, ...doc.data() });
            });
            localStorage.setItem(STORAGE_KEY_CHAMPIONS, JSON.stringify(list));
            return list;
          } else {
            console.log('Seeding initial Hall of Fame champions into Firestore...');
            const seedPromises = DEFAULT_CHAMPIONS.map(ch =>
              this.firestore.collection('champions').doc(ch.id).set(ch)
            );
            await Promise.all(seedPromises);
            localStorage.setItem(STORAGE_KEY_CHAMPIONS, JSON.stringify(DEFAULT_CHAMPIONS));
            return DEFAULT_CHAMPIONS;
          }
        } catch (err) {
          console.warn('Failed to fetch champions from Firestore, falling back to local storage:', err);
        }
      }

      // Local storage fallback
      try {
        const stored = localStorage.getItem(STORAGE_KEY_CHAMPIONS);
        if (stored) return JSON.parse(stored);
      } catch (e) {}

      return DEFAULT_CHAMPIONS;
    }

    async saveChampion(champData) {
      let champions = await this.getChampions();
      const isNew = !champData.id;
      const now = new Date().toISOString();

      const normalizedChamp = {
        id: champData.id || ('champ-' + Date.now().toString(36)),
        title: (champData.title || '').trim(),
        badge: (champData.badge || '🏆 WINNER').trim(),
        badgeClass: champData.badgeClass || 'badge-first',
        subtitle: (champData.subtitle || '').trim(),
        desc: (champData.desc || '').trim(),
        event: (champData.event || '').trim(),
        imageUrl: (champData.imageUrl || '').trim(),
        likes: typeof champData.likes === 'number' ? champData.likes : Math.floor(Math.random() * 20) + 30,
        createdAt: champData.createdAt || now,
        updatedAt: now
      };

      if (isNew) {
        champions.unshift(normalizedChamp);
      } else {
        const idx = champions.findIndex(c => c.id === normalizedChamp.id);
        if (idx !== -1) {
          champions[idx] = { ...champions[idx], ...normalizedChamp };
        } else {
          champions.unshift(normalizedChamp);
        }
      }

      localStorage.setItem(STORAGE_KEY_CHAMPIONS, JSON.stringify(champions));

      if (this.isFirebaseReady && this.firestore) {
        try {
          await this.firestore.collection('champions').doc(normalizedChamp.id).set(normalizedChamp, { merge: true });
        } catch (err) {
          console.warn('Failed to save champion to Firestore:', err);
        }
      }

      return normalizedChamp;
    }

    async deleteChampion(champId) {
      let champions = await this.getChampions();
      champions = champions.filter(c => c.id !== champId);
      localStorage.setItem(STORAGE_KEY_CHAMPIONS, JSON.stringify(champions));

      if (this.isFirebaseReady && this.firestore) {
        try {
          await this.firestore.collection('champions').doc(champId).delete();
        } catch (err) {
          console.warn('Failed to delete champion from Firestore:', err);
        }
      }

      return { success: true };
    }
  }

  // Export singleton to global scope
  window.AwsSbgEventsService = new EventsService();

})(window);
