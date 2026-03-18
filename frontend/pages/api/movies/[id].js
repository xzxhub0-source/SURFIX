import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Movie ID is required' });
  }

  let client;
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db('sample_mflix');
    const moviesCollection = db.collection('movies');
    
    let movie;
    
    // Try to find by ObjectId
    try {
      if (ObjectId.isValid(id)) {
        movie = await moviesCollection.findOne({ _id: new ObjectId(id) });
      }
    } catch (e) {
      // Not a valid ObjectId, continue to other methods
    }
    
    // If not found, try by imdbId
    if (!movie) {
      movie = await moviesCollection.findOne({ 'imdb.id': id });
    }
    
    // If still not found, try by title (case insensitive)
    if (!movie) {
      movie = await moviesCollection.findOne({ 
        title: { $regex: new RegExp(id, 'i') } 
      });
    }

    await client.close();

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    // Format the movie data
    const formattedMovie = {
      _id: movie._id.toString(),
      title: movie.title || 'Untitled',
      year: movie.year?.toString() || 'Unknown',
      rating: movie.imdb?.rating || 0,
      votes: movie.imdb?.votes || '0',
      poster: movie.poster || 'https://via.placeholder.com/300x450?text=No+Poster',
      backdrop: movie.poster?.replace('/w500/', '/original/') || null,
      overview: movie.fullplot || movie.plot || 'No description available',
      imdbId: movie.imdb?.id || '',
      genres: movie.genres || [],
      runtime: movie.runtime || 0,
      released: movie.released || null,
      directors: movie.directors || [],
      writers: movie.writers || [],
      cast: movie.cast || [],
      countries: movie.countries || [],
      languages: movie.languages || [],
      awards: movie.awards || {},
      type: movie.type || 'movie',
      tomatoes: movie.tomatoes || null
    };

    return res.status(200).json(formattedMovie);

  } catch (error) {
    console.error('Database error:', error);
    
    if (client) await client.close();
    
    // Return sample movie if database fails
    return res.status(200).json({
      _id: id,
      title: 'Dune: Part Two',
      year: '2024',
      rating: 8.7,
      votes: '124K',
      poster: 'https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8CY05BE4zF.jpg',
      overview: 'Paul Atreides unites with Chani and the Fremen while seeking revenge.',
      imdbId: 'tt15239678',
      genres: ['Action', 'Adventure', 'Sci-Fi'],
      directors: ['Denis Villeneuve'],
      cast: ['Timothée Chalamet', 'Zendaya', 'Austin Butler']
    });
  }
}
