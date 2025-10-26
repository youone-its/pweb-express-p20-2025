import { createApp, startServer, errorHandler } from './middleware';
import { setupAuthRoutes, setupGenreRoutes, setupBookRoutes } from './routes/authGenre';
import { setupTransactionRoutes } from './routes/transactions';

const app = createApp();

setupAuthRoutes(app);
setupGenreRoutes(app);
setupBookRoutes(app);
setupTransactionRoutes(app);

app.use(errorHandler);

startServer(app);