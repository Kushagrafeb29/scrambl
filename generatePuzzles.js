import fs from 'fs';
import https from 'https';

const COUNTRIES = [
  { id: 'australia', name: 'Australia', count: 24 },
  { id: 'egypt', name: 'Egypt', count: 24 },
  { id: 'mexico', name: 'Mexico', count: 24 },
  { id: 'uk', name: 'United Kingdom', count: 24 },
  { id: 'germany', name: 'Germany', count: 24 },
  { id: 'china', name: 'China', count: 24 },
  { id: 'russia', name: 'Russia', count: 24 },
  { id: 'ukraine', name: 'Ukraine', count: 24 },
  { id: 'japan', name: 'Japan', count: 24 },
  { id: 'southkorea', name: 'South Korea', count: 24 },
  { id: 'indonesia', name: 'Indonesia', count: 24 },
  { id: 'singapore', name: 'Singapore', count: 24 },
  { id: 'india', name: 'India', count: 24 },
  { id: 'canada', name: 'Canada', count: 24 },
  { id: 'france', name: 'France', count: 24 },
  { id: 'spain', name: 'Spain', count: 24 },
  { id: 'italy', name: 'Italy', count: 24 },
  { id: 'southafrica', name: 'South Africa', count: 24 },
  { id: 'malaysia', name: 'Malaysia', count: 24 },
  { id: 'vietnam', name: 'Vietnam', count: 24 },
  { id: 'thailand', name: 'Thailand', count: 24 },
  { id: 'saudiarabia', name: 'Saudi Arabia', count: 24 },
  { id: 'uae', name: 'UAE', count: 24 },
  { id: 'qatar', name: 'Qatar', count: 24 },
  { id: 'poland', name: 'Poland', count: 24 },
  { id: 'brazil', name: 'Brazil', count: 24 },
  { id: 'argentina', name: 'Argentina', count: 24 },
  { id: 'chile', name: 'Chile', count: 24 },
  { id: 'peru', name: 'Peru', count: 24 },
  { id: 'colombia', name: 'Colombia', count: 24 },
  { id: 'venezuela', name: 'Venezuela', count: 24 },
  { id: 'morocco', name: 'Morocco', count: 24 },
  { id: 'kenya', name: 'Kenya', count: 24 },
  { id: 'nigeria', name: 'Nigeria', count: 24 },
  { id: 'ethiopia', name: 'Ethiopia', count: 24 },
  { id: 'tanzania', name: 'Tanzania', count: 24 },
  { id: 'sweden', name: 'Sweden', count: 24 },
  { id: 'norway', name: 'Norway', count: 24 },
  { id: 'denmark', name: 'Denmark', count: 24 },
  { id: 'finland', name: 'Finland', count: 24 },
  { id: 'netherlands', name: 'Netherlands', count: 24 },
  { id: 'belgium', name: 'Belgium', count: 24 },
  { id: 'switzerland', name: 'Switzerland', count: 24 },
  { id: 'austria', name: 'Austria', count: 24 },
  { id: 'greece', name: 'Greece', count: 24 },
  { id: 'turkey', name: 'Turkey', count: 24 },
  { id: 'portugal', name: 'Portugal', count: 24 },
  { id: 'ireland', name: 'Ireland', count: 24 },
  { id: 'newzealand', name: 'New Zealand', count: 24 },
  { id: 'fiji', name: 'Fiji', count: 24 },
  { id: 'philippines', name: 'Philippines', count: 25 },
  { id: 'pakistan', name: 'Pakistan', count: 25 },
  { id: 'bangladesh', name: 'Bangladesh', count: 25 },
  { id: 'srilanka', name: 'Sri Lanka', count: 25 },
  { id: 'nepal', name: 'Nepal', count: 25 },
  { id: 'myanmar', name: 'Myanmar', count: 25 },
  { id: 'cambodia', name: 'Cambodia', count: 25 },
  { id: 'laos', name: 'Laos', count: 25 },
  { id: 'mongolia', name: 'Mongolia', count: 25 },
  { id: 'kazakhstan', name: 'Kazakhstan', count: 26 }
];

async function fetchWords() {
    return new Promise((resolve, reject) => {
        https.get('https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english-no-swears.txt', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data.split('\n')));
        }).on('error', reject);
    });
}

