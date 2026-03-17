import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = 'surfix';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db(MONGODB_DB);
    
    const movies = await db.collection('movies')
      .find({ available: true })
      .sort({ lastChecked: -1 })
      .limit(parseInt(req.query.limit) || 50)
      .toArray();

    await client.close();

    // Convert ObjectId to string
    const formattedMovies = movies.map(m => ({
      ...m,
      _id: m._id.toString()
    }));

    res.status(200).json({ movies: formattedMovies });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
}
