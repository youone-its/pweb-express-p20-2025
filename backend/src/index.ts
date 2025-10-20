import { createApp, startServer, errorHandler } from './middleware';
import { setupAuthRoutes, setupGenreRoutes, setupBookRoutes } from './routes/authGenre';
import { setupTransactionRoutes } from './routes/transactions';

// Create Express app dengan middleware
const app = createApp();

// Setup semua routes
setupAuthRoutes(app);
setupGenreRoutes(app);
setupBookRoutes(app);
setupTransactionRoutes(app);

// Error handler (harus paling akhir)
app.use(errorHandler);

// Start server
startServer(app);