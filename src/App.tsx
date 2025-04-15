import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Film, Star, Search, Menu, X, Play, Info, ChevronLeft, ChevronRight } from 'lucide-react';

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  vote_average: number;
  genre_ids: number[];
}

interface MovieResponse {
  movies: Movie[];
  total_pages: number;
  current_page: number;
  total_results: number;
}

interface Preference {
  genreId: number;
  selected: boolean;
}

function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showPreferences, setShowPreferences] = useState(true);
  const [showMovieDetails, setShowMovieDetails] = useState(false);
  const [preferences, setPreferences] = useState<Preference[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Predefined genres
  const genreMap: Record<number, string> = {
    28: 'Action',
    12: 'Adventure',
    16: 'Animation',
    35: 'Comedy',
    80: 'Crime',
    99: 'Documentary',
    18: 'Drama',
    10751: 'Family',
    14: 'Fantasy',
    36: 'History',
    27: 'Horror',
    10402: 'Music',
    9648: 'Mystery',
    10749: 'Romance',
    878: 'Science Fiction',
    53: 'Thriller',
  };

  useEffect(() => {
    // Initialize preferences
    setPreferences(
      Object.keys(genreMap).map(genreId => ({
        genreId: parseInt(genreId),
        selected: false,
      }))
    );
    fetchPopularMovies();
    fetchAllMovies(1);
  }, []);

  useEffect(() => {
    fetchAllMovies(currentPage);
  }, [currentPage]);

  const fetchAllMovies = async (page: number) => {
    try {
      const response = await axios.get<MovieResponse>(`http://localhost:8000/movies?page=${page}`);
      setAllMovies(response.data.movies);
      setTotalPages(response.data.total_pages);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching all movies:', error);
      setLoading(false);
    }
  };

  const fetchPopularMovies = async () => {
    try {
      const response = await axios.get('http://localhost:8000/movies/popular');
      setMovies(response.data.movies);
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
  };

  const getRecommendations = async (movieId: number) => {
    try {
      const response = await axios.get(`http://localhost:8000/movies/recommend/${movieId}`);
      setRecommendations(response.data.recommendations);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setShowMovieDetails(true);
    getRecommendations(movie.id);
  };

  const getMoviesByGenre = (genreId: number) => {
    return movies.filter(movie => movie.genre_ids.includes(genreId));
  };

  const getPreferredMovies = () => {
    const selectedGenres = preferences
      .filter(pref => pref.selected)
      .map(pref => pref.genreId);
    
    if (selectedGenres.length === 0) return [];
    
    return movies.filter(movie => 
      movie.genre_ids.some(genreId => selectedGenres.includes(genreId))
    );
  };

  const togglePreference = (genreId: number) => {
    setPreferences(preferences.map(pref => 
      pref.genreId === genreId ? { ...pref, selected: !pref.selected } : pref
    ));
  };

  const handlePreferenceSubmit = () => {
    setShowPreferences(false);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const MovieRow = ({ title, movies }: { title: string; movies: Movie[] }) => (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4 text-white">{title}</h2>
      <div className="relative">
        <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="flex-none w-[200px] transform transition-transform hover:scale-105 cursor-pointer"
              onClick={() => handleMovieClick(movie)}
            >
              <div className="relative group">
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  className="rounded-lg shadow-lg w-full h-[300px] object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 text-white text-center p-4">
                    <h3 className="font-bold mb-2">{movie.title}</h3>
                    <div className="flex items-center justify-center text-yellow-400 mb-2">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="ml-1">{movie.vote_average?.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const MovieGrid = ({ movies }: { movies: Movie[] }) => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {movies.map((movie) => (
        <div
          key={movie.id}
          className="transform transition-transform hover:scale-105 cursor-pointer"
          onClick={() => handleMovieClick(movie)}
        >
          <div className="relative group">
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              className="rounded-lg shadow-lg w-full h-[300px] object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-opacity duration-300 rounded-lg flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 text-white text-center p-4">
                <h3 className="font-bold mb-2">{movie.title}</h3>
                <div className="flex items-center justify-center text-yellow-400 mb-2">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="ml-1">{movie.vote_average?.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-netflix-red"></div>
      </div>
    );
  }

  if (showPreferences) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="bg-gray-900 p-8 rounded-xl max-w-2xl w-full mx-4">
          <h2 className="text-3xl font-bold text-white mb-6">Choose Your Favorite Genres</h2>
          <p className="text-gray-400 mb-8">Select at least three genres to help us recommend movies you'll love.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {preferences.map((pref) => (
              <button
                key={pref.genreId}
                onClick={() => togglePreference(pref.genreId)}
                className={`p-3 rounded-lg text-sm font-semibold transition-colors ${
                  pref.selected
                    ? 'bg-netflix-red text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {genreMap[pref.genreId]}
              </button>
            ))}
          </div>
          <button
            onClick={handlePreferenceSubmit}
            className="w-full bg-netflix-red text-white py-3 rounded-lg font-bold hover:bg-red-700 transition-colors"
            disabled={preferences.filter(p => p.selected).length < 3}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-black text-white">
      {/* Header */}
      <header className="fixed w-full z-50 bg-gradient-to-b from-black to-transparent">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <Film className="w-8 h-8 text-netflix-red" />
                <h1 className="text-2xl font-bold">MovieFlix</h1>
              </div>
              <nav className="hidden md:flex space-x-4">
                <a href="#" className="hover:text-gray-300">Home</a>
                <a href="#" className="hover:text-gray-300">Movies</a>
                <a href="#" className="hover:text-gray-300">My List</a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <button
                className="md:hidden"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Movie Details Modal */}
      {showMovieDetails && selectedMovie && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative bg-gray-900 rounded-xl max-w-4xl w-full mx-4 overflow-hidden">
            <button
              onClick={() => setShowMovieDetails(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="relative h-96">
              <img
                src={`https://image.tmdb.org/t/p/original${selectedMovie.poster_path}`}
                alt={selectedMovie.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
            </div>
            <div className="p-8 -mt-20 relative">
              <h2 className="text-4xl font-bold mb-4">{selectedMovie.title}</h2>
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center text-yellow-400">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="ml-1">{selectedMovie.vote_average?.toFixed(1)}</span>
                </div>
                <div className="flex space-x-2">
                  {selectedMovie.genre_ids.map(genreId => (
                    <span key={genreId} className="text-sm bg-gray-800 px-3 py-1 rounded-full">
                      {genreMap[genreId]}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-gray-300 text-lg mb-6">{selectedMovie.overview}</p>
              <div className="flex space-x-4">
                <button className="flex items-center space-x-2 bg-white text-black px-8 py-3 rounded-lg font-bold hover:bg-gray-200 transition-colors">
                  <Play className="w-5 h-5" />
                  <span>Play</span>
                </button>
                <button className="flex items-center space-x-2 bg-gray-800 text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-700 transition-colors">
                  <Info className="w-5 h-5" />
                  <span>More Info</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-40">
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            <a href="#" className="text-xl hover:text-gray-300">Home</a>
            <a href="#" className="text-xl hover:text-gray-300">Movies</a>
            <a href="#" className="text-xl hover:text-gray-300">My List</a>
            <button
              className="text-xl hover:text-gray-300"
              onClick={() => setShowMobileMenu(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-24">
        {/* Featured Movie */}
        {movies.length > 0 && (
          <div className="relative h-[70vh] mb-12 rounded-xl overflow-hidden">
            <img
              src={`https://image.tmdb.org/t/p/original${movies[0].poster_path}`}
              alt={movies[0].title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent">
              <div className="absolute bottom-0 left-0 p-8">
                <h2 className="text-4xl font-bold mb-4">{movies[0].title}</h2>
                <p className="text-lg max-w-2xl mb-4">{movies[0].overview}</p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleMovieClick(movies[0])}
                    className="flex items-center space-x-2 bg-netflix-red text-white px-8 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors"
                  >
                    <Play className="w-5 h-5" />
                    <span>Play</span>
                  </button>
                  <button
                    onClick={() => handleMovieClick(movies[0])}
                    className="flex items-center space-x-2 bg-gray-800 text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-700 transition-colors"
                  >
                    <Info className="w-5 h-5" />
                    <span>More Info</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preferred Movies Section */}
        {getPreferredMovies().length > 0 && (
          <MovieRow title="Recommended for You" movies={getPreferredMovies()} />
        )}

        {/* All Movies Section with Pagination */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">All Movies</h2>
          <MovieGrid movies={allMovies} />
          <div className="flex justify-center items-center mt-8 space-x-4">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                currentPage === 1
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-netflix-red text-white hover:bg-red-700'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Previous</span>
            </button>
            <span className="text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                currentPage === totalPages
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-netflix-red text-white hover:bg-red-700'
              }`}
            >
              <span>Next</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Genre Sections */}
        {Object.entries(genreMap).map(([genreId, genreName]) => {
          const genreMovies = getMoviesByGenre(parseInt(genreId));
          return genreMovies.length > 0 && (
            <MovieRow key={genreId} title={genreName} movies={genreMovies} />
          );
        })}

        {/* Similar Movies Section */}
        {selectedMovie && recommendations.length > 0 && (
          <MovieRow
            title={`More like ${selectedMovie.title}`}
            movies={recommendations}
          />
        )}
      </main>
    </div>
  );
}

export default App;