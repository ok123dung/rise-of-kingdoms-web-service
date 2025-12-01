
import { useLanguage } from '../src/contexts/LanguageContext';
import { translations } from '../src/lib/i18n/translations';

console.log('useLanguage type:', typeof useLanguage);
console.log('translations type:', typeof translations);

try {
    // We can't call useLanguage() here because it needs a provider, 
    // but we can check if it's a function.
    if (typeof useLanguage === 'function') {
        console.log('useLanguage is a function. Import successful.');
    } else {
        console.error('useLanguage is NOT a function.');
    }
} catch (error) {
    console.error('Error checking useLanguage:', error);
}
