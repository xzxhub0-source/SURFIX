// Main scraper that finds working embed sources
const axios = require('axios');
const { MongoClient } = require('mongodb');
const { embedProviders, advancedProviders } = require('./embedProviders');
const tmdb = require('../utils/tmdb');
require('dotenv').config();

class SourceScraper {
  constructor() {
    this.mongoUri = process.env.MONGODB_URI;
    this.dbName = 'surfix';
    this.allProviders = [...embedProviders, ...advancedProviders];
  }

  async connectDB() {
    const client = new MongoClient(this.mongoUri);
    await client.connect();
    this.db = client.db(this.dbName);
    this.movies = this.db.collection('movies');
    console.log('✅ Connected to MongoDB');
  }

  async getPopularMovies() {
    // Get movies from TMDB first [citation:2]
    const popular = await tmdb.getPopular();
    const nowPlaying = await tmdb.getNowPlaying();
    const upcoming = await tmdb.getUpcoming();
    
    return [...popular, ...nowPlaying, ...upcoming].slice(0, 100);
  }

  async findWorkingEmbeds(imdbId, tmdbId, title, year) {
    console.log(`🔍 Finding embeds for: ${title} (${imdbId})`);
    
    const workingEmbeds = [];
    
    // Try each provider [citation:6]
    for (const provider of this.allProviders) {
      if (!provider.enabled) continue;
      
      try {
        let embedUrl;
        if (provider.patterns.movie.includes('{tmdb_id}')) {
          embedUrl = provider.patterns.movie.replace('{tmdb_id}', tmdbId);
        } else {
          embedUrl = provider.patterns.movie.replace('{imdb_id}', imdbId);
        }
        
        // Test if embed works [citation:1]
        const response = await axios.head(embedUrl, { 
          timeout: 5000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        if (response.status === 200) {
          workingEmbeds.push({
            provider: provider.name,
            embedUrl: embedUrl,
            quality: provider.quality || 'HD',
            priority: provider.priority || 99
          });
          console.log(`✅ Found working embed: ${provider.name}`);
        }
      } catch (error) {
        // Silently fail - provider didn't work
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Sort by priority
    return workingEmbeds.sort((a, b) => (a.priority || 99) - (b.priority || 99));
  }

  async scrapeAll() {
    await this.connectDB();
    
    console.log('🚀 Starting SURFIX scraper...');
    
    const movies = await this.getPopularMovies();
    console.log(`📦 Found ${movies.length} movies from TMDB`);
    
    let newCount = 0;
    
    for (const movie of movies) {
      // Check if we already have this movie with working embeds
      const existing = await this.movies.findOne({ 
        tmdbId: movie.id,
        'embeds.0': { $exists: true } 
      });
      
      if (existing) {
        console.log(`⏭️  Already have: ${movie.title}`);
        continue;
      }
      
      // Get IMDb ID [citation:2]
      const details = await tmdb.getMovieDetails(movie.id);
      const imdbId = details.imdb_id;
      
      if (!imdbId) {
        console.log(`⚠️  No IMDb ID for: ${movie.title}`);
        continue;
      }
      
      // Find working embeds
      const embeds = await this.findWorkingEmbeds(
        imdbId, 
        movie.id, 
        movie.title, 
        movie.release_date?.split('-')[0]
      );
      
      if (embeds.length > 0) {
        // Save to database
        await this.movies.updateOne(
          { tmdbId: movie.id },
          {
            $set: {
              title: movie.title,
              overview: movie.overview,
              posterPath: movie.poster_path,
              backdropPath: movie.backdrop_path,
              releaseDate: movie.release_date,
              voteAverage: movie.vote_average,
              imdbId: imdbId,
              embeds: embeds,
              lastChecked: new Date(),
              available: true
            }
          },
          { upsert: true }
        );
        
        newCount++;
        console.log(`✅ Added: ${movie.title} (${embeds.length} sources)`);
      } else {
        console.log(`❌ No sources for: ${movie.title}`);
      }
      
      // Delay between movies
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log(`🎉 Scraping complete! Added ${newCount} new movies`);
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  const scraper = new SourceScraper();
  scraper.scrapeAll().catch(console.error);
}

module.exports = SourceScraper;
