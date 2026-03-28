import fs from 'fs';
import https from 'https';

const COUNTRIES = [
  { id: 'australia', name: 'Australia', count: 20 },
  { id: 'egypt', name: 'Egypt', count: 20 },
  { id: 'mexico', name: 'Mexico', count: 25 },
  { id: 'uk', name: 'United Kingdom', count: 30 },
  { id: 'germany', name: 'Germany', count: 30 },
  { id: 'china', name: 'China', count: 35 },
  { id: 'russia', name: 'Russia', count: 35 },
  { id: 'ukraine', name: 'Ukraine', count: 40 },
  { id: 'japan', name: 'Japan', count: 40 },
  { id: 'southkorea', name: 'South Korea', count: 45 },
  { id: 'indonesia', name: 'Indonesia', count: 50 },
  { id: 'singapore', name: 'Singapore', count: 50 },
  { id: 'india', name: 'India', count: 55 },
  { id: 'canada', name: 'Canada', count: 55 },
  { id: 'france', name: 'France', count: 60 },
  { id: 'spain', name: 'Spain', count: 60 },
  { id: 'italy', name: 'Italy', count: 65 },
  { id: 'southafrica', name: 'South Africa', count: 65 },
  { id: 'malaysia', name: 'Malaysia', count: 70 },
  { id: 'vietnam', name: 'Vietnam', count: 70 },
  { id: 'thailand', name: 'Thailand', count: 75 },
  { id: 'saudiarabia', name: 'Saudi Arabia', count: 75 },
  { id: 'uae', name: 'UAE', count: 80 },
  { id: 'qatar', name: 'Qatar', count: 80 },
  { id: 'poland', name: 'Poland', count: 85 }
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

function findJumbleWord(fiveLetterWords, neededLetters) {
    // Try to find a word that contains as many needed letters as possible
    // To ensure puzzle is solvable and circles are distributed
    let bestWord = "";
    let bestIntersections = [];
    
    // Randomize word pool slightly
    let pool = [...fiveLetterWords].sort(() => 0.5 - Math.random()).slice(0, 1000);
    
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
    const fiveLetterWords = words.filter(w => w.length === 5);
    const metaWords = words.filter(w => w.length >= 5 && w.length <= 7).sort(() => 0.5 - Math.random());
    
    console.log(`Found ${fiveLetterWords.length} 5-letter words and ${metaWords.length} meta words.`);

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
            { jumble: 'KASRT', answer: 'STARK', circles: [0] },
            { jumble: 'LADYI', answer: 'DAILY', circles: [0, 4] },
            { jumble: 'ENOMY', answer: 'MONEY', circles: [2, 3, 4] }
        ],
        meta: { quote: "A landmark in the Southern Hemisphere?", answer: "SYDNEY" }
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
                    let jumble = findJumbleWord(fiveLetterWords, needed);
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
