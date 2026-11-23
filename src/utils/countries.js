// Country metadata for the campaign: flag, region and whether a painted backdrop exists.
import { campaignData } from '../campaignData';

const META = {
  australia: ['🇦🇺', 'Oceania'], egypt: ['🇪🇬', 'Africa'], mexico: ['🇲🇽', 'Americas'], uk: ['🇬🇧', 'Europe'],
  germany: ['🇩🇪', 'Europe'], china: ['🇨🇳', 'Asia'], russia: ['🇷🇺', 'Europe'], ukraine: ['🇺🇦', 'Europe'],
  japan: ['🇯🇵', 'Asia'], southkorea: ['🇰🇷', 'Asia'], indonesia: ['🇮🇩', 'Asia'], singapore: ['🇸🇬', 'Asia'],
  india: ['🇮🇳', 'Asia'], canada: ['🇨🇦', 'Americas'], france: ['🇫🇷', 'Europe'], spain: ['🇪🇸', 'Europe'],
  italy: ['🇮🇹', 'Europe'], southafrica: ['🇿🇦', 'Africa'], malaysia: ['🇲🇾', 'Asia'], vietnam: ['🇻🇳', 'Asia'],
  thailand: ['🇹🇭', 'Asia'], saudiarabia: ['🇸🇦', 'Middle East'], uae: ['🇦🇪', 'Middle East'], qatar: ['🇶🇦', 'Middle East'],
  poland: ['🇵🇱', 'Europe'], brazil: ['🇧🇷', 'Americas'], argentina: ['🇦🇷', 'Americas'], chile: ['🇨🇱', 'Americas'],
  peru: ['🇵🇪', 'Americas'], colombia: ['🇨🇴', 'Americas'], venezuela: ['🇻🇪', 'Americas'], morocco: ['🇲🇦', 'Africa'],
  kenya: ['🇰🇪', 'Africa'], nigeria: ['🇳🇬', 'Africa'], ethiopia: ['🇪🇹', 'Africa'], tanzania: ['🇹🇿', 'Africa'],
  sweden: ['🇸🇪', 'Europe'], norway: ['🇳🇴', 'Europe'], denmark: ['🇩🇰', 'Europe'], finland: ['🇫🇮', 'Europe'],
  netherlands: ['🇳🇱', 'Europe'], belgium: ['🇧🇪', 'Europe'], switzerland: ['🇨🇭', 'Europe'], austria: ['🇦🇹', 'Europe'],
  greece: ['🇬🇷', 'Europe'], turkey: ['🇹🇷', 'Europe'], portugal: ['🇵🇹', 'Europe'], ireland: ['🇮🇪', 'Europe'],
  newzealand: ['🇳🇿', 'Oceania'], fiji: ['🇫🇯', 'Oceania'], philippines: ['🇵🇭', 'Asia'], pakistan: ['🇵🇰', 'Asia'],
  bangladesh: ['🇧🇩', 'Asia'], srilanka: ['🇱🇰', 'Asia'], nepal: ['🇳🇵', 'Asia'], myanmar: ['🇲🇲', 'Asia'],
  cambodia: ['🇰🇭', 'Asia'], laos: ['🇱🇦', 'Asia'], mongolia: ['🇲🇳', 'Asia'], kazakhstan: ['🇰🇿', 'Asia'],
};

// Countries that have a painted background in /public
const PAINTED = new Set(['australia', 'china', 'egypt', 'france', 'germany', 'india', 'italy', 'japan', 'mexico', 'russia', 'uk', 'usa']);

/** Ordered list of countries: { id, name, flag, region, startLevel, count, bg } */
export const COUNTRIES = (() => {
  const byId = new globalThis.Map();
  campaignData.forEach((level) => {
    const c = byId.get(level.countryId);
    if (c) c.count += 1;
    else {
      const [flag, region] = META[level.countryId] || ['🌍', 'World'];
      byId.set(level.countryId, {
        id: level.countryId, name: level.countryName, flag, region,
        startLevel: level.id, count: 1,
        bg: PAINTED.has(level.countryId) ? `/bg_${level.countryId}.png` : null,
      });
    }
  });
  return Array.from(byId.values());
})();

export const TOTAL_LEVELS = campaignData.length;

export function countryForLevel(levelIndex) {
  return COUNTRIES.find((c) => levelIndex >= c.startLevel && levelIndex < c.startLevel + c.count) || COUNTRIES[0];
}

// Windows browsers don't render flag emoji (they show "AU", "EG"…), so flags are hidden there.
// Android, iOS and macOS render them properly.
export const SHOW_FLAGS = typeof navigator === 'undefined' || !/Windows/i.test(navigator.userAgent);
export const flagOf = (country) => (SHOW_FLAGS ? country.flag : '');
