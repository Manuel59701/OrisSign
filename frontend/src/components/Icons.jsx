// Shared inline SVG icon set (replaces emoji throughout the UI).
// Every icon inherits `currentColor` so it can be colored via CSS.

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

const make = (children) => (props) => (
  <svg {...base} width="20" height="20" {...props}>{children}</svg>
);

export const Grid = make(<>
  <rect x="3" y="3" width="7" height="7" rx="1" />
  <rect x="14" y="3" width="7" height="7" rx="1" />
  <rect x="14" y="14" width="7" height="7" rx="1" />
  <rect x="3" y="14" width="7" height="7" rx="1" />
</>);

export const Bell = make(<>
  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
  <path d="M13.7 21a2 2 0 0 1-3.4 0" />
</>);

export const ConciergeBell = make(<>
  <path d="M2 18h20" />
  <path d="M4 18a8 8 0 0 1 16 0" />
  <path d="M12 10V7" />
  <path d="M10 7h4" />
</>);

export const Calendar = make(<>
  <rect x="3" y="4" width="18" height="18" rx="2" />
  <path d="M16 2v4M8 2v4M3 10h18" />
</>);

export const Receipt = make(<>
  <path d="M4 3v18l2-1.5L8 21l2-1.5L12 21l2-1.5L16 21l2-1.5L20 21V3l-2 1.5L16 3l-2 1.5L12 3l-2 1.5L8 3 6 4.5 4 3Z" />
  <path d="M8 8h8M8 12h8M8 16h5" />
</>);

export const Bed = make(<>
  <path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8" />
  <path d="M2 16h20M6 10V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3" />
</>);

export const Users = make(<>
  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
  <circle cx="9" cy="7" r="4" />
  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
</>);

export const Globe = make(<>
  <circle cx="12" cy="12" r="9" />
  <path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z" />
</>);

export const LogOut = make(<>
  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
  <path d="m16 17 5-5-5-5M21 12H9" />
</>);

export const Menu = make(<>
  <path d="M3 6h18M3 12h18M3 18h18" />
</>);

export const Shield = make(<>
  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
</>);

export const Search = make(<>
  <circle cx="11" cy="11" r="7" />
  <path d="m21 21-4.3-4.3" />
</>);

export const Clipboard = make(<>
  <rect x="8" y="2" width="8" height="4" rx="1" />
  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
  <path d="M8 12h8M8 16h5" />
</>);

export const Check = make(<>
  <path d="M20 6 9 17l-5-5" />
</>);

export const CheckCircle = make(<>
  <circle cx="12" cy="12" r="9" />
  <path d="m8.5 12 2.5 2.5 4.5-5" />
</>);

export const Download = make(<>
  <path d="M12 3v12m0 0 4-4m-4 4-4-4" />
  <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
</>);

export const Mail = make(<>
  <rect x="3" y="5" width="18" height="14" rx="2" />
  <path d="m3 7 9 6 9-6" />
</>);

export const Phone = make(<>
  <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.4 2.1L8 9.8a16 16 0 0 0 6 6l1.4-1.3a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.9 2.3Z" />
</>);

export const MapPin = make(<>
  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
  <circle cx="12" cy="10" r="3" />
</>);

export const Clock = make(<>
  <circle cx="12" cy="12" r="9" />
  <path d="M12 7v5l3 2" />
</>);

export const Money = make(<>
  <rect x="2" y="6" width="20" height="12" rx="2" />
  <circle cx="12" cy="12" r="2.5" />
  <path d="M6 12h.01M18 12h.01" />
</>);

export const Sparkles = make(<>
  <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" />
  <path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14Z" />
</>);

export const Star = make(
  <path d="m12 3 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 18l-5.8 3 1.1-6.5L2.6 9.8l6.5-.9L12 3Z" />
);

export const Wifi = make(<>
  <path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0" />
  <path d="M2 9a15 15 0 0 1 20 0" />
  <path d="M12 20h.01" />
</>);

export const Snowflake = make(<>
  <path d="M12 2v20M4 6l16 12M20 6 4 18" />
  <path d="M12 6l2-2m-2 2-2-2m2 14 2 2m-2-2-2 2" />
</>);

export const Tv = make(<>
  <rect x="2" y="4" width="20" height="13" rx="2" />
  <path d="M8 21h8M12 17v4" />
</>);

export const Fridge = make(<>
  <rect x="6" y="2" width="12" height="20" rx="2" />
  <path d="M6 10h12M9 6v2M9 14v2" />
</>);

export const Wine = make(<>
  <path d="M8 3h8l-1 6a3 3 0 0 1-6 0L8 3Z" />
  <path d="M12 15v6M9 21h6" />
</>);

export const Sun = make(<>
  <circle cx="12" cy="12" r="4" />
  <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5 3.6 3.6M20.4 20.4 19 19M19 5l1.4-1.4M3.6 20.4 5 19" />
</>);

export const Bath = make(<>
  <path d="M4 12V6a2 2 0 0 1 4 0" />
  <path d="M2 12h20v3a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4v-3Z" />
  <path d="M6 19l-1 2M18 19l1 2" />
</>);