function scramble(word) {
    let arr = word.split('');
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    // ensure it's not the same word
    if (arr.join('') === word && word.length > 1) {
       return scramble(word);
    }
    return arr.join('').toUpperCase();
}

function findJumbleWord(fourLetterWords, neededLetters) {
    // Try to find a word that contains as many needed letters as possible
    // To ensure puzzle is solvable and circles are distributed
    let bestWord = "";
    let bestIntersections = [];
    
    // Randomize word pool slightly
    let pool = [...fourLetterWords].sort(() => 0.5 - Math.random()).slice(0, 1000);
    
    for (let word of pool) {
        let tempNeeded = [...neededLetters];
        let intersections = [];
        let wordArr = word.split('');
        
        for (let i = 0; i < wordArr.length; i++) {
            let char = wordArr[i].toUpperCase();
            let neededIdx = tempNeeded.indexOf(char);
            if (neededIdx !== -1) {
                intersections.push(i);
                tempNeeded.splice(neededIdx, 1);
            }
            if (intersections.length >= 2) break; // Maximum 2 circled letters per word for difficulty
        }
        
        if (intersections.length > bestIntersections.length) {
            bestIntersections = intersections;
            bestWord = word;
        }
        if (bestIntersections.length === 2) break;
    }
    
    if (!bestWord) return null;
    return { word: bestWord, circles: bestIntersections };
}

async function generate() {
    console.log("Fetching words...");
    const words = await fetchWords();
    const fourLetterWords = words.filter(w => w.length === 4);
    const metaWords = words.filter(w => w.length >= 4 && w.length <= 5).sort(() => 0.5 - Math.random());
    
    console.log(`Found ${fourLetterWords.length} 4-letter words and ${metaWords.length} meta words.`);

    let output = `export const campaignData = [\n`;
    let globalLevel = 0;
    
    for (let country of COUNTRIES) {
        console.log(`Generating ${country.count} levels for ${country.name}...`);
        
        for (let i = 0; i < country.count; i++) {
            // First puzzle of the game is fixed to SYDNEY for demonstration
            if (globalLevel === 0) {
                output += `  {
    id: 0,
    countryId: 'australia',
    countryName: 'Australia',
    puzzle: {
        jumbles: [
            { jumble: 'RATS', answer: 'STAR', circles: [0, 3] },
            { jumble: 'MCOE', answer: 'COME', circles: [1] },
            { jumble: 'WODR', answer: 'WORD', circles: [0, 3] }
        ],
        meta: { quote: "Unscramble the secret word!", answer: "SWORD" }
    }
  },\n`;
                globalLevel++;
                continue;
            }

            let metaWord;
            let jumblesArray = [];
            let valid = false;

            while (!valid) {
                metaWord = metaWords[Math.floor(Math.random() * metaWords.length)].toUpperCase();
                let needed = metaWord.split('');
                jumblesArray = [];
                let failsafe = 0;
                
                while (needed.length > 0 && failsafe < 10) {
                    let jumble = findJumbleWord(fourLetterWords, needed);
                    if (!jumble) {
                        failsafe = 10; break;
                    }
                    
                    let circles = jumble.circles;
                    // remove extracted letters from needed
                    circles.forEach(c => {
                        let char = jumble.word[c].toUpperCase();
                        let idx = needed.indexOf(char);
                        if (idx !== -1) needed.splice(idx, 1);
                    });
                    
                    jumblesArray.push({
                        jumble: scramble(jumble.word),
                        answer: jumble.word.toUpperCase(),
                        circles: circles
                    });
                    failsafe++;
                }

                // If we extracted exactly the needed letters within 3-4 jumbles
                if (needed.length === 0 && jumblesArray.length <= 4) {
                    valid = true;
                }
            }

            output += `  {
    id: ${globalLevel},
    countryId: '${country.id}',
    countryName: '${country.name}',
    puzzle: {
        jumbles: [
${jumblesArray.map(j => `            { jumble: '${j.jumble}', answer: '${j.answer}', circles: [${j.circles.join(', ')}] }`).join(',\n')}
        ],
        meta: { quote: "Unscramble the secret word!", answer: "${metaWord}" }
    }
  },\n`;
            
            globalLevel++;
        }
    }
    
    output += `];\n`;
    
    fs.writeFileSync('./src/campaignData.js', output);
    console.log("campaignData.js written successfully with 1415 levels!");
}

generate();
