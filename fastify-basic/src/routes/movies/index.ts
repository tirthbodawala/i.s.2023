import { FastifyPluginAsync } from "fastify"
import moviesData from '../../data/movies.json' assert { type: "json" };

/**
 * Create movies map for in memory database
 */
const moviesMap = new Map();
let maxMovieId = moviesData.movies[moviesData.movies.length - 1].id;

// Read all movies in memory on initial load
moviesData.movies.forEach(movie => {
  moviesMap.set(movie.id, movie);
});

const movies: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  /**
   * Get all movies
   * URL `/movies`
   */
  fastify.get('/', async function (request, reply) {
    return Array.from(moviesMap.values());
  })

  /**
   * Get a movie by id
   * URL `/movies/1`
   */
  fastify.get<{
    Params: {
      id: number,
    }
  }>('/:id', async function (request, reply) {
    const { id } = request.params;
    if (!moviesMap.has(+id)) {
      return reply.code(404).send({
        error: 'Movie not found',
      });
    }
    return moviesMap.get(+id);
  });

  /**
   * Create a movie without validations for DTO
   */
  fastify.post<{
    Body: {
      title: string,
      year: string,
      runtime: string,
      genres: string [],
      director: string,
      actors: string,
      plot: string,
      posterUrl: string,
    }
  }>('/', async function (request, reply) {
    maxMovieId += 1;
    moviesMap.set(maxMovieId, { ...request.body, id: maxMovieId });
    return moviesMap.get(maxMovieId);
  });
}

export default movies;
