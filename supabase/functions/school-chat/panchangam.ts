// Server-side Panchangam calculation for the AI chat

const TITHIS = [
  "பிரதமை (Prathamai)", "த்விதீயை (Dvitiyai)", "திருதீயை (Tritiyai)", "சதுர்த்தி (Chaturthi)", "பஞ்சமி (Panchami)",
  "ஷஷ்டி (Shashti)", "சப்தமி (Saptami)", "அஷ்டமி (Ashtami)", "நவமி (Navami)", "தசமி (Dasami)",
  "ஏகாதசி (Ekadashi)", "த்வாதசி (Dvadashi)", "திரயோதசி (Trayodashi)", "சதுர்தசி (Chaturdashi)", "பூர்ணிமை (Pournami)"
];

const TITHIS_KRISHNA = [
  "பிரதமை (Prathamai)", "த்விதீயை (Dvitiyai)", "திருதீயை (Tritiyai)", "சதுர்த்தி (Chaturthi)", "பஞ்சமி (Panchami)",
  "ஷஷ்டி (Shashti)", "சப்தமி (Saptami)", "அஷ்டமி (Ashtami)", "நவமி (Navami)", "தசமி (Dasami)",
  "ஏகாதசி (Ekadashi)", "த்வாதசி (Dvadashi)", "திரயோதசி (Trayodashi)", "சதுர்தசி (Chaturdashi)", "அமாவாசை (Amavasai)"
];

const NAKSHATRAS = [
  "அஸ்வினி (Ashwini)", "பரணி (Bharani)", "கிருத்திகை (Krittikai)", "ரோகிணி (Rohini)", "மிருகசீரிடம் (Mrigashirsha)",
  "திருவாதிரை (Thiruvadirai)", "புனர்பூசம் (Punarvasu)", "பூசம் (Pushya)", "ஆயில்யம் (Ayilyam)", "மகம் (Magam)",
  "பூரம் (Pooram)", "உத்திரம் (Uthiram)", "ஹஸ்தம் (Hastham)", "சித்திரை (Chithirai)", "சுவாதி (Swathi)",
  "விசாகம் (Visakam)", "அனுஷம் (Anusham)", "கேட்டை (Kettai)", "மூலம் (Moolam)", "பூராடம் (Pooradam)",
  "உத்திராடம் (Uthiradam)", "திருவோணம் (Thiruvonam)", "அவிட்டம் (Avittam)", "சதயம் (Sadhayam)", "பூரட்டாதி (Poorattadhi)",
  "உத்திரட்டாதி (Uthirattadhi)", "ரேவதி (Revathi)"
];

const YOGAMS = [
  "விஷ்கம்பம்", "பிரீதி", "ஆயுஷ்மான்", "சௌபாக்யம்", "சோபனம்",
  "அதிகண்டம்", "சுகர்மா", "திருதி", "சூலம்", "கண்டம்",
  "விருத்தி", "துருவம்", "வியாகாதம்", "ஹர்ஷணம்", "வஜ்ரம்",
  "சித்தி", "வியதீபாதம்", "வரியான்", "பரிகம்", "சிவம்",
  "சித்தம்", "சாத்தியம்", "சுபம்", "சுக்லம்", "பிரம்மம்",
  "ஐந்திரம்", "வைத்ருதி"
];

const KARANAMS = [
  "பவம்", "பாலவம்", "கௌலவம்", "தைதுலம்", "கரம்",
  "வணிஜம்", "விஷ்டி", "சகுனி", "சதுஷ்பாதம்", "நாகம்", "கிம்ஸ்துக்னம்"
];

const RAHU_KALAM: Record<number, string> = {
  0: "4:30 PM – 6:00 PM", 1: "7:30 AM – 9:00 AM", 2: "3:00 PM – 4:30 PM",
  3: "12:00 PM – 1:30 PM", 4: "1:30 PM – 3:00 PM", 5: "10:30 AM – 12:00 PM", 6: "9:00 AM – 10:30 AM",
};

const VAARAM = ["ஞாயிறு (Sunday)", "திங்கள் (Monday)", "செவ்வாய் (Tuesday)", "புதன் (Wednesday)", "வியாழன் (Thursday)", "வெள்ளி (Friday)", "சனி (Saturday)"];