export const Sofa = make(<>
  <path d="M4 12V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
  <path d="M2 12a2 2 0 0 1 2 2v4h16v-4a2 2 0 0 1 2-2 2 2 0 0 0-2 2v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4a2 2 0 0 0-2-2Z" />
</>);

export const Utensils = make(<>
  <path d="M4 3v7a2 2 0 0 0 4 0V3M6 10v11" />
  <path d="M15 3c-1.5 1-2 3-2 5s.5 3 2 3v10" />
</>);

export const Mic = make(<>
  <rect x="9" y="2" width="6" height="11" rx="3" />
  <path d="M5 10a7 7 0 0 0 14 0M12 17v5M8 22h8" />
</>);

export const Music = make(<>
  <path d="M9 18V5l10-2v13" />
  <circle cx="6" cy="18" r="3" />
  <circle cx="16" cy="16" r="3" />
</>);

export const Video = make(<>
  <rect x="2" y="6" width="14" height="12" rx="2" />
  <path d="m22 8-6 4 6 4V8Z" />
</>);

export const Presentation = make(<>
  <path d="M2 3h20M4 3v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3" />
  <path d="M12 16v5M9 21h6" />
</>);

export const Umbrella = make(<>
  <path d="M22 12a10 10 0 0 0-20 0Z" />
  <path d="M12 12v7a2 2 0 0 0 4 0" />
</>);

export const Flame = make(
  <path d="M12 2s5 4 5 9a5 5 0 0 1-10 0c0-1.5.5-2.5.5-2.5S8 11 9.5 11 12 9 12 2Z" />
);

export const Lightbulb = make(<>
  <path d="M9 18h6M10 22h4" />
  <path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2Z" />
</>);

export const Car = make(<>
  <path d="M5 17H3v-6l2-5h14l2 5v6h-2" />
  <path d="M5 17a2 2 0 1 0 4 0M15 17a2 2 0 1 0 4 0M3 12h18" />
</>);

export const Sprout = make(<>
  <path d="M12 22V12" />
  <path d="M12 12c0-3 2-5 6-5 0 3-2 5-6 5ZM12 12c0-3-2-5-6-5 0 3 2 5 6 5Z" />
</>);

export const Key = make(<>
  <circle cx="7.5" cy="15.5" r="3.5" />
  <path d="m10 13 8-8M15 5h4v4" />
</>);

export const X = make(<>
  <path d="M18 6 6 18M6 6l12 12" />
</>);

export const Trash = make(<>
  <path d="M3 6h18" />
  <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
  <path d="M10 11v6M14 11v6" />
</>);

export const Settings = make(<>
  <circle cx="12" cy="12" r="3" />
  <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h.09a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.09a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1z" />
</>);

const amenityMatchers = [
  [/wifi|wi-fi|internet/, Wifi],
  [/air condition|\bac\b|climate/, Snowflake],
  [/tv|television/, Tv],
  [/fridge/, Fridge],
  [/bar\b|minibar|mini bar|wine/, Wine],
  [/balcony|terrace|skyline|outdoor|roof/, Sun],
  [/room service|concierge|bell/, ConciergeBell],
  [/jacuzzi|bath|shower|jaccuzi/, Bath],
  [/living|lounge|seating|sofa/, Sofa],
  [/dining|dinner|catering|kitchen|breakfast|bbq|grill/, Utensils],
  [/barbe?cue|bbq|flame/, Flame],
  [/butler|staff|dressing|host/, Users],
  [/stage|podium|av\b/, Mic],
  [/sound|audio|music|dj|dance/, Music],
  [/projector|video|conference|screen/, Video],
  [/whiteboard|breakout|presentation|meeting/, Presentation],
  [/rain cover|umbrella|covered/, Umbrella],
  [/light|lamp|mood/, Lightbulb],
  [/parking|valet|chauffeur|transfer|car/, Car],
  [/garden|palm|greenery|art|decor/, Sprout],
  [/penthouse|luxury|premium|vvip|vip/, Star],
];

/**
 * Returns an SVG icon element for a given amenity label.
 */
export function AmenityIcon({ name, size = 15, className }) {
  const key = String(name || '').toLowerCase();
  const match = amenityMatchers.find(([re]) => re.test(key));
  const Cmp = match ? match[1] : Sparkles;
  return <Cmp width={size} height={size} className={className} style={{ verticalAlign: '-2px' }} />;
}

export const Eye = make(<>
  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
  <circle cx="12" cy="12" r="3" />
</>);

export const EyeOff = make(<>
  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
  <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
  <path d="M1 1l22 22" />
</>);

export default {
  Grid, Bell, ConciergeBell, Calendar, Receipt, Bed, Users, Globe, LogOut, Menu,
  Shield, Search, Clipboard, Check, CheckCircle, Download, Mail, Phone, MapPin,
  Clock, Money, Sparkles, Star, Wifi, Snowflake, Tv, Fridge, Wine, Sun, Bath,
  Sofa, Utensils, Mic, Music, Video, Presentation, Umbrella, Flame, Lightbulb,
  Car, Sprout, Key, X, Trash, Settings, Eye, EyeOff,
};
