import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      console.log('Fetching movies...');
      
      const res = await fetch('/api/movies');
      const data = await res.json();
      
      console.log('API Response:', data);
      
      if (data.movies && data.movies.length > 0) {
        setMovies(data.movies);
        setError(null);
      } else {
        setError('No movies found');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load movies: ' + err.message);
      setLoading(false);
    }
  };

  // Helper function to get rating color
  const getRatingColor = (rating) => {
    if (rating >= 8) return '#4caf50'; // Green
    if (rating >= 7) return '#ffc107'; // Yellow
    if (rating >= 5) return '#ff9800'; // Orange
    return '#f44336'; // Red
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loader}></div>
        <p style={styles.loadingText}>Loading SURFIX...</p>
        <p style={styles.loadingSubtext}>Fetching movies from database...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <h2 style={styles.errorTitle}>⚠️ Error Loading Movies</h2>
        <p style={styles.errorMessage}>{error}</p>
        <button onClick={fetchMovies} style={styles.retryButton}>
          Try Again
        </button>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div style={styles.errorContainer}>
        <h2 style={styles.errorTitle}>No Movies Found</h2>
        <p style={styles.errorMessage}>The database is empty. Add some movies to get started.</p>
        <button onClick={fetchMovies} style={styles.retryButton}>
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Head>
        <title>SURFIX - Watch Free Movies Online</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.logo}>SURFIX</h1>
          <nav style={styles.nav}>
            <a href="#" style={styles.navLink}>Movies</a>
            <a href="#" style={styles.navLink}>TV Shows</a>
          </nav>
        </div>
      </header>

      {/* Movie Count */}
      <div style={styles.movieCount}>
        Found {movies.length} movies
      </div>

      {/* Movies Grid */}
      <main style={styles.main}>
        <div style={styles.movieGrid}>
          {movies.map((movie) => (
            <Link key={movie._id} href={`/watch/${movie._id}`} style={{ textDecoration: 'none' }}>
              <div style={styles.movieCard}>
                <div style={styles.posterContainer}>
                  <img 
                    src={movie.poster}
                    alt={movie.title}
                    style={styles.poster}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x450?text=No+Poster';
                    }}
                  />
                  <div style={{
                    ...styles.ratingBadge,
                    backgroundColor: getRatingColor(movie.rating)
                  }}>
                    {movie.rating ? movie.rating.toFixed(1) : 'N/A'}
                  </div>
                </div>
                <div style={styles.movieInfo}>
                  <h4 style={styles.movieTitle}>{movie.title}</h4>
                  <p style={styles.movieYear}>{movie.year}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <p style={styles.copyright}>© 2024 SURFIX</p>
      </footer>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#0f0f0f',
    minHeight: '100vh',
    color: '#fff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  loadingContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
  },
  loader: {
    border: '4px solid rgba(255,255,255,0.3)',
    borderTop: '4px solid white',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px',
  },
  loadingText: {
    fontSize: '18px',
    marginBottom: '10px',
  },
  loadingSubtext: {
    fontSize: '14px',
    opacity: 0.8,
  },
  errorContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#0f0f0f',
    color: 'white',
    padding: '20px',
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: '24px',
    marginBottom: '10px',
    color: '#ff6b6b',
  },
  errorMessage: {
    fontSize: '16px',
    opacity: 0.8,
    marginBottom: '20px',
    maxWidth: '600px',
  },
  retryButton: {
    background: '#6b46c1',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  header: {
    background: '#1a1a1a',
    padding: '15px 20px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  headerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: '24px',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: 0,
  },
  nav: {
    display: 'flex',
    gap: '20px',
  },
  navLink: {
    color: '#fff',
    textDecoration: 'none',
    fontSize: '16px',
    opacity: 0.8,
  },
  movieCount: {
    maxWidth: '1400px',
    margin: '20px auto 0',
    padding: '0 20px',
    color: '#999',
    fontSize: '14px',
  },
  main: {
    maxWidth: '1400px',
    margin: '20px auto 40px',
    padding: '0 20px',
  },
  movieGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '20px',
  },
  movieCard: {
    cursor: 'pointer',
    transition: 'transform 0.2s',
    borderRadius: '8px',
    overflow: 'hidden',
    background: '#1a1a1a',
  },
  posterContainer: {
    position: 'relative',
    aspectRatio: '2/3',
  },
  poster: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  ratingBadge: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '14px',
    color: 'white',
    border: '2px solid white',
  },
  movieInfo: {
    padding: '10px',
  },
  movieTitle: {
    margin: '0 0 5px 0',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#fff',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  movieYear: {
    margin: 0,
    fontSize: '12px',
    color: '#999',
  },
  footer: {
    background: '#1a1a1a',
    padding: '20px',
    textAlign: 'center',
  },
  copyright: {
    color: '#666',
    fontSize: '12px',
    margin: 0,
  },
};
