'use strict';

/**
 * Seed 20 dummy Bengali news articles for Shotyodhara Protidin
 *
 * Usage:
 *   node scripts/seed-dummy-articles.js <admin-email> <admin-password>
 *
 * Example:
 *   node scripts/seed-dummy-articles.js admin@example.com MyPassword123
 */

const BASE_URL = 'http://localhost:1337';

const ADMIN_EMAIL    = process.argv[2] || process.env.STRAPI_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.argv[3] || process.env.STRAPI_ADMIN_PASSWORD;
// Optional: pass a pre-obtained JWT as 4th arg to skip the login step
const PRESET_JWT     = process.argv[4] || process.env.STRAPI_ADMIN_JWT;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('\n❌  Usage: node scripts/seed-dummy-articles.js <email> <password> [admin-jwt]\n');
  process.exit(1);
}

// ─── DATA ─────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { name: 'রাজনীতি',      nameEn: 'Politics',       slug: 'rajniti',    slugEn: 'politics',       isTrending: true,  isSidebar: true,  sortOrder: 1 },
  { name: 'অর্থনীতি',     nameEn: 'Economy',        slug: 'orthoniti',  slugEn: 'economy',        isTrending: true,  isSidebar: true,  sortOrder: 2 },
  { name: 'আন্তর্জাতিক', nameEn: 'International',  slug: 'antarjatik', slugEn: 'international',  isTrending: true,  isSidebar: true,  sortOrder: 3 },
  { name: 'খেলাধুলা',     nameEn: 'Sports',         slug: 'kheladhula', slugEn: 'sports',         isTrending: false, isSidebar: true,  sortOrder: 4 },
  { name: 'বিনোদন',       nameEn: 'Entertainment',  slug: 'binodon',    slugEn: 'entertainment',  isTrending: false, isSidebar: true,  sortOrder: 5 },
  { name: 'স্বাস্থ্য',    nameEn: 'Health',         slug: 'swasthya',   slugEn: 'health',         isTrending: false, isSidebar: true,  sortOrder: 6 },
  { name: 'প্রযুক্তি',    nameEn: 'Technology',     slug: 'projukti',   slugEn: 'technology',     isTrending: false, isSidebar: false, sortOrder: 7 },
  { name: 'শিক্ষা',       nameEn: 'Education',      slug: 'shikkha',    slugEn: 'education',      isTrending: false, isSidebar: false, sortOrder: 8 },
];

const AUTHORS = [
  { name: 'রাসেল আহমেদ',  display_name: 'রাসেল আহমেদ',  Slug: 'rasel-ahmed',  email: 'rasel@shottyodharaprotidin.com'  },
  { name: 'ফাতেমা বেগম',  display_name: 'ফাতেমা বেগম',  Slug: 'fatema-begum', email: 'fatema@shottyodharaprotidin.com' },
  { name: 'তারেক হাসান',  display_name: 'তারেক হাসান',  Slug: 'tarek-hasan',  email: 'tarek@shottyodharaprotidin.com'  },
];

// Picsum with stable seeds → same image every run
const img = (seed) => `https://picsum.photos/seed/${seed}/1200/800`;

