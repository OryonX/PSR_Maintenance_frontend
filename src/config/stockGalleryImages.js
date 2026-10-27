// Stock photos hotlinked from the Unsplash CDN (required by the Unsplash API
// guidelines) for gallery slots that don't have a real project photo yet.
// Keyed by the filename in GALLERY_FILES; a local compressed image always wins.
export const UNSPLASH_URL = 'https://unsplash.com/?utm_source=psr_maintenance&utm_medium=referral'

export const STOCK_GALLERY_IMAGES = {
  'general-repairs-door-fix.jpg': {
    url: 'https://images.unsplash.com/flagged/photo-1564767609213-c75ee685263a?ixid=M3wxMTE0NTI0fDB8MXxzZWFyY2h8NXx8aGFuZHltYW4lMjBmaXhpbmclMjBkb29yJTIwaGluZ2V8ZW58MXwwfHx8MTc5MzA0NTk5MXww&auto=format&fit=crop&w=1200&h=900&q=75',
    author: 'Maria Ziegler',
    authorUrl: 'https://unsplash.com/@schluesseldienstvergleich_eu?utm_source=psr_maintenance&utm_medium=referral'
  },
  'general-repairs-shelving-install.jpg': {
    url: 'https://images.unsplash.com/photo-1604634077316-a2db681f1273?ixid=M3wxMTE0NTI0fDB8MXxzZWFyY2h8Nnx8aW5zdGFsbGluZyUyMHdhbGwlMjBzaGVsZiUyMGRyaWxsfGVufDF8MHx8fDE3OTMwNDU5OTF8MA&auto=format&fit=crop&w=1200&h=900&q=75',
    author: 'cleo stracuzza',
    authorUrl: 'https://unsplash.com/@cleostra?utm_source=psr_maintenance&utm_medium=referral'
  },
  'general-repairs-toolkit.jpg': {
    url: 'https://images.unsplash.com/photo-1789639859519-6af84dcd4ab7?ixid=M3wxMTE0NTI0fDB8MXxzZWFyY2h8MXx8aGFuZHltYW4lMjB0b29scyUyMHdvcmtiZW5jaHxlbnwxfDB8fHwxNzkzMDQ1OTkxfDA&auto=format&fit=crop&w=1200&h=900&q=75',
    author: 'Ali Kaan U\u00e7ar',
    authorUrl: 'https://unsplash.com/@alik04?utm_source=psr_maintenance&utm_medium=referral'
  },
  'renovation-loft-conversion.jpg': {
    url: 'https://images.unsplash.com/photo-1768080315797-892a70ce05ee?ixid=M3wxMTE0NTI0fDB8MXxzZWFyY2h8M3x8bG9mdCUyMGNvbnZlcnNpb24lMjBhdHRpYyUyMGJlZHJvb218ZW58MXwwfHx8MTc5MzA0NTk5Mnww&auto=format&fit=crop&w=1200&h=900&q=75',
    author: 'Kirsten Miles',
    authorUrl: 'https://unsplash.com/@sirole?utm_source=psr_maintenance&utm_medium=referral'
  },
  'plumbing-leak-detection.jpg': {
    url: 'https://images.unsplash.com/photo-1676210134188-4c05dd172f89?ixid=M3wxMTE0NTI0fDB8MXxzZWFyY2h8MXx8cGx1bWJlciUyMHVuZGVyJTIwc2luayUyMHBpcGV8ZW58MXwwfHx8MTc5MzA0NTk5M3ww&auto=format&fit=crop&w=1200&h=900&q=75',
    author: 'Timur Shakerzianov',
    authorUrl: 'https://unsplash.com/@shaker_jpg?utm_source=psr_maintenance&utm_medium=referral'
  },
  'electrical-socket-install.jpg': {
    url: 'https://images.unsplash.com/photo-1751486289947-4f5f5961b3aa?ixid=M3wxMTE0NTI0fDB8MXxzZWFyY2h8MXx8ZWxlY3RyaWNpYW4lMjBpbnN0YWxsaW5nJTIwd2FsbCUyMHNvY2tldHxlbnwxfDB8fHwxNzkzMDQ1OTkzfDA&auto=format&fit=crop&w=1200&h=900&q=75',
    author: 'Fabian Kleiser',
    authorUrl: 'https://unsplash.com/@fabiankleiser?utm_source=psr_maintenance&utm_medium=referral'
  },
  'electrical-wiring-check.jpg': {
    url: 'https://images.unsplash.com/photo-1758101755915-462eddc23f57?ixid=M3wxMTE0NTI0fDB8MXxzZWFyY2h8Nnx8ZWxlY3RyaWNpYW58ZW58MXwwfHx8MTc5MzA0NjAwOHww&auto=format&fit=crop&w=1200&h=900&q=75',
    author: 'Toolmash Expo',
    authorUrl: 'https://unsplash.com/@toolmash?utm_source=psr_maintenance&utm_medium=referral'
  },
  'painting-roller-closeup.jpg': {
    url: 'https://images.unsplash.com/photo-1693985120993-e9b203ce7631?ixid=M3wxMTE0NTI0fDB8MXxzZWFyY2h8Mnx8cGFpbnQlMjByb2xsZXIlMjB3YWxsfGVufDF8MHx8fDE3OTMwNDU5OTR8MA&auto=format&fit=crop&w=1200&h=900&q=75',
    author: 'Andrew Itaga',
    authorUrl: 'https://unsplash.com/@and73w?utm_source=psr_maintenance&utm_medium=referral'
  },
  'painting-feature-wall.jpg': {
    url: 'https://images.unsplash.com/photo-1615873968403-89e068629265?ixid=M3wxMTE0NTI0fDB8MXxzZWFyY2h8Mnx8bGl2aW5nJTIwcm9vbSUyMGRhcmslMjBhY2NlbnQlMjB3YWxsfGVufDF8MHx8fDE3OTMwNDU5OTR8MA&auto=format&fit=crop&w=1200&h=900&q=75',
    author: 'Spacejoy',
    authorUrl: 'https://unsplash.com/@spacejoy?utm_source=psr_maintenance&utm_medium=referral'
  },
  'tiling-bathroom-floor.jpg': {
    url: 'https://images.unsplash.com/photo-1731185752376-a4cf3e8556fa?ixid=M3wxMTE0NTI0fDB8MXxzZWFyY2h8Mnx8dGlsZXIlMjBsYXlpbmclMjBmbG9vciUyMHRpbGVzfGVufDF8MHx8fDE3OTMwNDU5OTV8MA&auto=format&fit=crop&w=1200&h=900&q=75',
    author: 'Ernys',
    authorUrl: 'https://unsplash.com/@ernys?utm_source=psr_maintenance&utm_medium=referral'
  },
  'tiling-kitchen-splashback.jpg': {
    url: 'https://images.unsplash.com/photo-1703868669362-562283170216?ixid=M3wxMTE0NTI0fDB8MXxzZWFyY2h8Mnx8a2l0Y2hlbiUyMHRpbGUlMjBzcGxhc2hiYWNrfGVufDF8MHx8fDE3OTMwNDU5OTV8MA&auto=format&fit=crop&w=1200&h=900&q=75',
    author: 'William Warby',
    authorUrl: 'https://unsplash.com/@wwarby?utm_source=psr_maintenance&utm_medium=referral'
  },
  'tiling-grout-detail.jpg': {
    url: 'https://images.unsplash.com/photo-1628841878739-f2f0fc1c0fb3?ixid=M3wxMTE0NTI0fDB8MXxzZWFyY2h8NXx8dGlsZSUyMGdyb3V0JTIwY2xvc2UlMjB1cHxlbnwxfDB8fHwxNzkzMDQ1OTk1fDA&auto=format&fit=crop&w=1200&h=900&q=75',
    author: 'Xhulio Selenica',
    authorUrl: 'https://unsplash.com/@xhulioselenica?utm_source=psr_maintenance&utm_medium=referral'
  },
  'plastering-wall-finish.jpg': {
    url: 'https://images.unsplash.com/photo-1768839725085-829e6ac7ac26?ixid=M3wxMTE0NTI0fDB8MXxzZWFyY2h8MXx8cGxhc3RlcmluZyUyMHdhbGwlMjB0cm93ZWx8ZW58MXwwfHx8MTc5MzA0NTk5Nnww&auto=format&fit=crop&w=1200&h=900&q=75',
    author: 'Sasun Bughdaryan',
    authorUrl: 'https://unsplash.com/@sasun1990?utm_source=psr_maintenance&utm_medium=referral'
  },
  'plastering-tools.jpg': {
    url: 'https://images.unsplash.com/photo-1714415908292-a741a2b995e1?ixid=M3wxMTE0NTI0fDB8MXxzZWFyY2h8M3x8cGxhc3RlcmVyJTIwdG9vbHMlMjB0cm93ZWwlMjBoYXdrfGVufDF8MHx8fDE3OTMwNDU5OTZ8MA&auto=format&fit=crop&w=1200&h=900&q=75',
    author: 'Sarah Sheedy',
    authorUrl: 'https://unsplash.com/@cestmoisheedy?utm_source=psr_maintenance&utm_medium=referral'
  },
  'maintenance-property-inspection.jpg': {
    url: 'https://images.unsplash.com/photo-1650772263831-41aa1b2c80d0?ixid=M3wxMTE0NTI0fDB8MXxzZWFyY2h8M3x8aG9tZSUyMGluc3BlY3Rpb24lMjBob3VzZSUyMGV4dGVyaW9yfGVufDF8MHx8fDE3OTMwNDU5OTZ8MA&auto=format&fit=crop&w=1200&h=900&q=75',
    author: 'Daniel',
    authorUrl: 'https://unsplash.com/@unsplashbydan?utm_source=psr_maintenance&utm_medium=referral'
  },
  'maintenance-checklist.jpg': {
    url: 'https://images.unsplash.com/photo-1693683223469-e3da9e2a723d?ixid=M3wxMTE0NTI0fDB8MXxzZWFyY2h8OHx8Y2xpcGJvYXJkJTIwY2hlY2tsaXN0JTIwaG91c2UlMjBtYWludGVuYW5jZXxlbnwxfDB8fHwxNzkzMDQ1OTk3fDA&auto=format&fit=crop&w=1200&h=900&q=75',
    author: 'Vladislav Igumnov',
    authorUrl: 'https://unsplash.com/@hansis666?utm_source=psr_maintenance&utm_medium=referral'
  },
  'maintenance-seasonal-check.jpg': {
    url: 'https://images.unsplash.com/photo-1665442348932-6e16d72fe163?ixid=M3wxMTE0NTI0fDB8MXxzZWFyY2h8NXx8Z3V0dGVyJTIwY2xlYW5pbmclMjByb29mfGVufDF8MHx8fDE3OTMwNDU5OTd8MA&auto=format&fit=crop&w=1200&h=900&q=75',
    author: 'Jon Sailer',
    authorUrl: 'https://unsplash.com/@jonmsailer?utm_source=psr_maintenance&utm_medium=referral'
  }
}
