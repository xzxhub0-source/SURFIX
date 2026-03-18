// Run this once to add some movies to your database
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;

const sampleMovies = [
  {
    title: "Dune: Part Two",
    year: "2024",
    imdbId: "tt15239678",
    overview: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
    rating: 8.7,
    poster: "https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8CY05BE4zF.jpg",
    added: new Date()
  },
  {
    title: "Oppenheimer",
    year: "2023",
    imdbId: "tt15398776",
    overview: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
    rating: 8.5,
    poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    added: new Date()
  },
  {
    title: "Poor Things",
    year: "2023",
    imdbId: "tt14230458",
    overview: "The incredible tale about the fantastical evolution of Bella Baxter, a young woman brought back to life by the brilliant and unorthodox scientist Dr. Godwin Baxter.",
    rating: 8.4,
    poster: "https://image.tmdb.org/t/p/w500/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg",
    added: new Date()
  },
  {
    title: "The Batman",
    year: "2022",
    imdbId: "tt1877830",
    overview: "When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city's hidden corruption and question his family's involvement.",
    rating: 7.8,
    poster: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg",
    added: new Date()
  },
  {
    title: "Killers of the Flower Moon",
    year: "2023",
    imdbId: "tt5537002",
    overview: "When oil is discovered in 1920s Oklahoma under Osage Nation land, the Osage people are murdered one by one - until the FBI steps in to unravel the mystery.",
    rating: 8.2,
    poster: "https://image.tmdb.org/t/p/w500/dB6KrkDzeUyQR8ZCbpzLz9eQ3R5.jpg",
    added: new Date()
  }
];

async function seed() {
  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db('surfix');
  
  await db.collection('movies').deleteMany({});
  await db.collection('movies').insertMany(sampleMovies);
  
  console.log('✅ Database seeded!');
  await client.close();
}

seed().catch(console.error);