const ARTICLES = [
  // ── 1 ── রাজনীতি ──────────────────────────────────────────────────────────
  {
    title:    'জাতীয় বাজেটে শিক্ষা ও স্বাস্থ্যে রেকর্ড বরাদ্দ',
    slug:     'jatiyo-bajete-shikkha-swasthye-record-boradd',
    excerpt:  'চলতি অর্থবছরের বাজেটে শিক্ষা ও স্বাস্থ্য খাতে গত বছরের তুলনায় ৩২ শতাংশ বেশি বরাদ্দ দেওয়া হয়েছে।',
    content:  `<p>চলতি ২০২৬-২৭ অর্থবছরের জাতীয় বাজেটে শিক্ষা ও স্বাস্থ্য খাতে রেকর্ড পরিমাণ বরাদ্দ দেওয়া হয়েছে। গত বছরের তুলনায় মোট বরাদ্দ ৩২ শতাংশ বৃদ্ধি পেয়েছে।</p><p>অর্থমন্ত্রী জানান, শিক্ষা খাতে এ বছর ৮৫ হাজার কোটি টাকা এবং স্বাস্থ্য খাতে ৪২ হাজার কোটি টাকা বরাদ্দ রাখা হয়েছে। এটি দেশের ইতিহাসে সর্বোচ্চ।</p><h2>বাজেটের মূল হাইলাইট</h2><p>নতুন বাজেটে সরকার মোট দেশজ উৎপাদনের (জিডিপি) ৬.৫ শতাংশ শিক্ষায় ব্যয় করার লক্ষ্যমাত্রা নির্ধারণ করেছে। বিশেষজ্ঞরা এই সিদ্ধান্তকে ইতিবাচক হিসেবে দেখছেন।</p><p>তবে বিরোধী দল মনে করছে, শুধু বরাদ্দ বাড়ালেই হবে না — সুষম বণ্টন ও স্বচ্ছতা নিশ্চিত করতে হবে।</p>`,
    categorySlug: 'rajniti',   authorSlug: 'rasel-ahmed',
    imageUrl: img('budget-parliament-dhaka'),
    isHeadline: true, isTopNews: true, isRecentPost: true,
  },
  // ── 2 ── অর্থনীতি ─────────────────────────────────────────────────────────
  {
    title:    'রেমিটেন্স প্রবাহে নতুন রেকর্ড, একমাসে ২৭০ কোটি ডলার',
    slug:     'remittance-probah-naya-record-270-koti-dollar',
    excerpt:  'এপ্রিল মাসে প্রবাসীরা দেশে পাঠিয়েছেন ২৭০ কোটি মার্কিন ডলার, যা ইতিহাসের সর্বোচ্চ।',
    content:  `<p>বাংলাদেশ ব্যাংকের তথ্য অনুযায়ী, গত এপ্রিল মাসে প্রবাসী বাংলাদেশিরা মোট ২৭০ কোটি মার্কিন ডলার রেমিটেন্স পাঠিয়েছেন — যা দেশের ইতিহাসে এক মাসে সর্বোচ্চ।</p><p>কেন্দ্রীয় ব্যাংকের গভর্নর বলেন, প্রণোদনা বৃদ্ধি ও বৈধ চ্যানেলে রেমিটেন্স পাঠানোর সুবিধা বাড়ানোর কারণেই এই রেকর্ড সম্ভব হয়েছে।</p><h2>কোন দেশ থেকে বেশি এসেছে</h2><p>মধ্যপ্রাচ্য, বিশেষত সৌদি আরব, সংযুক্ত আরব আমিরাত এবং কুয়েত থেকে সবচেয়ে বেশি রেমিটেন্স এসেছে। পাশাপাশি ইউরোপ ও আমেরিকা থেকেও উল্লেখযোগ্য পরিমাণ অর্থ এসেছে।</p><p>অর্থনীতিবিদরা বলছেন, এই ধারা অব্যাহত থাকলে বৈদেশিক মুদ্রার রিজার্ভ আরও শক্তিশালী হবে।</p>`,
    categorySlug: 'orthoniti', authorSlug: 'fatema-begum',
    imageUrl: img('remittance-money-economy'),
    isTopSlider: true, isEditorsChoice: true, isRecentPost: true,
  },
  // ── 3 ── খেলাধুলা (video) ─────────────────────────────────────────────────
  {
    title:    'বাংলাদেশ-ভারত সিরিজে টাইগারদের ঐতিহাসিক জয়',
    slug:     'bangladesh-india-series-tigers-jatiyo-joy',
    excerpt:  'শেরেবাংলা জাতীয় স্টেডিয়ামে তৃতীয় ওয়ানডেতে বাংলাদেশ ভারতকে ৮৭ রানে পরাজিত করেছে।',
    content:  `<p>বাংলাদেশ ক্রিকেট দল ঐতিহাসিক এক জয় পেয়েছে। শেরেবাংলা জাতীয় স্টেডিয়ামে অনুষ্ঠিত তৃতীয় ওয়ানডেতে ভারতকে ৮৭ রানে পরাজিত করে সিরিজ জিতেছে বাংলাদেশ।</p><p>বাংলাদেশ প্রথমে ব্যাট করে ৫০ ওভারে ৩২৪ রান সংগ্রহ করে। এর জবাবে ভারত মাত্র ২৩৭ রানে অলআউট হয়ে যায়।</p><h2>ম্যাচের সেরা পারফরমার</h2><p>বাংলাদেশের হয়ে সেঞ্চুরি করেন তানজিম হাসান সাকিব — ১০৬ বলে ১১৮ রানের অসাধারণ ইনিংস। বোলিংয়ে তাসকিন আহমেদ ৪ উইকেট নিয়ে ভারতকে গুঁড়িয়ে দেন।</p><p>পুরো দেশে উৎসবের আমেজ বিরাজ করছে। ঢাকার রাজপথে সমর্থকরা আনন্দ মিছিল করেছেন।</p>`,
    categorySlug: 'kheladhula', authorSlug: 'rasel-ahmed',
    imageUrl: img('cricket-stadium-green'),
    videoUrl: 'https://www.youtube.com/watch?v=GgqqqH11_R8',
    isTopNews: true, isMostRead: true, isRecentPost: true,
  },
  // ── 4 ── বিনোদন (video) ───────────────────────────────────────────────────
  {
    title:    'ঢালিউডের বহুল প্রতীক্ষিত সিনেমার ট্রেলার মুক্তি পেলো',
    slug:     'dhaliwood-bohol-cinema-trailer-mukti',
    excerpt:  'শাকিব খান অভিনীত "সোনার বাংলা" ট্রেলার ৪৮ ঘণ্টায় এক কোটি ভিউ অতিক্রম করেছে।',
    content:  `<p>বাংলাদেশের চলচ্চিত্র শিল্পে আরেকটি আলোচিত ঘটনা ঘটেছে। দেশের শীর্ষ অভিনেতা শাকিব খান অভিনীত "সোনার বাংলা" সিনেমার অফিশিয়াল ট্রেলার প্রকাশিত হয়েছে।</p><p>ইউটিউবে প্রকাশের মাত্র ৪৮ ঘণ্টার মধ্যে ট্রেলারটি এক কোটি ভিউ অতিক্রম করেছে — বাংলাদেশের ইতিহাসে যেকোনো সিনেমার সর্বোচ্চ রেকর্ড।</p><h2>কাহিনির পরিচিতি</h2><p>মুক্তিযুদ্ধের পটভূমিতে নির্মিত এই সিনেমায় শাকিব খান একজন তরুণ মুক্তিযোদ্ধার ভূমিকায় অভিনয় করেছেন। সিনেমাটি আসছে ঈদুল আযহায় মুক্তি পাচ্ছে।</p><p>সোশ্যাল মিডিয়ায় ট্রেলারটি নিয়ে ব্যাপক আলোচনা চলছে।</p>`,
    categorySlug: 'binodon',   authorSlug: 'fatema-begum',
    imageUrl: img('cinema-film-arts'),
    videoUrl: 'https://www.youtube.com/watch?v=kykTOGECEk8',
    isPopularNews: true, isMostRead: true,
  },
  // ── 5 ── আন্তর্জাতিক ──────────────────────────────────────────────────────
  {
    title:    'বাংলাদেশ-ভারত মধ্যে নতুন বাণিজ্য চুক্তি স্বাক্ষরিত',
    slug:     'bangladesh-india-naya-banijyo-chukthi-swakkhyarit',
    excerpt:  'ঢাকায় দ্বিপাক্ষিক বৈঠকে দুই দেশের মধ্যে ৫টি নতুন চুক্তি স্বাক্ষরিত হয়েছে।',
    content:  `<p>বাংলাদেশ ও ভারতের মধ্যে দ্বিপাক্ষিক বাণিজ্য সম্পর্ক জোরদার করতে ঢাকায় দুই দেশের বাণিজ্যমন্ত্রীর উপস্থিতিতে পাঁচটি গুরুত্বপূর্ণ চুক্তি স্বাক্ষরিত হয়েছে।</p><p>এই চুক্তিগুলির আওতায় বাংলাদেশি পণ্য ভারতে শুল্কমুক্ত প্রবেশাধিকার পাবে এবং ভারতীয় বিনিয়োগ বাংলাদেশে আরও উৎসাহিত হবে।</p><h2>চুক্তির মূল বিষয়</h2><p>চুক্তিগুলিতে তৈরি পোশাক, কৃষিপণ্য, ওষুধশিল্প ও তথ্যপ্রযুক্তি খাতে সহযোগিতা বৃদ্ধির পরিকল্পনা রয়েছে। বিশেষজ্ঞরা মনে করছেন, এই চুক্তি দুই দেশের বার্ষিক বাণিজ্য ২০ বিলিয়ন ডলারে উন্নীত করবে।</p>`,
    categorySlug: 'antarjatik', authorSlug: 'tarek-hasan',
    imageUrl: img('international-trade-summit'),
    isHeadline: true, isTopSlider: true,
  },
  // ── 6 ── স্বাস্থ্য ────────────────────────────────────────────────────────
  {
    title:    'ডেঙ্গু প্রতিরোধে সরকারের জরুরি সচেতনতা অভিযান শুরু',
    slug:     'dengue-protirodhe-shorkarer-joruri-shochetanota-abhijan',
    excerpt:  'স্বাস্থ্য অধিদপ্তর সারাদেশে বিশেষ মশক নিধন অভিযান ও জনসচেতনতামূলক কার্যক্রম শুরু করেছে।',
    content:  `<p>দেশব্যাপী ডেঙ্গুর প্রকোপ বৃদ্ধি পাওয়ায় স্বাস্থ্য অধিদপ্তর জরুরি সচেতনতা অভিযান শুরু করেছে। আজ থেকে সারাদেশে মশক নিধন কার্যক্রম চলবে।</p><p>স্বাস্থ্যমন্ত্রী জানান, এই সপ্তাহে দেশে ডেঙ্গু আক্রান্তের সংখ্যা ৫ হাজার ছাড়িয়েছে। পরিস্থিতি নিয়ন্ত্রণে রাখতে বিশেষ টাস্কফোর্স গঠন করা হয়েছে।</p><h2>সতর্কতামূলক পরামর্শ</h2><p>চিকিৎসকরা পরামর্শ দিচ্ছেন — বাড়ির আশেপাশে জমে থাকা পানি পরিষ্কার করুন, ফুলহাতা পোশাক পরুন এবং মশারি ব্যবহার করুন। জ্বর দেখা দিলে দ্রুত হাসপাতালে যান।</p>`,
    categorySlug: 'swasthya',   authorSlug: 'fatema-begum',
    imageUrl: img('health-hospital-medicine'),
    isRecentPost: true,
  },
  // ── 7 ── প্রযুক্তি (video) ────────────────────────────────────────────────
  {
    title:    'ঢাকায় ৫জি নেটওয়ার্কের পরীক্ষামূলক কার্যক্রম শুরু',
    slug:     'dhaka-5g-network-porikhamulok-karjokrom-shuru',
    excerpt:  'বিটিআরসি ঢাকার তিনটি এলাকায় ৫জি পরীক্ষামূলক সম্প্রচার শুরু করেছে।',
    content:  `<p>বাংলাদেশ ডিজিটাল প্রযুক্তির নতুন মাইলফলক অর্জন করলো। বাংলাদেশ টেলিযোগাযোগ নিয়ন্ত্রণ কমিশন (বিটিআরসি) রাজধানী ঢাকার তেজগাঁও, গুলশান ও মতিঝিলে পরীক্ষামূলকভাবে ৫জি সেবা চালু করেছে।</p><p>প্রযুক্তি প্রতিমন্ত্রী জানিয়েছেন, আগামী দুই বছরের মধ্যে সারাদেশে ৫জি নেটওয়ার্ক বিস্তৃত করার পরিকল্পনা রয়েছে।</p><h2>কী সুবিধা পাবেন ব্যবহারকারীরা</h2><p>৫জি নেটওয়ার্কে ডাউনলোড গতি হবে প্রতি সেকেন্ডে ১ গিগাবিট পর্যন্ত — বর্তমানের ৪জি-এর চেয়ে ১০ গুণ বেশি। এটি স্মার্ট সিটি, স্বাস্থ্যসেবা এবং শিল্প খাতে বিপ্লব আনবে।</p>`,
    categorySlug: 'projukti',   authorSlug: 'tarek-hasan',
    imageUrl: img('technology-5g-network'),
    videoUrl: 'https://www.youtube.com/watch?v=Nv5FLDCkbw4',
    isTechInnovation: true, isRecentPost: true,
  },
  // ── 8 ── শিক্ষা ───────────────────────────────────────────────────────────
  {
    title:    'এসএসসিতে সর্বোচ্চ পাসের হার, জিপিএ-৫ পেয়েছেন দুই লাখ শিক্ষার্থী',
    slug:     'ssc-sorbochcho-paser-har-gpa5-dui-lakh-shikkharhi',
    excerpt:  '২০২৬ সালের এসএসসিতে পাসের হার ৯২.৩৫ শতাংশ, জিপিএ-৫ পেয়েছেন ২ লাখ ১৮ হাজার পরীক্ষার্থী।',
    content:  `<p>২০২৬ সালের মাধ্যমিক স্কুল সার্টিফিকেট (এসএসসি) ও সমমান পরীক্ষার ফলাফল প্রকাশিত হয়েছে। পাসের হার ৯২.৩৫ শতাংশ — যা গত বছরের চেয়ে ২.৫ শতাংশ বেশি।</p><p>শিক্ষামন্ত্রী জানান, মোট ২১ লাখ পরীক্ষার্থীর মধ্যে ২ লাখ ১৮ হাজার জিপিএ-৫ পেয়েছেন। এটি দেশের ইতিহাসে সর্বোচ্চ।</p><h2>বোর্ড ভিত্তিক ফলাফল</h2><p>ঢাকা বোর্ডে পাসের হার ৯৫.৬ শতাংশ। কুমিল্লা বোর্ডে ৯৩.৮ শতাংশ। মাদ্রাসা বোর্ডেও এ বছর উল্লেখযোগ্য উন্নতি হয়েছে।</p>`,
    categorySlug: 'shikkha',    authorSlug: 'rasel-ahmed',
    imageUrl: img('students-education-exam'),
    isTopNews: true, isRecentPost: true,
  },
  // ── 9 ── রাজনীতি ──────────────────────────────────────────────────────────
  {
    title:    'সংসদে ডিজিটাল নিরাপত্তা আইন সংশোধনী বিল পাস',
    slug:     'shanshode-digital-nirapotha-ain-shongshodni-bill-pass',
    excerpt:  'জাতীয় সংসদে ডিজিটাল নিরাপত্তা আইনের বহুল আলোচিত সংশোধনী বিল ভোটের মাধ্যমে পাস হয়েছে।',
    content:  `<p>জাতীয় সংসদে দীর্ঘ আলোচনার পর ডিজিটাল নিরাপত্তা আইনের সংশোধনী বিল পাস হয়েছে। বিলটিতে নাগরিক স্বাধীনতা সংরক্ষণে বেশকিছু গুরুত্বপূর্ণ পরিবর্তন আনা হয়েছে।</p><p>আইনমন্ত্রী জানান, সংশোধনীতে সাংবাদিক ও মুক্তমনা লেখকদের সুরক্ষার ব্যবস্থা করা হয়েছে। মামলা দায়েরের ক্ষেত্রে আরও কঠোর শর্ত আরোপ করা হয়েছে।</p><h2>বিরোধী দলের মতামত</h2><p>বিরোধী দল বলেছে, সংশোধনী যথেষ্ট নয়। সুশীল সমাজের প্রতিনিধিরা আংশিক সন্তুষ্টি প্রকাশ করেছেন।</p>`,
    categorySlug: 'rajniti',    authorSlug: 'tarek-hasan',
    imageUrl: img('parliament-session-bangladesh'),
    isMiddleSlider: true, isRecentPost: true,
  },
  // ── 10 ── অর্থনীতি ────────────────────────────────────────────────────────
  {
    title:    'তৈরি পোশাক শিল্পে রপ্তানি ৫০ বিলিয়ন ডলার ছাড়াল',
    slug:     'tairi-poshak-shilpe-roptani-50-billion-dollar',
    excerpt:  'চলতি অর্থবছরে বাংলাদেশের তৈরি পোশাক রপ্তানি প্রথমবারের মতো ৫০ বিলিয়ন ডলারের মাইলফলক অতিক্রম করেছে।',
    content:  `<p>বাংলাদেশের পোশাক শিল্পে ঐতিহাসিক সাফল্য এসেছে। চলতি ২০২৫-২৬ অর্থবছরে তৈরি পোশাক রপ্তানি প্রথমবারের মতো ৫০ বিলিয়ন ডলারের মাইলফলক স্পর্শ করেছে।</p><p>বিজিএমইএ সভাপতি বলেন, বিশ্বের শীর্ষ ব্র্যান্ডগুলি এখন বাংলাদেশকে প্রাধান্য দিচ্ছে।</p><h2>মূল বাজার</h2><p>ইউরোপিয়ান ইউনিয়ন ও যুক্তরাষ্ট্রে রপ্তানি বেড়েছে যথাক্রমে ১৮% ও ২২%। জাপান ও কানাডাতেও উল্লেখযোগ্যভাবে বেড়েছে। শ্রমিক কল্যাণ উন্নতি ও কারখানার নিরাপত্তা মান বৃদ্ধি এই সাফল্যের পেছনে বড় ভূমিকা রেখেছে।</p>`,
    categorySlug: 'orthoniti',  authorSlug: 'fatema-begum',
    imageUrl: img('garment-factory-textile'),
    isEditorsChoice: true, isMostRead: true,
  },
  // ── 11 ── খেলাধুলা (video) ────────────────────────────────────────────────
  {
    title:    'আইসিসি চ্যাম্পিয়ন্স ট্রফির জন্য বাংলাদেশের ১৫ সদস্যের দল ঘোষণা',
    slug:     'icc-champions-trophy-bangladesh-squad-ghoshona',
    excerpt:  'আসন্ন আইসিসি চ্যাম্পিয়ন্স ট্রফির জন্য শাকিব আল হাসানের নেতৃত্বে ১৫ সদস্যের দল ঘোষণা।',
    content:  `<p>আসন্ন আইসিসি চ্যাম্পিয়ন্স ট্রফির জন্য বাংলাদেশ ক্রিকেট বোর্ড (বিসিবি) ১৫ সদস্যের জাতীয় দল ঘোষণা করেছে। শাকিব আল হাসানকে অধিনায়ক হিসেবে রাখা হয়েছে।</p><p>নতুন মুখ হিসেবে তরুণ পেসার মাহমুদুল হাসান জয় দলে সুযোগ পেয়েছেন। অভিজ্ঞ ব্যাটসম্যান মুশফিকুর রহিমও দলে ফিরেছেন।</p><h2>দলের শক্তি ও দুর্বলতা</h2><p>বিশেষজ্ঞরা মনে করছেন, এই স্কোয়াড বেশ ভারসাম্যপূর্ণ। টুর্নামেন্টটি পাকিস্তানে অনুষ্ঠিত হবে এবং বাংলাদেশ 'গ্রুপ বি'-তে অস্ট্রেলিয়া ও দক্ষিণ আফ্রিকার সাথে খেলবে।</p>`,
    categorySlug: 'kheladhula', authorSlug: 'rasel-ahmed',
    imageUrl: img('cricket-team-squad'),
    videoUrl: 'https://www.youtube.com/watch?v=4pnSl94ymRE',
    isTopSlider: true, isPopularNews: true,
  },
  // ── 12 ── বিনোদন (video) ──────────────────────────────────────────────────
  {
    title:    'দেশের জনপ্রিয় শিল্পীর নতুন অ্যালবাম "আমার মাটি" প্রকাশ',
    slug:     'jonopriyo-shilpir-naya-album-amar-mati-prokash',
    excerpt:  'কণ্ঠশিল্পী মমতাজের নতুন অ্যালবাম "আমার মাটি" প্রথম দিনেই সোশ্যাল মিডিয়ায় ভাইরাল।',
    content:  `<p>বাংলাদেশের বরেণ্য কণ্ঠশিল্পী মমতাজের নতুন অ্যালবাম "আমার মাটি" প্রকাশিত হয়েছে। অ্যালবামে মোট ১০টি গান রয়েছে — বেশিরভাগই বাংলাদেশের প্রকৃতি ও মানুষের জীবন নিয়ে।</p><p>"নদীর তীরে", "মায়ের কোল" ও "সোনার বাংলা" গানগুলি ইতোমধ্যে শ্রোতাদের মধ্যে অত্যন্ত জনপ্রিয় হয়ে উঠেছে।</p><h2>কনসার্টের ঘোষণা</h2><p>আগামী মাসে ঢাকার বঙ্গবন্ধু আন্তর্জাতিক সম্মেলন কেন্দ্রে বিশেষ কনসার্টের আয়োজন করা হবে। টিকিট অনলাইনে পাওয়া যাচ্ছে।</p>`,
    categorySlug: 'binodon',    authorSlug: 'fatema-begum',
    imageUrl: img('music-concert-stage'),
    videoUrl: 'https://www.youtube.com/watch?v=DyDfgMOUjCI',
    isMostRead: true, isPopularNews: true,
  },
  // ── 13 ── আন্তর্জাতিক ─────────────────────────────────────────────────────
  {
    title:    'জাতিসংঘ সাধারণ পরিষদে বাংলাদেশের জলবায়ু প্রস্তাব সর্বসম্মতিক্রমে গৃহীত',
    slug:     'jatisangh-shadaron-porishode-bangladesher-jolbayu-prostab-grahit',
    excerpt:  'জলবায়ু পরিবর্তনের ক্ষতিপূরণ সংক্রান্ত বাংলাদেশের প্রস্তাব ১৫৩টি দেশের সমর্থনে গৃহীত হয়েছে।',
    content:  `<p>নিউ ইয়র্কে জাতিসংঘ সাধারণ পরিষদের বিশেষ অধিবেশনে বাংলাদেশের উত্থাপিত জলবায়ু পরিবর্তনের ক্ষতিপূরণ সংক্রান্ত প্রস্তাব ১৫৩টি দেশের সমর্থনে গৃহীত হয়েছে।</p><p>পররাষ্ট্রমন্ত্রী এই সাফল্যকে বাংলাদেশের কূটনৈতিক ইতিহাসে একটি মাইলফলক বলেছেন।</p><h2>প্রস্তাবের মূল বিষয়</h2><p>প্রস্তাবে উন্নত দেশগুলিকে জলবায়ু ক্ষতিগ্রস্ত উন্নয়নশীল দেশগুলিকে বার্ষিক ১০০ বিলিয়ন ডলার ক্ষতিপূরণ দেওয়ার আহ্বান জানানো হয়েছে।</p>`,
    categorySlug: 'antarjatik', authorSlug: 'tarek-hasan',
    imageUrl: img('united-nations-world'),
    isTopNews: true, isHeadline: true,
  },
  // ── 14 ── স্বাস্থ্য ───────────────────────────────────────────────────────
  {
    title:    'ঢাকায় আধুনিক ক্যান্সার হাসপাতাল উদ্বোধন করলেন প্রধানমন্ত্রী',
    slug:     'dhaka-adhunik-cancer-hospital-uddhabon-prodhanmontri',
    excerpt:  'মিরপুরে নির্মিত ৫০০ শয্যা বিশিষ্ট ক্যান্সার বিশেষায়িত হাসপাতাল প্রধানমন্ত্রী উদ্বোধন করেছেন।',
    content:  `<p>রাজধানীর মিরপুরে নির্মিত ৫০০ শয্যা বিশিষ্ট আধুনিক ক্যান্সার হাসপাতাল আজ প্রধানমন্ত্রী উদ্বোধন করেছেন। এটি দক্ষিণ-পূর্ব এশিয়ার অন্যতম আধুনিক ক্যান্সার চিকিৎসা কেন্দ্র।</p><p>হাসপাতালটিতে সর্বাধুনিক রেডিওথেরাপি, কেমোথেরাপি ও ইমিউনোথেরাপি সুবিধা রয়েছে। বাংলাদেশে প্রথমবারের মতো রোবোটিক সার্জারির ব্যবস্থা করা হয়েছে।</p><h2>বিনামূল্যে সেবার ব্যবস্থা</h2><p>দরিদ্র ও অসহায় রোগীদের জন্য বিশেষ কোটায় বিনামূল্যে চিকিৎসার ব্যবস্থা থাকবে।</p>`,
    categorySlug: 'swasthya',   authorSlug: 'rasel-ahmed',
    imageUrl: img('hospital-medical-center'),
    isRecentPost: true, isMiddleSlider: true,
  },
  // ── 15 ── প্রযুক্তি ───────────────────────────────────────────────────────
  {
    title:    'আর্টিফিশিয়াল ইন্টেলিজেন্স ব্যবহারে বাংলাদেশ দক্ষিণ এশিয়ায় শীর্ষে',
    slug:     'ai-intelligence-bangladesh-south-asia-top',
    excerpt:  'কৃষি ও স্বাস্থ্য খাতে এআই প্রযুক্তির ব্যবহারে বাংলাদেশ দক্ষিণ এশিয়ায় শীর্ষস্থানে।',
    content:  `<p>একটি আন্তর্জাতিক গবেষণা প্রতিষ্ঠানের সমীক্ষায় দেখা গেছে, কৃষি ও স্বাস্থ্য খাতে কৃত্রিম বুদ্ধিমত্তা (এআই) ব্যবহারে বাংলাদেশ দক্ষিণ এশিয়ার দেশগুলির মধ্যে শীর্ষে।</p><p>বিশেষত কৃষি খাতে এআই ব্যবহার করে ফসলের রোগ শনাক্তকরণ ও পূর্বাভাস প্রদানে বাংলাদেশ উল্লেখযোগ্য সাফল্য পেয়েছে।</p><h2>সরকারি উদ্যোগ</h2><p>তথ্যপ্রযুক্তি মন্ত্রণালয় জানায়, "এআই বাংলাদেশ ২০৩০" নামে একটি জাতীয় কর্মপরিকল্পনায় ১০ লাখ তরুণকে প্রশিক্ষণ দেওয়ার লক্ষ্য রয়েছে।</p>`,
    categorySlug: 'projukti',   authorSlug: 'tarek-hasan',
    imageUrl: img('artificial-intelligence-future'),
    isTechInnovation: true, isEditorsChoice: true,
  },
  // ── 16 ── শিক্ষা ──────────────────────────────────────────────────────────
  {
    title:    'বিশ্ববিদ্যালয় ভর্তি পরীক্ষার সমন্বিত ফলাফল প্রকাশ',
    slug:     'bishwavidyalay-bhrti-poriksha-shomonwit-fol-prokash',
    excerpt:  'গুচ্ছ পদ্ধতিতে অনুষ্ঠিত বিশ্ববিদ্যালয় ভর্তি পরীক্ষার ফলাফল প্রকাশ, ২ লাখ আসনে ১২ লাখ আবেদন।',
    content:  `<p>গুচ্ছ পদ্ধতিতে অনুষ্ঠিত বিশ্ববিদ্যালয় ভর্তি পরীক্ষার চূড়ান্ত ফলাফল আজ প্রকাশিত হয়েছে। মোট ২ লাখ আসনের বিপরীতে এ বছর ১২ লাখ শিক্ষার্থী আবেদন করেছিলেন।</p><p>বিশ্ববিদ্যালয় মঞ্জুরী কমিশনের চেয়ারম্যান জানান, এ বছর মেধাতালিকায় ছাত্রীদের সংখ্যা ছাত্রদের চেয়ে বেশি।</p><h2>ভর্তির পরবর্তী ধাপ</h2><p>আগামী সপ্তাহে অনলাইনে পছন্দের বিশ্ববিদ্যালয় ও বিভাগ নির্বাচন করতে হবে। ঢাকা বিশ্ববিদ্যালয়, বুয়েট ও চট্টগ্রাম বিশ্ববিদ্যালয়ে সবচেয়ে বেশি প্রতিযোগিতা দেখা গেছে।</p>`,
    categorySlug: 'shikkha',    authorSlug: 'rasel-ahmed',
    imageUrl: img('university-campus-education'),
    isRecentPost: true, isMostRead: true,
  },
  // ── 17 ── রাজনীতি ─────────────────────────────────────────────────────────
  {
    title:    'মন্ত্রিসভার বিশেষ বৈঠকে ১২টি মেগা প্রকল্প অনুমোদন',
    slug:     'monatrishobhar-bishesh-boithake-12ti-mega-project-onumodon',
    excerpt:  'প্রধানমন্ত্রীর সভাপতিত্বে মন্ত্রিসভার বিশেষ বৈঠকে মোট ২ লাখ কোটি টাকার ১২টি মেগা প্রকল্প অনুমোদন।',
    content:  `<p>প্রধানমন্ত্রীর সভাপতিত্বে আজ অনুষ্ঠিত মন্ত্রিসভার বিশেষ বৈঠকে মোট ২ লাখ কোটি টাকা ব্যয়ের ১২টি মেগা প্রকল্প অনুমোদন দেওয়া হয়েছে।</p><p>মন্ত্রিপরিষদ সচিব জানান, অনুমোদিত প্রকল্পগুলির মধ্যে ঢাকা মেট্রোরেলের তৃতীয় লাইন, চট্টগ্রাম গভীর সমুদ্রবন্দর সম্প্রসারণ ও পদ্মা সেতু রেললিংক প্রকল্প অন্যতম।</p><h2>মূল প্রকল্পসমূহ</h2><p>ঢাকা মেট্রোরেল লাইন-৫ নির্মাণে বরাদ্দ থাকবে ৬৫ হাজার কোটি টাকা। চট্টগ্রাম গভীর সমুদ্রবন্দরে বরাদ্দ হবে ৪৮ হাজার কোটি টাকা।</p>`,
    categorySlug: 'rajniti',    authorSlug: 'fatema-begum',
    imageUrl: img('government-cabinet-meeting'),
    isMiddleSlider: true, isTopSlider: true,
  },
  // ── 18 ── অর্থনীতি (video) ────────────────────────────────────────────────
  {
    title:    'শেয়ার বাজারে টানা সপ্তম দিন সূচকের ঊর্ধ্বগতি',
    slug:     'sheyar-bajare-tana-shotom-din-suchaker-urdhogati',
    excerpt:  'ঢাকা স্টক এক্সচেঞ্জে (ডিএসই) সপ্তাহব্যাপী ঊর্ধ্বমুখী বাজারে ডিএসইএক্স সূচক ৬,৮০০ পয়েন্ট অতিক্রম করেছে।',
    content:  `<p>ঢাকা স্টক এক্সচেঞ্জে (ডিএসই) ইতিবাচক ধারা অব্যাহত রয়েছে। টানা সপ্তম কার্যদিবসে ডিএসইএক্স সূচক উল্লেখযোগ্য বৃদ্ধি পেয়ে ৬,৮০০ পয়েন্ট ছাড়িয়েছে।</p><p>আজ বাজার বন্ধে সূচক ৮৫ পয়েন্ট বেড়ে ৬,৮৪৩ পয়েন্টে দাঁড়িয়েছে। লেনদেন হয়েছে ১,২৩০ কোটি টাকা।</p><h2>কোন খাতে বেশি বেড়েছে</h2><p>ব্যাংকিং খাতে সূচক ৩.২% বৃদ্ধি পেয়েছে। মুদ্রাস্ফীতি নিয়ন্ত্রণে আসা ও সুদের হার স্থিতিশীল হওয়ায় বাজারে ইতিবাচক প্রভাব পড়েছে।</p>`,
    categorySlug: 'orthoniti',  authorSlug: 'tarek-hasan',
    imageUrl: img('stock-market-finance'),
    videoUrl: 'https://www.youtube.com/watch?v=Rx6yHUiI0rg',
    isMostRead: true, isRecentPost: true,
  },
  // ── 19 ── খেলাধুলা (video) ────────────────────────────────────────────────
  {
    title:    'বঙ্গবন্ধু গোল্ড কাপ ফুটবলে চ্যাম্পিয়ন হলো বাংলাদেশ',
    slug:     'bongobondhu-gold-cup-football-champion-bangladesh',
    excerpt:  'বঙ্গবন্ধু আন্তর্জাতিক গোল্ড কাপের ফাইনালে নেপালকে ২-১ গোলে হারিয়ে শিরোপা জিতেছে বাংলাদেশ।',
    content:  `<p>বঙ্গবন্ধু আন্তর্জাতিক গোল্ড কাপ ফুটবল টুর্নামেন্টের ফাইনালে নেপালকে ২-১ গোলে হারিয়ে চ্যাম্পিয়ন হয়েছে বাংলাদেশ জাতীয় ফুটবল দল।</p><p>ঢাকার বঙ্গবন্ধু জাতীয় স্টেডিয়ামে ৫০ হাজার দর্শকের সামনে রোমাঞ্চকর এই ম্যাচে বাংলাদেশের হয়ে গোল করেন সুমন রেজা ও নাসিম।</p><h2>ম্যাচের বিবরণ</h2><p>প্রথমার্ধে ১-১ সমতায় শেষ হওয়ার পর দ্বিতীয়ার্ধের ৭৮তম মিনিটে নাসিমের করা গোলটি বাংলাদেশকে জয়ের পথে নিয়ে যায়। ফুটবল ফেডারেশন চ্যাম্পিয়ন দলকে ৫০ লাখ টাকা পুরস্কার দেওয়ার ঘোষণা দিয়েছেন।</p>`,
    categorySlug: 'kheladhula', authorSlug: 'rasel-ahmed',
    imageUrl: img('football-sport-stadium'),
    videoUrl: 'https://www.youtube.com/watch?v=5qap5aO4i9A',
    isPopularNews: true, isHeadline: true,
  },
  // ── 20 ── বিনোদন (video) ──────────────────────────────────────────────────
  {
    title:    'ঈদুল আযহায় বিটিভিতে বিশেষ নাটক ও চলচ্চিত্র প্রচারের ঘোষণা',
    slug:     'eidul-azha-btv-bishesh-natok-cholochitro-ghoshona',
    excerpt:  'বাংলাদেশ টেলিভিশন (বিটিভি) ঈদুল আযহা উপলক্ষে ৭ দিনের বিশেষ অনুষ্ঠান সূচি প্রকাশ করেছে।',
    content:  `<p>আসন্ন ঈদুল আযহা উপলক্ষে বাংলাদেশ টেলিভিশন (বিটিভি) ৭ দিনের বিশেষ অনুষ্ঠান সূচি প্রকাশ করেছে। এ বছর ঈদে মোট ১৫টি বিশেষ নাটক, ৩টি টেলিফিল্ম ও ৫টি বিনোদনমূলক অনুষ্ঠান প্রচারিত হবে।</p><p>বিটিভির মহাপরিচালক জানান, দেশের শীর্ষস্থানীয় অভিনেতা-অভিনেত্রীরা এই বিশেষ অনুষ্ঠানগুলিতে অংশ নিয়েছেন।</p><h2>জনপ্রিয় তারকাদের নাটক</h2><p>চঞ্চল চৌধুরী, মোশাররফ করিম ও নিপুণ অভিনীত বিশেষ নাটকগুলি দর্শকদের মধ্যে ব্যাপক সাড়া ফেলবে বলে আশা করা হচ্ছে। ঈদের দিন রাত ৯টায় শাকিব খান অভিনীত নতুন চলচ্চিত্র প্রচারিত হবে।</p>`,
    categorySlug: 'binodon',    authorSlug: 'fatema-begum',
    imageUrl: img('eid-festival-celebration'),
    videoUrl: 'https://www.youtube.com/watch?v=GgqqqH11_R8',
    isTopSlider: true, isEditorsChoice: true,
  },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

async function getAdminJWT() {
  if (PRESET_JWT) {
    console.log('✓ Using pre-supplied JWT token');
    return PRESET_JWT;
  }
  const res  = await fetch(`${BASE_URL}/admin/login`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  const data = await res.json();
  if (!data.data?.token) throw new Error('Login failed: ' + JSON.stringify(data));
  console.log('✓ Logged in as admin');
  return data.data.token;
}

async function adminPost(path, body, token) {
  const res  = await fetch(`${BASE_URL}${path}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body:    JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error(`  ✗ POST ${path} → ${res.status}:`, JSON.stringify(data?.error || data).slice(0, 200));
    return null;
  }
  return data;
}

// Create a temporary full-access API token so we can upload files via /api/upload
async function createTempApiToken(adminToken) {
  const res  = await fetch(`${BASE_URL}/admin/api-tokens`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body:    JSON.stringify({ name: 'seed-script-temp', description: 'Temp seed token', type: 'full-access', lifespan: null }),
  });
  const data = await res.json();
  if (!res.ok || !data.data?.accessKey) {
    console.warn('  ⚠  Could not create API token for uploads:', JSON.stringify(data?.error).slice(0, 150));
    return null;
  }
  console.log('  ✓ Temp full-access API token created');
  return data.data.accessKey;
}

async function deleteApiToken(adminToken, tokenId) {
  await fetch(`${BASE_URL}/admin/api-tokens/${tokenId}`, {
    method:  'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
}

async function uploadImageFromUrl(imageUrl, filename, uploadToken) {
  if (!uploadToken) return null;
  try {
    const imgRes  = await fetch(imageUrl);
    const buffer  = await imgRes.arrayBuffer();
    const blob    = new Blob([buffer], { type: 'image/jpeg' });
    const form    = new FormData();
    form.append('files', blob, filename);

    const res  = await fetch(`${BASE_URL}/api/upload`, {
      method:  'POST',
      headers: { Authorization: `Bearer ${uploadToken}` },
      body:    form,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(data).slice(0, 200));
    return Array.isArray(data) ? data[0] : data;
  } catch (err) {
    console.error(`  ✗ Upload ${filename}: ${err.message}`);
    return null;
  }
}

// ─── CREATORS ─────────────────────────────────────────────────────────────────

async function adminGet(path, token) {
  const res  = await fetch(`${BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) return null;
  return data;
}

async function findCategoryBySlug(token, slug) {
  const data = await adminGet(
    `/content-manager/collection-types/api::category.category?locale=bn-BD&filters[slug][$eq]=${slug}&pageSize=1`,
    token
  );
  const results = data?.results ?? data?.data ?? [];
  return results.length > 0 ? results[0] : null;
}

async function findAuthorBySlug(token, slug) {
  const data = await adminGet(
    `/content-manager/collection-types/api::author.author?locale=bn-BD&filters[Slug][$eq]=${slug}&pageSize=1`,
    token
  );
  const results = data?.results ?? data?.data ?? [];
  return results.length > 0 ? results[0] : null;
}

async function createOrGetCategory(token, cat) {
  const result = await adminPost(
    '/content-manager/collection-types/api::category.category?locale=bn-BD',
    cat, token
  );
  const doc = result?.data ?? result;
  if (doc?.id != null) return doc;
  // Already exists — fetch it
  return findCategoryBySlug(token, cat.slug);
}

async function createOrGetAuthor(token, author) {
  const result = await adminPost(
    '/content-manager/collection-types/api::author.author?locale=bn-BD',
    author, token
  );
  const doc = result?.data ?? result;
  if (doc?.id != null) return doc;
  // Already exists — fetch it
  return findAuthorBySlug(token, author.Slug);
}

async function createAndPublishArticle(token, payload) {
  // Step 1: create draft
  const result = await adminPost(
    '/content-manager/collection-types/api::article.article?locale=bn-BD',
    payload, token
  );
  const doc = result?.data ?? result;
  if (!doc?.documentId) return null;

  // Step 2: publish
  const published = await adminPost(
    `/content-manager/collection-types/api::article.article/${doc.documentId}/actions/publish`,
    {}, token
  );
  return published?.data ?? published ?? doc;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  try {
    const token = await getAdminJWT();

    // 1. Categories
    console.log('\n📁 Creating/fetching categories...');
    console.log('   (English locale auto-created by Strapi lifecycle hook)');
    const catMap = {};
    for (const cat of CATEGORIES) {
      const doc = await createOrGetCategory(token, cat);
      if (doc?.id != null) {
        catMap[cat.slug] = doc.id;
        console.log(`  ✓ ${cat.name}  →  ${cat.nameEn}  [id=${doc.id}]`);
      }
    }

    // 2. Authors
    console.log('\n👤 Creating/fetching authors...');
    const authorMap = {};
    for (const author of AUTHORS) {
      const doc = await createOrGetAuthor(token, author);
      if (doc?.id != null) {
        authorMap[author.Slug] = doc.id;
        console.log(`  ✓ ${author.name}  [id=${doc.id}]`);
      }
    }

    // 3. Create a temp full-access API token for file uploads
    console.log('\n🔑 Creating temp API token for uploads...');
    const tempApiTokenData = await (async () => {
      const res  = await fetch(`${BASE_URL}/admin/api-tokens`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ name: 'seed-script-temp-' + Date.now(), description: 'Temp', type: 'full-access', lifespan: null }),
      });
      return res.json();
    })();
    const uploadToken    = tempApiTokenData?.data?.accessKey ?? null;
    const tempTokenId    = tempApiTokenData?.data?.id ?? null;
    if (uploadToken) console.log('  ✓ Upload token ready');
    else             console.warn('  ⚠  Upload token failed — articles will have no cover images');

    // 4. Articles
    console.log('\n📰 Creating articles...');
    let ok = 0;
    for (let i = 0; i < ARTICLES.length; i++) {
      const art = ARTICLES[i];
      process.stdout.write(`  [${i + 1}/20] ${art.title.substring(0, 45)}... `);

      // Upload cover image from Picsum using the full-access API token
      let coverId = null;
      const file = await uploadImageFromUrl(art.imageUrl, `cover-${i + 1}.jpg`, uploadToken);
      if (file?.id) coverId = file.id;

      // Build payload
      const payload = {
        title:           art.title,
        slug:            art.slug,
        excerpt:         art.excerpt  || '',
        content:         art.content,
        videoUrl:        art.videoUrl || null,
        isHeadline:      art.isHeadline      || false,
        isTopNews:       art.isTopNews       || false,
        isTopSlider:     art.isTopSlider     || false,
        isMiddleSlider:  art.isMiddleSlider  || false,
        isMostRead:      art.isMostRead      || false,
        isPopularNews:   art.isPopularNews   || false,
        isTechInnovation:art.isTechInnovation|| false,
        isEditorsChoice: art.isEditorsChoice || false,
        isRecentPost:    art.isRecentPost    || false,
        isRecentReview:  art.isRecentReview  || false,
      };

      // Relations: Strapi v5 content-manager uses connect with documentId
      if (coverId) {
        payload.cover = { connect: [{ id: coverId }], disconnect: [] };
      }
      if (catMap[art.categorySlug]) {
        payload.category = { connect: [{ id: catMap[art.categorySlug] }], disconnect: [] };
      }
      if (authorMap[art.authorSlug]) {
        payload.author = { connect: [{ id: authorMap[art.authorSlug] }], disconnect: [] };
      }

      const doc = await createAndPublishArticle(token, payload);
      if (doc?.documentId) {
        console.log(`✓ published`);
        ok++;
      } else {
        console.log(`✗ failed`);
      }
    }

    // Clean up temp API token
    if (tempTokenId) {
      await deleteApiToken(token, tempTokenId);
      console.log('  🗑  Temp API token deleted');
    }

    console.log(`\n✅  Done!  ${CATEGORIES.length} categories · ${AUTHORS.length} authors · ${ok}/20 articles published\n`);
  } catch (err) {
    console.error('\nFatal error:', err);
    process.exit(1);
  }
}

main();
