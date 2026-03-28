// Helper to generate levels for quick scaffolding. You will fill these out with 1415 unique puzzles!
const createLevel = (levelIndex, countryId, countryName, quotes) => {
    const sampleJumbles = [
        [
            { jumble: 'TRUIF', answer: 'FRUIT', circles: [1, 3] },
            { jumble: 'EENRG', answer: 'GREEN', circles: [0, 3] },
            { jumble: 'YELAL', answer: 'ALLEY', circles: [1, 2] }
        ],
        [
            { jumble: 'DOGOL', answer: 'IGLOO', circles: [0, 2] },
            { jumble: 'BUMLE', answer: 'PLUMB', circles: [1] },
            { jumble: 'NARIN', answer: 'RAINY', circles: [0, 2, 4] }
        ]
    ];
    
    // Fallback quotes if none provided
    const safeQuotes = quotes && quotes.length > 0 ? quotes : ["A beautiful place to visit.", "Can you guess the answer?"];
    
    return {
        id: levelIndex,
        countryId,
        countryName,
        puzzle: {
            jumbles: sampleJumbles[levelIndex % 2],
            meta: {
                quote: safeQuotes[levelIndex % safeQuotes.length],
                answer: levelIndex % 2 === 0 ? "GRILLE" : "IRONY"
            }
        }
    };
};

export const campaignData = [];
let currentLevel = 0;

const addCountries = (id, name, count, quotes) => {
    for (let i = 0; i < count; i++) {
        campaignData.push(createLevel(currentLevel++, id, name, quotes));
    }
}

// Group 1
addCountries('australia', 'Australia', 20, ["A landmark in the Southern Hemisphere?", "Famous for unique wildlife?"]);
addCountries('egypt', 'Egypt', 20, ["A wonder of the ancient world?", "Flows through the desert?"]);
addCountries('mexico', 'Mexico', 25, ["Famous ancient ruins?", "A beautiful beach destination?"]);
addCountries('uk', 'United Kingdom', 30, ["A famous clock tower?", "Tea time is essential."]);
addCountries('germany', 'Germany', 30, ["Known for engineering?", "A beautiful fairytale castle."]);
addCountries('china', 'China', 35, ["A massive ancient fortification?", "A majestic river."]);
addCountries('russia', 'Russia', 35, ["A stunning palace in Moscow?", "The largest country."]);

// Group 2 (Newly Added)
addCountries('ukraine', 'Ukraine', 40, ["Known as the breadbasket of Europe?", "Beautiful sunflower fields."]);
addCountries('japan', 'Japan', 40, ["Land of the rising sun?", "Famous for cherry blossoms."]);
addCountries('southkorea', 'South Korea', 45, ["Home of K-Pop?", "Delicious kimchi and BBQ."]);
addCountries('indonesia', 'Indonesia', 50, ["Thousands of beautiful islands.", "Famous for Bali."]);
addCountries('singapore', 'Singapore', 50, ["A stunning city-state?", "Marina Bay Sands."]);
addCountries('india', 'India', 55, ["A famous white marble mausoleum?", "Incredible spices and culture."]);
addCountries('canada', 'Canada', 55, ["Maple syrup and beautiful nature?", "The Great White North."]);
addCountries('france', 'France', 60, ["City of love?", "A famous iron tower."]);
addCountries('spain', 'Spain', 60, ["Tapas and flamenco?", "Beautiful Mediterranean beaches."]);
addCountries('italy', 'Italy', 65, ["Pasta, pizza, and ancient history?", "A famous leaning tower."]);
addCountries('southafrica', 'South Africa', 65, ["Table Mountain and safaris?", "The Rainbow Nation."]);
addCountries('malaysia', 'Malaysia', 70, ["Petronas Twin Towers?", "A mix of cultures."]);
addCountries('vietnam', 'Vietnam', 70, ["Ha Long Bay?", "Pho and banh mi."]);
addCountries('thailand', 'Thailand', 75, ["Land of smiles?", "Beautiful temples and beaches."]);
addCountries('saudiarabia', 'Saudi Arabia', 75, ["Vast deserts and ancient cities?", "A major peninsula."]);
addCountries('uae', 'UAE', 80, ["Tallest building in the world?", "Luxury and modern architecture."]);
addCountries('qatar', 'Qatar', 80, ["A modern pearl on the Gulf.", "Doha's futuristic skyline."]);
addCountries('poland', 'Poland', 85, ["Rich history and hearty food?", "Beautiful medieval cities."]);

// Total levels: 235 + 1180 = 1415 levels. 
// You can keep adding more later by simply appending to this file!