const TAMIL_MONTHS = [
  { name: "சித்திரை", start: [4, 14] }, { name: "வைகாசி", start: [5, 15] }, { name: "ஆனி", start: [6, 15] },
  { name: "ஆடி", start: [7, 15] }, { name: "ஆவணி", start: [8, 15] }, { name: "புரட்டாசி", start: [9, 15] },
  { name: "ஐப்பசி", start: [10, 15] }, { name: "கார்த்திகை", start: [11, 15] }, { name: "மார்கழி", start: [12, 15] },
  { name: "தை", start: [1, 14] }, { name: "மாசி", start: [2, 13] }, { name: "பங்குனி", start: [3, 14] },
];

function toJulianDay(year: number, month: number, day: number): number {
  if (month <= 2) { year--; month += 12; }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
}

function sunLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const L0 = (280.46646 + 36000.76983 * T) % 360;
  const M = ((357.52911 + 35999.05029 * T) % 360) * Math.PI / 180;
  const C = (1.914602 - 0.004817 * T) * Math.sin(M) + 0.019993 * Math.sin(2 * M);
  return (L0 + C + 360) % 360;
}

function moonLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const Lp = (218.3165 + 481267.8813 * T) % 360;
  const D = ((297.8502 + 445267.1115 * T) % 360) * Math.PI / 180;
  const M = ((357.5291 + 35999.0503 * T) % 360) * Math.PI / 180;
  const Mp = ((134.9634 + 477198.8676 * T) % 360) * Math.PI / 180;
  const F = ((93.2720 + 483202.0175 * T) % 360) * Math.PI / 180;
  let lon = Lp + 6.289 * Math.sin(Mp) + 1.274 * Math.sin(2 * D - Mp) + 0.658 * Math.sin(2 * D) + 0.214 * Math.sin(2 * Mp) - 0.186 * Math.sin(M) - 0.114 * Math.sin(2 * F);
  return ((lon % 360) + 360) % 360;
}

function getTamilMonth(month: number, day: number): string {
  for (let i = TAMIL_MONTHS.length - 1; i >= 0; i--) {
    const [m, d] = TAMIL_MONTHS[i].start;
    if (month > m || (month === m && day >= d)) return TAMIL_MONTHS[i].name;
  }
  return TAMIL_MONTHS[TAMIL_MONTHS.length - 1].name;
}

export function getTodayPanchangamText(): string {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const ist = new Date(utc + istOffset);

  const year = ist.getFullYear();
  const month = ist.getMonth() + 1;
  const day = ist.getDate();
  const dayOfWeek = ist.getDay();
  const jd = toJulianDay(year, month, day);

  const moonLon = moonLongitude(jd);
  const sunLon = sunLongitude(jd);
  const diff = ((moonLon - sunLon) + 360) % 360;
  const tithiIndex = Math.floor(diff / 12);
  const paksham = tithiIndex < 15 ? "சுக்ல பக்ஷம் (Shukla)" : "கிருஷ்ண பக்ஷம் (Krishna)";
  const tithiInPaksham = tithiIndex % 15;
  const tithi = tithiIndex < 15 ? TITHIS[tithiInPaksham] : TITHIS_KRISHNA[tithiInPaksham];

  const nakshatraIndex = Math.floor(moonLon / (360 / 27)) % 27;
  const nakshatra = NAKSHATRAS[nakshatraIndex];

  const yogaAngle = ((sunLon + moonLon) % 360);
  const yogaIndex = Math.floor(yogaAngle / (360 / 27)) % 27;
  const yogam = YOGAMS[yogaIndex];

  const karanaAbsolute = Math.floor(diff / 6);
  let karanaIndex: number;
  if (karanaAbsolute === 0) karanaIndex = 10;
  else if (karanaAbsolute >= 57) karanaIndex = 7 + (karanaAbsolute - 57);
  else karanaIndex = ((karanaAbsolute - 1) % 7);
  const karanam = KARANAMS[Math.min(karanaIndex, KARANAMS.length - 1)];

  const tamilMonth = getTamilMonth(month, day);
  const rahuKalam = RAHU_KALAM[dayOfWeek];

  return `TODAY'S TAMIL PANCHANGAM (${ist.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}):
- வாரம் (Day): ${VAARAM[dayOfWeek]}
- தமிழ் மாதம்: ${tamilMonth}
- பக்ஷம்: ${paksham}
- திதி (Tithi): ${tithi}
- நட்சத்திரம் (Nakshatra): ${nakshatra}
- யோகம் (Yogam): ${yogam}
- கரணம் (Karanam): ${karanam}
- ராகு காலம்: ${rahuKalam}
- சூரிய உதயம்: ~6:15 AM | சூரிய அஸ்தமனம்: ~6:05 PM (Chennai)
- கலி யுகம்: 5127 | தமிழ் ஆண்டு: குரோதி (Kurodhi)`;
}
