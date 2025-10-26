import { createApp, startServer, errorHandler } from './middleware';
import { setupAuthRoutes, setupGenreRoutes, setupBookRoutes } from './routes/authGenre';
import { setupTransactionRoutes } from './routes/transactions';

const app = createApp();

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// GET / - API Documentation
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: "IT Literature Shop API",
    version: "1.0.0",
    endpoints: {
      auth: {
        register: { 
          method: "POST", 
          path: "/auth/register", 
          description: "Register new user",
          body: { email: "string", password: "string", username: "string?" }
        },
        login: { 
          method: "POST", 
          path: "/auth/login", 
          description: "Login and get JWT token",
          body: { email: "string", password: "string" }
        },
        getMe: { 
          method: "GET", 
          path: "/auth/me", 
          description: "Get current user profile", 
          auth: true 
        }
      },
      genre: {
        create: { 
          method: "POST", 
          path: "/genre", 
          description: "Create new genre", 
          auth: true,
          body: { name: "string" }
        },
        list: { 
          method: "GET", 
          path: "/genre", 
          description: "Get all genres" 
        },
        detail: { 
          method: "GET", 
          path: "/genre/:genre_id", 
          description: "Get genre detail" 
        },
        update: { 
          method: "PATCH", 
          path: "/genre/:genre_id", 
          description: "Update genre", 
          auth: true,
          body: { name: "string" }
        },
        delete: { 
          method: "DELETE", 
          path: "/genre/:genre_id", 
          description: "Delete genre (soft delete)", 
          auth: true 
        }
      },
      books: {
        create: { 
          method: "POST", 
          path: "/books", 
          description: "Create new book", 
          auth: true,
          body: {
            title: "string",
            writer: "string",
            publisher: "string",
            publication_year: "number (max 2025)",
            description: "string?",
            price: "number",
            stock_quantity: "integer",
            genre_id: "number"
          }
        },
        list: { 
          method: "GET", 
          path: "/books", 
          description: "Get all books with pagination, search, and sorting", 
          query: "?page=1&limit=10&search=keyword&sortBy=title|publication_year|price" 
        },
        detail: { 
          method: "GET", 
          path: "/books/:book_id", 
          description: "Get book detail with full information" 
        },
        byGenre: { 
          method: "GET", 
          path: "/books/genre/:genre_id", 
          description: "Get books by genre with pagination, search, and sorting", 
          query: "?page=1&limit=10&search=keyword&sortBy=title|publication_year|price" 
        },
        update: { 
          method: "PATCH", 
          path: "/books/:book_id", 
          description: "Update book", 
          auth: true 
        },
        delete: { 
          method: "DELETE", 
          path: "/books/:book_id", 
          description: "Delete book (soft delete)", 
          auth: true 
        }
      },
      transactions: {
        create: { 
          method: "POST", 
          path: "/transactions", 
          description: "Create new order/transaction", 
          auth: true,
          body: {
            items: [
              { book_id: "number", quantity: "integer" }
            ]
          }
        },
        list: { 
          method: "GET", 
          path: "/transactions", 
          description: "Get all user transactions with search by ID and sort by price", 
          query: "?search=transaction_id&sortBy=price", 
          auth: true 
        },
        detail: { 
          method: "GET", 
          path: "/transactions/:transaction_id", 
          description: "Get transaction detail", 
          auth: true 
        },
        statistics: { 
          method: "GET", 
          path: "/transactions/statistics", 
          description: "Get sales statistics (total transactions, avg, most/least popular genre)", 
          auth: true 
        }
      }
    },
    notes: {
      authentication: "Use Bearer token in Authorization header for protected endpoints",
      softDelete: "Deleted records are not removed from database, only marked as deleted",
      pagination: "Default page=1, limit=10",
      sorting: "Available sort options: title, publication_year, price, created_at (default)",
      validation: "Stock must be integer, publication_year max 2025"
    }
  });
});

// Setup all routes
setupAuthRoutes(app);
setupGenreRoutes(app);
setupBookRoutes(app);
setupTransactionRoutes(app);

// Error handler (must be last)
app.use(errorHandler);

// Start server
startServer(app);

export default app;
