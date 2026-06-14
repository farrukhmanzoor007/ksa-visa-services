import { VisaTypeInfo } from '../types';

export const VISA_TYPES: VisaTypeInfo[] = [
  {
    id: 'tourist',
    name: 'Tourist Visa (eVisa)',
    title: 'Saudi Tourist eVisa',
    feeUsd: 120,
    processingTime: '24 - 72 Hours',
    validity: '1 Year (Multiple Entries)',
    entries: 'Multiple (Maximum 90 days stay per visit)',
    eligibility: 'Citizens of 60+ eligible countries (or those holding valid US, UK, or Schengen visas).',
    requiredDocuments: [
      'Valid passport (at least 6 months validity)',
      'Recent passport-sized photograph',
      'Proof of return flight ticket',
      'Hotel booking or accommodation address in Saudi Arabia'
    ],
    description: 'Perfect for recreation, family visits, or performing Umrah. Instant processing and quick electronic issuance.'
  },
  {
    id: 'transit',
    name: 'Transit / Stopover Visa',
    title: 'Stopover Transit Visa',
    feeUsd: 45,
    processingTime: 'Instant to 24 Hours',
    validity: '96 Hours (Single Entry)',
    entries: 'Single Entry',
    eligibility: 'All nationalities traveling with Saudi airlines (Saudia or Flynas) transit flights.',
    requiredDocuments: [
      'Valid passport (at least 6 months validity)',
      'Confirmed onward flight tickets',
      'Valid entry visa for the final destination country (if applicable)'
    ],
    description: 'Allows stopover transit travelers to enter Riyadh, Jeddah, or other cities for up to 96 hours. Ideal for quick sightseeing or Umrah.'
  },
  {
    id: 'hajj-umrah',
    name: 'Hajj & Umrah Visa',
    title: 'Official Umrah / Hajj Visa',
    feeUsd: 155,
    processingTime: '2 - 5 Business Days',
    validity: '90 Days (Single/Multiple options)',
    entries: 'Single (or Multiple depending on selection)',
    eligibility: 'Muslim pilgrims worldwide seeking detailed travel arrangements.',
    requiredDocuments: [
      'Valid passport (at least 6 months validity)',
      'Proof of meningitis and COVID-19 vaccinations',
      'Recent white-background passport photo',
      'Confirmed flight and hotel package bookings'
    ],
    description: 'Specially designed for religious tourism to Makkah and Madinah, including full support services and compliance with Ministry of Hajj requirements.'
  },
  {
    id: 'work',
    name: 'Employment / Work Visa',
    title: 'Saudi Work Visa',
    feeUsd: 220,
    processingTime: '10 - 15 Business Days',
    validity: '90 Days (Extendable with Residence Permit)',
    entries: 'Single (Becomes Multi with Iqama)',
    eligibility: 'Foreign nationals with a valid Saudi employer sponsor.',
    requiredDocuments: [
      'Valid passport with free pages',
      'Original employment contract and Ministry of Foreign Affairs invitation',
      'Comprehensive medical test report from certified clinic',
      'Attested educational certificate and police clearance certificate'
    ],
    description: 'Required for long-term employment within the Kingdom of Saudi Arabia under sponsorship of a registered entity.'
  },
  {
    id: 'student',
    name: 'Student Education Visa',
    title: 'Academic Student Visa',
    feeUsd: 90,
    processingTime: '5 - 10 Business Days',
    validity: 'Duration of Study',
    entries: 'Single / Multiple',
    eligibility: 'Students admitted to study at recognized Saudi universities or institutions.',
    requiredDocuments: [
      'Admission letter from a registered Saudi educational institution',
      'Original birth certificate and school transcripts',
      'Medical certificate clearing infectious diseases',
      'Parental consent / no-objection certificate for minors'
    ],
    description: 'Provides long-term stay permissions for international students looking to pursue higher academic programs in Saudi Arabia.'
  },
  {
    id: 'diplomatic',
    name: 'Diplomatic & Official visa',
    title: 'Diplomatic & Mission Visa',
    feeUsd: 0,
    processingTime: '3 - 5 Business Days',
    validity: 'As per Official Mission',
    entries: 'Multiple / Single',
    eligibility: 'Diplomats, officials, and staff of international organizations on active duty.',
    requiredDocuments: [
      'Diplomatic / Official passport',
      'Official note verbal from the Embassy, Mission, or Ministry of Foreign Affairs',
      'Letter of assignment / Invitation from Saudi authorities'
    ],
    description: 'Tailored for accredited diplomats, state representatives, and foreign official mission members visiting Saudi Arabia on state matters.'
  }
];

export const COUNTRIES_LIST = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Japan',
  'Singapore', 'Switzerland', 'Norway', 'Sweden', 'Italy', 'Spain', 'Netherlands', 'Belgium',
  'Austria', 'Denmark', 'Finland', 'New Zealand', 'South Korea', 'China', 'Malaysia',
  'India', 'Pakistan', 'Bangladesh', 'Egypt', 'Turkey', 'United Arab Emirates', 'Saudi Arabia', 'Qatar',
  'Kuwait', 'Oman', 'Bahrain', 'South Africa', 'Brazil', 'Argentina', 'Mexico'
].sort();
