const fs = require('node:fs');
const path = require('node:path');

const base = path.join(
  process.cwd(),
  'node_modules/@strapi/admin/dist/admin/admin/src/translations'
);
const strapiAppBase = path.join(
  process.cwd(),
  'node_modules/@strapi/admin/dist/admin/admin/src'
);

// ── 1. Patch languageNativeNames (.js and .mjs) ──────────────────────────────
const bnEntry = `    bn: 'বাংলা'`;

for (const ext of ['js', 'mjs']) {
  const file = path.join(base, `languageNativeNames.${ext}`);
  if (!fs.existsSync(file)) continue;

  let src = fs.readFileSync(file, 'utf8');
  if (src.includes("bn:")) {
    console.log(`languageNativeNames.${ext} already patched`);
    continue;
  }

  src = src.replace(
    /(\s+hi:\s*['"]हिन्दी['"])/,
    `$1,\n${bnEntry}`
  );
  fs.writeFileSync(file, src, 'utf8');
  console.log(`Patched languageNativeNames.${ext}`);
}

// ── 2. Write bn.json translations ────────────────────────────────────────────
const bnTranslations = {
  "Analytics": "বিশ্লেষণ",
  "Documentation": "ডকুমেন্টেশন",
  "Email": "ইমেইল",
  "Password": "পাসওয়ার্ড",
  "Provider": "প্রদানকারী",
  "Role": "ভূমিকা",
  "Username": "ব্যবহারকারীর নাম",
  "Users": "ব্যবহারকারীরা",
  "or": "অথবা",
  "submit": "জমা দিন",
  "Auth.components.Oops.text": "আপনার অ্যাকাউন্ট স্থগিত করা হয়েছে।",
  "Auth.components.Oops.text.admin": "যদি এটি ভুল হয়, অনুগ্রহ করে আপনার প্রশাসকের সাথে যোগাযোগ করুন।",
  "Auth.components.Oops.title": "ওহ...",
  "Auth.form.button.forgot-password": "ইমেইল পাঠান",
  "Auth.form.button.go-home": "হোমে ফিরে যান",
  "Auth.form.button.login": "লগ ইন করুন",
  "Auth.form.button.login.providers.error": "নির্বাচিত প্রদানকারীর মাধ্যমে সংযোগ করা সম্ভব হয়নি।",
  "Auth.form.button.login.strapi": "Strapi এর মাধ্যমে লগ ইন করুন",
  "Auth.form.button.password-recovery": "পাসওয়ার্ড পুনরুদ্ধার",
  "Auth.form.button.register": "শুরু করা যাক",
  "Auth.form.confirmPassword.label": "পাসওয়ার্ড নিশ্চিত করুন",
  "Auth.form.currentPassword.label": "বর্তমান পাসওয়ার্ড",
  "Auth.form.email.label": "ইমেইল",
  "Auth.form.email.placeholder": "যেমন: kai@doe.com",
  "Auth.form.error.blocked": "আপনার অ্যাকাউন্ট প্রশাসক দ্বারা ব্লক করা হয়েছে",
  "Auth.form.error.email.invalid": "ইমেইল অবৈধ।",
  "Auth.form.error.email.provide": "অনুগ্রহ করে আপনার ইমেইল প্রদান করুন।",
  "Auth.form.error.invalid": "পরিচয়পত্র বা পাসওয়ার্ড অবৈধ।",
  "Auth.form.error.password.matching": "পাসওয়ার্ড মিলছে না।",
  "Auth.form.error.password.provide": "অনুগ্রহ করে আপনার পাসওয়ার্ড প্রদান করুন।",
  "Auth.form.error.ratelimit": "অনেক বেশি চেষ্টা, অনুগ্রহ করে এক মিনিটে আবার চেষ্টা করুন।",
  "Auth.form.error.user.not-exist": "এই ইমেইলটি বিদ্যমান নেই।",
  "Auth.form.firstname.label": "প্রথম নাম",
  "Auth.form.firstname.placeholder": "যেমন: রাহুল",
  "Auth.form.forgot-password.email.label": "আপনার ইমেইল লিখুন",
  "Auth.form.forgot-password.email.label.success": "ইমেইল সফলভাবে পাঠানো হয়েছে",
  "Auth.form.lastname.label": "শেষ নাম",
  "Auth.form.lastname.placeholder": "যেমন: ইসলাম",
  "Auth.form.password.hide-password": "পাসওয়ার্ড লুকান",
  "Auth.form.password.hint": "কমপক্ষে ৮টি অক্ষর, ১টি বড় হাতের, ১টি ছোট হাতের এবং ১টি সংখ্যা থাকতে হবে",
  "Auth.form.password.label": "পাসওয়ার্ড",
  "Auth.form.password.show-password": "পাসওয়ার্ড দেখান",
  "Auth.form.rememberMe.label": "আমাকে মনে রাখুন",
  "Auth.form.username.label": "ব্যবহারকারীর নাম",
  "Auth.form.welcome.subtitle": "আপনার অ্যাকাউন্টে লগ ইন করুন",
  "Auth.form.welcome.title": "অ্যাডমিন পোর্টালে স্বাগতম",
  "Auth.link.forgot-password": "পাসওয়ার্ড ভুলে গেছেন?",
  "Auth.link.ready": "সাইন ইন করতে প্রস্তুত?",
  "Auth.link.signin": "সাইন ইন করুন",
  "Auth.link.signin.account": "ইতিমধ্যে একটি অ্যাকাউন্ট আছে?",
  "Auth.reset-password.title": "পাসওয়ার্ড রিসেট",
  "Content Manager": "কন্টেন্ট ম্যানেজার",
  "Content Type Builder": "কন্টেন্ট টাইপ বিল্ডার",
  "Media Library": "মিডিয়া লাইব্রেরি",
  "New entry": "নতুন এন্ট্রি",
  "Roles & Permissions": "ভূমিকা এবং অনুমতি",
  "Settings.PageTitle": "সেটিংস - {name}",
  "Settings.application.title": "ওভারভিউ",
  "Settings.application.description": "অ্যাডমিন প্যানেলের বৈশ্বিক তথ্য",
  "Settings.apiTokens.title": "API টোকেন",
  "Settings.apiTokens.addNewToken": "নতুন API টোকেন যোগ করুন",
  "Settings.apiTokens.create": "নতুন API টোকেন তৈরি করুন",
  "app.components.LeftMenu.navbrand.title": "সত্যধারা প্রতিদিন",
  "app.components.LeftMenu.navbrand.workplace": "কর্মক্ষেত্র",
  "app.components.LeftMenu.general": "সাধারণ",
  "app.components.LeftMenu.plugins": "প্লাগইন",
  "app.components.LeftMenu.settings": "সেটিংস",
  "app.components.NotFoundPage.title": "পৃষ্ঠা পাওয়া যায়নি",
  "app.components.NotFoundPage.description": "আপনি যে পৃষ্ঠাটি খুঁজছেন তা বিদ্যমান নেই।",
  "global.save": "সংরক্ষণ করুন",
  "global.cancel": "বাতিল করুন",
  "global.delete": "মুছুন",
  "global.edit": "সম্পাদনা করুন",
  "global.back": "ফিরে যান",
  "global.search": "অনুসন্ধান করুন",
  "global.loading": "লোড হচ্ছে...",
  "global.yes": "হ্যাঁ",
  "global.no": "না",
  "global.confirm": "নিশ্চিত করুন",
  "global.add": "যোগ করুন",
  "global.create": "তৈরি করুন",
  "global.publish": "প্রকাশ করুন",
  "global.unpublish": "অপ্রকাশিত করুন",
  "global.duplicate": "নকল করুন",
  "global.filters": "ফিল্টার",
  "global.settings": "সেটিংস"
};

const bnJsonJs = path.join(base, 'bn.json.js');
fs.writeFileSync(bnJsonJs, `'use strict';\n\nObject.defineProperty(exports, '__esModule', { value: true });\n\nvar bn = ${JSON.stringify(bnTranslations, null, 2)};\n\nexports["default"] = bn;\n`, 'utf8');
console.log('Written bn.json.js');

const bnJsonMjs = path.join(base, 'bn.json.mjs');
fs.writeFileSync(bnJsonMjs, `var bn = ${JSON.stringify(bnTranslations, null, 2)};\n\nexport { bn as default };\n`, 'utf8');
console.log('Written bn.json.mjs');

// ── 3. Patch StrapiApp.js to add bn case to dynamic import switch ─────────────
const strapiAppJs = path.join(strapiAppBase, 'StrapiApp.js');
if (fs.existsSync(strapiAppJs)) {
  let src = fs.readFileSync(strapiAppJs, 'utf8');
  if (src.includes("'./translations/bn.json'")) {
    console.log('StrapiApp.js already patched');
  } else {
    src = src.replace(
      `case './translations/hi.json': return Promise.resolve().then(function () { return require('./translations/hi.json.js'); });`,
      `case './translations/hi.json': return Promise.resolve().then(function () { return require('./translations/hi.json.js'); });\n    case './translations/bn.json': return Promise.resolve().then(function () { return require('./translations/bn.json.js'); });`
    );
    fs.writeFileSync(strapiAppJs, src, 'utf8');
    console.log('Patched StrapiApp.js');
  }
}

// ── 4. Patch StrapiApp.mjs to add bn case to dynamic import switch ────────────
const strapiAppMjs = path.join(strapiAppBase, 'StrapiApp.mjs');
if (fs.existsSync(strapiAppMjs)) {
  let src = fs.readFileSync(strapiAppMjs, 'utf8');
  if (src.includes("'./translations/bn.json'")) {
    console.log('StrapiApp.mjs already patched');
  } else {
    src = src.replace(
      `case './translations/hi.json': return import('./translations/hi.json.mjs');`,
      `case './translations/hi.json': return import('./translations/hi.json.mjs');\n    case './translations/bn.json': return import('./translations/bn.json.mjs');`
    );
    fs.writeFileSync(strapiAppMjs, src, 'utf8');
    console.log('Patched StrapiApp.mjs');
  }
}
