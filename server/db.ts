import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
mkdirSync(dataDir, { recursive: true });

const db: Database.Database = new Database(path.join(dataDir, 'truenorth.db'));

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY,
      nickname TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      player_id TEXT NOT NULL,
      device_id TEXT NOT NULL,
      start_time INTEGER NOT NULL,
      end_time INTEGER,
      score INTEGER DEFAULT 0,
      duration_ms INTEGER,
      question_count INTEGER DEFAULT 20,
      FOREIGN KEY (player_id) REFERENCES players(id)
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_score ON sessions(score DESC, duration_ms ASC);

    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      prompt TEXT NOT NULL,
      answer TEXT NOT NULL CHECK(answer IN ('CAN', 'USA')),
      explanation TEXT NOT NULL,
      image_url TEXT,
      tags TEXT,
      active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS session_answers (
      session_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      correct INTEGER NOT NULL,
      latency_ms INTEGER NOT NULL,
      order_index INTEGER NOT NULL,
      PRIMARY KEY (session_id, question_id),
      FOREIGN KEY (session_id) REFERENCES sessions(id),
      FOREIGN KEY (question_id) REFERENCES questions(id)
    );

    CREATE TABLE IF NOT EXISTS leaderboard_daily (
      date TEXT NOT NULL,
      session_id TEXT NOT NULL,
      player_id TEXT NOT NULL,
      score INTEGER NOT NULL,
      duration_ms INTEGER NOT NULL,
      rank INTEGER,
      PRIMARY KEY (date, session_id),
      FOREIGN KEY (session_id) REFERENCES sessions(id),
      FOREIGN KEY (player_id) REFERENCES players(id)
    );

    CREATE INDEX IF NOT EXISTS idx_leaderboard_daily ON leaderboard_daily(date, score DESC, duration_ms ASC);
  `);

  // Seed questions if empty
  const count = db.prepare('SELECT COUNT(*) as count FROM questions').get() as { count: number };
  if (count.count === 0) {
    seedQuestions();
  }

  console.log('✅ Database initialized');
}

function seedQuestions() {
  const questions = [
    // Canadian
    { prompt: 'Hawaiian pizza', answer: 'CAN', explanation: 'Invented by Sam Panopoulos in Ontario, Canada in 1962.', tags: 'food,invention', image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80' },
    { prompt: 'IMAX large-format cinema', answer: 'CAN', explanation: 'IMAX technology was invented by Canadian filmmakers in 1967.', tags: 'technology,invention', image_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80' },
    { prompt: 'Insulin discovery', answer: 'CAN', explanation: 'Discovered by Frederick Banting and Charles Best in Toronto, 1921.', tags: 'science,medicine', image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80' },
    { prompt: 'Trivial Pursuit board game', answer: 'CAN', explanation: 'Created in Montreal, Quebec by Chris Haney and Scott Abbott in 1979.', tags: 'games,invention', image_url: 'https://images.unsplash.com/photo-1611891487944-e92c7aeaaa8e?w=800&q=80' },
    { prompt: 'Superman co-creator Joe Shuster', answer: 'CAN', explanation: 'Joe Shuster, co-creator of Superman, was born in Toronto, Canada.', tags: 'people,comics', image_url: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=800&q=80' },
    { prompt: 'The walkie-talkie', answer: 'CAN', explanation: 'The portable two-way radio was invented by Canadian Donald Hings in 1937.', tags: 'technology,invention', image_url: 'https://images.unsplash.com/photo-1519669011783-4eaa95fa1b7d?w=800&q=80' },
    { prompt: 'Snowmobile / Ski-Doo', answer: 'CAN', explanation: 'Invented by Joseph-Armand Bombardier in Quebec, 1935.', tags: 'transportation,invention', image_url: 'https://images.unsplash.com/photo-1611775886142-e34a62babe8a?w=800&q=80' },
    { prompt: 'BlackBerry smartphone', answer: 'CAN', explanation: 'Created by Research In Motion (RIM) in Waterloo, Ontario.', tags: 'technology,brand', image_url: 'https://images.unsplash.com/photo-1534237710431-e2fc698436d0?w=800&q=80' },
    { prompt: 'Cirque du Soleil', answer: 'CAN', explanation: 'Founded in Baie-Saint-Paul, Quebec in 1984.', tags: 'entertainment,brand', image_url: 'https://images.unsplash.com/photo-1464047736614-af63643285bf?w=800&q=80' },
    { prompt: 'Caesar cocktail', answer: 'CAN', explanation: 'The Bloody Caesar was invented in Calgary, Alberta in 1969.', tags: 'food,drink', image_url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80' },
    { prompt: 'Nanaimo bar dessert', answer: 'CAN', explanation: 'Named after the city of Nanaimo, British Columbia.', tags: 'food,dessert', image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80' },
    { prompt: 'Ketchup chips', answer: 'CAN', explanation: 'While ketchup chips exist elsewhere, they were popularized in Canada.', tags: 'food,snacks', image_url: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=800&q=80' },
    { prompt: 'Poutine', answer: 'CAN', explanation: 'Originated in rural Quebec in the late 1950s.', tags: 'food,dish', image_url: 'https://images.unsplash.com/photo-1548340748-6d2b7d7da280?w=800&q=80' },
    { prompt: 'Roots clothing brand', answer: 'CAN', explanation: 'Founded in Toronto in 1973.', tags: 'brand,fashion', image_url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&q=80' },
    { prompt: 'Canada Goose outerwear', answer: 'CAN', explanation: 'Founded in Toronto in 1957 as Metro Sportswear Ltd.', tags: 'brand,fashion', image_url: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&q=80' },
    { prompt: 'Basketball inventor James Naismith', answer: 'CAN', explanation: 'James Naismith was Canadian, though he invented basketball in Springfield, MA.', tags: 'people,sports', image_url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80' },
    { prompt: 'Wayne Gretzky', answer: 'CAN', explanation: 'Born in Brantford, Ontario. The Great One is Canadian.', tags: 'people,sports', image_url: 'https://images.unsplash.com/photo-1515703407324-5f753afd8be8?w=800&q=80' },
    { prompt: 'The Weeknd (artist)', answer: 'CAN', explanation: 'Born Abel Tesfaye in Toronto, Ontario.', tags: 'people,music', image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80' },
    { prompt: 'Celine Dion', answer: 'CAN', explanation: 'Born in Charlemagne, Quebec.', tags: 'people,music', image_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80' },
    { prompt: 'Drake (rapper)', answer: 'CAN', explanation: 'Born Aubrey Graham in Toronto, Ontario.', tags: 'people,music', image_url: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800&q=80' },
    { prompt: 'Keanu Reeves', answer: 'CAN', explanation: 'Born in Beirut but raised in Toronto, Ontario.', tags: 'people,entertainment', image_url: 'https://images.unsplash.com/photo-1560109947-543149eceb16?w=800&q=80' },
    { prompt: 'Ryan Gosling', answer: 'CAN', explanation: 'Born in London, Ontario.', tags: 'people,entertainment', image_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80' },
    { prompt: 'Basketball (the sport)', answer: 'USA', explanation: 'Invented in Springfield, Massachusetts by Canadian James Naismith in 1891.', tags: 'sports,invention', image_url: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=800&q=80' },
    { prompt: 'Peanut butter', answer: 'USA', explanation: 'Patented by Marcellus Gilmore Edson (Canadian), but modern version by Americans.', tags: 'food,invention', image_url: 'https://images.unsplash.com/photo-1520961880-4f3e2c36bb6e?w=800&q=80' },
    
    // American
    { prompt: 'Starbucks', answer: 'USA', explanation: 'Founded in Seattle, Washington in 1971.', tags: 'brand,coffee', image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80' },
    { prompt: "Hershey's chocolate", answer: 'USA', explanation: 'Founded in Hershey, Pennsylvania in 1894.', tags: 'brand,food', image_url: 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=800&q=80' },
    { prompt: 'Yellowstone National Park', answer: 'USA', explanation: "America's first national park, established in Wyoming, Montana, and Idaho in 1872.", tags: 'nature,landmark', image_url: 'https://images.unsplash.com/photo-1566253313389-ee07e38beae2?w=800&q=80' },
    { prompt: 'Mount Rushmore', answer: 'USA', explanation: 'Located in the Black Hills of South Dakota.', tags: 'landmark,monument', image_url: 'https://images.unsplash.com/photo-1562695892-0f1459e04307?w=800&q=80' },
    { prompt: 'Golden Gate Bridge', answer: 'USA', explanation: 'Iconic suspension bridge in San Francisco, California.', tags: 'landmark,architecture', image_url: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80' },
    { prompt: 'Chicago deep-dish pizza', answer: 'USA', explanation: 'Invented at Pizzeria Uno in Chicago, Illinois in 1943.', tags: 'food,dish', image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80' },
    { prompt: 'Super Bowl', answer: 'USA', explanation: 'American football championship game of the NFL.', tags: 'sports,event', image_url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&q=80' },
    { prompt: 'Statue of Liberty', answer: 'USA', explanation: 'Gift from France, located in New York Harbor.', tags: 'landmark,monument', image_url: 'https://images.unsplash.com/photo-1508050919630-b135583b29ab?w=800&q=80' },
    { prompt: 'Graceland', answer: 'USA', explanation: "Elvis Presley's mansion in Memphis, Tennessee.", tags: 'landmark,music', image_url: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&q=80' },
    { prompt: 'Harley-Davidson motorcycles', answer: 'USA', explanation: 'Founded in Milwaukee, Wisconsin in 1903.', tags: 'brand,transportation', image_url: 'https://images.unsplash.com/photo-1558981359-219d6364c9c8?w=800&q=80' },
    { prompt: 'NASA', answer: 'USA', explanation: 'The National Aeronautics and Space Administration is a U.S. agency.', tags: 'organization,space', image_url: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&q=80' },
    { prompt: 'Hollywood', answer: 'USA', explanation: 'Located in Los Angeles, California.', tags: 'entertainment,location', image_url: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800&q=80' },
    { prompt: 'Broadway theatre district', answer: 'USA', explanation: 'Located in New York City.', tags: 'entertainment,location', image_url: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&q=80' },
    { prompt: 'Grand Canyon', answer: 'USA', explanation: 'Located in Arizona.', tags: 'nature,landmark', image_url: 'https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?w=800&q=80' },
    { prompt: 'Disneyland', answer: 'USA', explanation: 'First park opened in Anaheim, California in 1955.', tags: 'entertainment,landmark', image_url: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=800&q=80' },
    { prompt: "McDonald's", answer: 'USA', explanation: 'Founded in San Bernardino, California in 1940.', tags: 'brand,food', image_url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80' },
    { prompt: 'Blue jeans (Levi\'s)', answer: 'USA', explanation: 'Levi Strauss invented blue jeans in San Francisco in 1873.', tags: 'fashion,invention', image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80' },
    { prompt: 'Jazz music', answer: 'USA', explanation: 'Originated in New Orleans, Louisiana in the early 20th century.', tags: 'music,culture', image_url: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&q=80' },
    { prompt: 'Route 66', answer: 'USA', explanation: 'Historic highway running from Chicago to Santa Monica.', tags: 'landmark,transportation', image_url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80' },
    { prompt: 'Times Square', answer: 'USA', explanation: 'Major commercial intersection in New York City.', tags: 'landmark,location', image_url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80' }
  ];

  const insert = db.prepare(`
    INSERT INTO questions (id, prompt, answer, explanation, tags, image_url, active)
    VALUES (?, ?, ?, ?, ?, ?, 1)
  `);

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    insert.run(`q${i + 1}`, q.prompt, q.answer, q.explanation, q.tags, q.image_url);
  }

  console.log(`✅ Seeded ${questions.length} questions`);
}

export { db };
