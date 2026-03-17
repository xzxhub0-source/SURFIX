import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import MovieCard from '../components/MovieCard';

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const res = await fetch('/api/movies?limit=50');
      const data = await res.json();
      
      // Split into sections
      setMovies(data.movies || []);
      setTrending(data.movies?.slice(0, 10) || []);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Head>
        <title>SURFIX - Watch Free Movies Online</title>
        <meta name="description" content="SURFIX - Stream the latest movies and TV shows for free" />
      </Head>

      {/* Hero Section */}
      <div className="relative h-[70vh] bg-cover bg-center" style={{
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.9)), url(https://image.tmdb.org/t/p/original/wwemzKWzjKYJFfCeiB57q3r4Bcm.png)'
      }}>
        <div className="absolute inset-0 flex items-center justify-center text-center">
          <div>
            <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-red-500 to-purple-600 text-transparent bg-clip-text">
              SURFIX
            </h1>
            <p className="text-2xl text-gray-300 mb-8">Unlimited movies, TV shows, and more</p>
            <Link href="/browse" className="bg-red-600 hover:bg-red-700 text-white text-xl px-12 py-4 rounded-lg transition">
              Watch Now
            </Link>
          </div>
        </div>
      </div>

      {/* Movie Sections */}
      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-500 border-t-transparent"></div>
          </div>
        ) : (
          <>
            {/* Trending Now */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Trending Now</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {trending.map(movie => (
                  <MovieCard key={movie._id} movie={movie} />
                ))}
              </div>
            </section>

            {/* Latest Movies */}
            <section>
              <h2 className="text-3xl font-bold mb-6">Latest Movies</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {movies.map(movie => (
                  <MovieCard key={movie._id} movie={movie} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
