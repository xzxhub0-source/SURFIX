import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db('surfix');
    
    let movie;
    if (id.length === 24) {
      movie = await db.collection('movies').findOne({ 
        _id: new ObjectId(id) 
      });
    }

    await client.close();

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    res.status(200).json(movie);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch movie' });
  }
}
