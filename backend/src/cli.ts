import * as readline from "readline";
import axios, { AxiosInstance } from "axios";

interface User {
  id: string;
  email: string;
  username?: string;
}

interface Genre {
  id: string;
  name: string;
  _count?: { books: number };
}

interface Book {
  id: string;
  title: string;
  writer: string;
  publisher: string;
  publication_year: number;
  description?: string;
  price: number;
  stock_quantity: number;
  genre: Genre;
}

interface Order {
  id: string;
  user_id: string;
  order_items: Array<{
    id: string;
    quantity: number;
    book: Book;
  }>;
  total?: number;
}

class BookStoreCLI {
  private rl: readline.Interface;
  private api: AxiosInstance;
  private currentUser: User | null = null;
  private token: string | null = null;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: "> ",
    });

    this.api = axios.create({
      baseURL: "http://localhost:3000",
      timeout: 5000,
    });
  }

  private prompt(question: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  private log(message: string): void {
    console.log("\n" + message);
  }

  private error(message: string): void {
<<<<<<< HEAD
    console.log('\nError: ' + message);
  }

  private success(message: string): void {
    console.log('\n' + message);
=======
    console.log("\n❌ Error: " + message);
  }

  private success(message: string): void {
    console.log("\n✅ " + message);
>>>>>>> b6f7a2c47a6e9214209efa3f970b8271e7b4c510
  }

  private setAuthHeader(): void {
    if (this.token) {
      this.api.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${this.token}`;
    }
  }

  async register(): Promise<void> {
    this.log("=== REGISTER ===");
    const email = await this.prompt("Email: ");
    const password = await this.prompt("Password: ");
    const username = await this.prompt(
      "Username (optional, press Enter to skip): "
    );

    try {
      const res = await this.api.post("/auth/register", {
        email,
        password,
        username: username || undefined,
      });

      this.success(`Registered as ${res.data.data.email}`);
    } catch (err: any) {
      this.error(err.response?.data?.message || "Registration failed");
    }
  }

  async login(): Promise<void> {
    this.log("=== LOGIN ===");
    const email = await this.prompt("Email: ");
    const password = await this.prompt("Password: ");

    try {
      const res = await this.api.post("/auth/login", { email, password });
      this.token = res.data.data.token;
      this.currentUser = res.data.data.user;
      this.setAuthHeader();
      this.success(`Logged in as ${this.currentUser!.email}`);
      this.success(`token ${this.token}`);
    } catch (err: any) {
      this.error(err.response?.data?.message || "Login failed");
    }
  }

  async logout(): Promise<void> {
    this.token = null;
    this.currentUser = null;
    delete this.api.defaults.headers.common["Authorization"];
    this.success("Logged out");
  }

  async getProfile(): Promise<void> {
    if (!this.token) {
      this.error("Not logged in");
      return;
    }

    try {
      const res = await this.api.get("/auth/me");
      const user = res.data.data;
      this.log(
        `=== PROFILE ===\nID: ${user.id}\nEmail: ${user.email}\nUsername: ${
          user.username || "-"
        }`
      );
    } catch (err: any) {
      this.error(err.response?.data?.message || "Failed to get profile");
    }
  }

  async createGenre(): Promise<void> {
    if (!this.token) {
      this.error("Not logged in");
      return;
    }

    const name = await this.prompt("Genre name: ");

    try {
      const res = await this.api.post("/genre", { name });
      this.success(`Genre "${res.data.data.name}" created`);
    } catch (err: any) {
      this.error(err.response?.data?.message || "Failed to create genre");
    }
  }

  async listGenres(): Promise<void> {
    try {
      const res = await this.api.get("/genre");
      const genres: Genre[] = res.data.data;

      if (genres.length === 0) {
        this.log("=== GENRES === (empty)");
        return;
      }

      this.log("=== GENRES ===");
      genres.forEach((g) => {
        console.log(`[${g.id}] ${g.name} (${g._count?.books || 0} books)`);
      });
    } catch (err: any) {
      this.error(err.response?.data?.message || "Failed to fetch genres");
    }
  }

  async updateGenre(): Promise<void> {
    if (!this.token) {
      this.error("Not logged in");
      return;
    }

    const genreId = await this.prompt("Genre ID: ");
    const name = await this.prompt("New name: ");

    try {
      const res = await this.api.patch(`/genre/${genreId}`, { name });
      this.success(`Genre updated to "${res.data.data.name}"`);
    } catch (err: any) {
      this.error(err.response?.data?.message || "Failed to update genre");
    }
  }

  async deleteGenre(): Promise<void> {
    if (!this.token) {
      this.error("Not logged in");
      return;
    }

    const genreId = await this.prompt("Genre ID: ");

    try {
      await this.api.delete(`/genre/${genreId}`);
      this.success("Genre deleted");
    } catch (err: any) {
      this.error(err.response?.data?.message || "Failed to delete genre");
    }
  }

  async createBook(): Promise<void> {
    if (!this.token) {
      this.error("Not logged in");
      return;
    }

<<<<<<< HEAD
    this.log('=== CREATE BOOK ===');
    
=======
    this.log("=== CREATE BOOK ===");

    // Fetch genres untuk dipilih
>>>>>>> b6f7a2c47a6e9214209efa3f970b8271e7b4c510
    let genres: Genre[] = [];
    try {
      const res = await this.api.get("/genre");
      genres = res.data.data;
    } catch (err: any) {
      this.error("Failed to fetch genres");
      return;
    }

    if (genres.length === 0) {
      this.error("No genres available. Create a genre first.");
      return;
    }

<<<<<<< HEAD
    this.log('Available Genres:');
=======
    // Tampilkan daftar genre
    this.log("Available Genres:");
>>>>>>> b6f7a2c47a6e9214209efa3f970b8271e7b4c510
    genres.forEach((g, idx) => {
      console.log(`${idx + 1}. ${g.name}`);
    });

    const genreInput = await this.prompt(
      "Select genre (by number 1/2/3... or by name): "
    );

    let genreId: string | null = null;
    let selectedGenreName: string | null = null;

    const genreNumber = parseInt(genreInput);
<<<<<<< HEAD
    if (!isNaN(genreNumber) && genreNumber > 0 && genreNumber <= genres.length) {
      genreId = genres[genreNumber - 1].id;
      selectedGenreName = genres[genreNumber - 1].name;
    } else {
      const foundGenre = genres.find(g => g.name.toLowerCase() === genreInput.toLowerCase());
=======
    if (
      !isNaN(genreNumber) &&
      genreNumber > 0 &&
      genreNumber <= genres.length
    ) {
      // Input adalah nomor
      genreId = genres[genreNumber - 1].id;
      selectedGenreName = genres[genreNumber - 1].name;
    } else {
      // Input adalah string (nama genre)
      const foundGenre = genres.find(
        (g) => g.name.toLowerCase() === genreInput.toLowerCase()
      );
>>>>>>> b6f7a2c47a6e9214209efa3f970b8271e7b4c510
      if (foundGenre) {
        genreId = foundGenre.id;
        selectedGenreName = foundGenre.name;
      }
    }

    if (!genreId) {
      this.error(
        "Invalid genre selection. Please enter a valid number or genre name."
      );
      return;
    }

    const title = await this.prompt("Title: ");
    const writer = await this.prompt("Writer: ");
    const publisher = await this.prompt("Publisher: ");
    const publicationYear = parseInt(await this.prompt("Publication year: "));
    const description = await this.prompt("Description (optional): ");
    const price = parseFloat(await this.prompt("Price: "));
    const stockQuantity = parseInt(await this.prompt("Stock quantity: "));

    try {
      const res = await this.api.post("/books", {
        title,
        writer,
        publisher,
        publication_year: publicationYear,
        description: description || undefined,
        price,
        stock_quantity: stockQuantity,
        genre_id: genreId,
      });

      this.success(
        `Book "${res.data.data.title}" created with genre "${selectedGenreName}"`
      );
    } catch (err: any) {
      this.error(err.response?.data?.message || "Failed to create book");
    }
  }

  async listBooks(): Promise<void> {
    const page = (await this.prompt("Page (default 1): ")) || "1";
    const limit = (await this.prompt("Limit (default 10): ")) || "10";
    const search = await this.prompt("Search by title/writer (optional): ");

    try {
      const res = await this.api.get("/books", {
        params: {
          page: parseInt(page),
          limit: parseInt(limit),
          search: search || undefined,
        },
      });

      const books: Book[] = res.data.data;
      const { pagination } = res.data;

      if (books.length === 0) {
        this.log("=== BOOKS === (empty)");
        return;
      }

      this.log(
        `=== BOOKS === (Page ${pagination.page}/${pagination.totalPages}, Total: ${pagination.total})`
      );
      books.forEach((b) => {
        console.log(
          `[${b.id}] ${b.title} by ${b.writer} (${b.genre.name}) - $${b.price} (${b.stock_quantity} stock)`
        );
      });
    } catch (err: any) {
      this.error(err.response?.data?.message || "Failed to fetch books");
    }
  }

  async listBooksByGenre(): Promise<void> {
    const genreId = await this.prompt("Genre ID: ");
    const page = (await this.prompt("Page (default 1): ")) || "1";

    try {
      const res = await this.api.get(`/books/genre/${genreId}`, {
        params: { page: parseInt(page), limit: 10 },
      });

      const books: Book[] = res.data.data;
      const { pagination } = res.data;

      if (books.length === 0) {
        this.log("=== BOOKS BY GENRE === (empty)");
        return;
      }

      this.log(
        `=== BOOKS BY GENRE === (Page ${pagination.page}/${pagination.totalPages})`
      );
      books.forEach((b) => {
        console.log(`[${b.id}] ${b.title} - $${b.price}`);
      });
    } catch (err: any) {
      this.error(err.response?.data?.message || "Failed to fetch books");
    }
  }

  async updateBook(): Promise<void> {
    if (!this.token) {
      this.error("Not logged in");
      return;
    }

    const bookId = await this.prompt("Book ID: ");
    this.log("(Leave empty to skip updating a field)");
    const title = await this.prompt("Title: ");
    const price = await this.prompt("Price: ");
    const stockQuantity = await this.prompt("Stock quantity: ");

    const data: any = {};
    if (title) data.title = title;
    if (price) data.price = parseFloat(price);
    if (stockQuantity) data.stock_quantity = parseInt(stockQuantity);

    if (Object.keys(data).length === 0) {
      this.error("No fields to update");
      return;
    }

    try {
      const res = await this.api.patch(`/books/${bookId}`, data);
      this.success(`Book "${res.data.data.title}" updated`);
    } catch (err: any) {
      this.error(err.response?.data?.message || "Failed to update book");
    }
  }

  async deleteBook(): Promise<void> {
    if (!this.token) {
      this.error("Not logged in");
      return;
    }

    const bookId = await this.prompt("Book ID: ");

    try {
      await this.api.delete(`/books/${bookId}`);
      this.success("Book deleted");
    } catch (err: any) {
      this.error(err.response?.data?.message || "Failed to delete book");
    }
  }

  async createTransaction(): Promise<void> {
    if (!this.token) {
      this.error("Not logged in");
      return;
    }

    this.log("=== CREATE ORDER ===");
    const itemsInput = await this.prompt(
      "Enter items as: book_id:quantity,book_id:quantity (e.g., 123:2,456:1): "
    );

    const items = itemsInput.split(",").map((item) => {
      const [bookId, quantity] = item.trim().split(":");
      return { book_id: bookId, quantity: parseInt(quantity) };
    });

    try {
      const res = await this.api.post("/transactions", { items });
      this.success(`Order created! Total: $${res.data.data.total}`);
    } catch (err: any) {
      this.error(err.response?.data?.message || "Failed to create order");
    }
  }

  async listTransactions(): Promise<void> {
    if (!this.token) {
      this.error("Not logged in");
      return;
    }

    try {
      const res = await this.api.get("/transactions");
      const orders: Order[] = res.data.data;

      if (orders.length === 0) {
        this.log("=== ORDERS === (empty)");
        return;
      }

      this.log("=== ORDERS ===");
      orders.forEach((o) => {
        console.log(
          `[${o.id}] Total: $${o.total} (${o.order_items.length} items)`
        );
      });
    } catch (err: any) {
      this.error(err.response?.data?.message || "Failed to fetch orders");
    }
  }

  async getTransaction(): Promise<void> {
    if (!this.token) {
      this.error("Not logged in");
      return;
    }

    const transactionId = await this.prompt("Order ID: ");

    try {
      const res = await this.api.get(`/transactions/${transactionId}`);
      const order = res.data.data;

      this.log(
        `=== ORDER DETAILS ===\nID: ${order.id}\nTotal: $${order.total}\nItems:`
      );
      order.order_items.forEach((item: any) => {
        console.log(
          `  - ${item.book.title} x${item.quantity} = $${
            item.book.price * item.quantity
          }`
        );
      });
    } catch (err: any) {
      this.error(err.response?.data?.message || "Failed to fetch order");
    }
  }

  async getStatistics(): Promise<void> {
    if (!this.token) {
      this.error("Not logged in");
      return;
    }

    try {
      const res = await this.api.get("/transactions/statistics");
      const stats = res.data.data;

      this.log(
        `=== STATISTICS ===\nTotal Transactions: ${
          stats.totalTransactions
        }\nAverage Per Transaction: $${stats.avgTransaction.toFixed(
          2
        )}\nMost Popular Genre: ${
          stats.mostPopularGenre || "-"
        }\nLeast Popular Genre: ${stats.leastPopularGenre || "-"}`
      );
    } catch (err: any) {
      this.error(err.response?.data?.message || "Failed to fetch statistics");
    }
  }

  showMenu(): void {
    console.clear();
    console.log("╔════════════════════════════════════════╗");
    console.log("║       BOOK STORE CLI INTERFACE         ║");
    console.log("╚════════════════════════════════════════╝\n");

    if (this.currentUser) {
      console.log(`📖 Logged in as: ${this.currentUser.email}\n`);
      console.log("=== MAIN MENU ===");
      console.log("1. View Profile");
      console.log("2. Logout");
      console.log("\n=== GENRE MANAGEMENT ===");
      console.log("3. List Genres");
      console.log("4. Create Genre");
      console.log("5. Update Genre");
      console.log("6. Delete Genre");
      console.log("\n=== BOOK MANAGEMENT ===");
      console.log("7. List Books");
      console.log("8. List Books by Genre");
      console.log("9. Create Book");
      console.log("10. Update Book");
      console.log("11. Delete Book");
      console.log("\n=== TRANSACTIONS ===");
      console.log("12. Create Order");
      console.log("13. List Orders");
      console.log("14. Get Order Details");
      console.log("15. View Statistics");
      console.log("\n16. Exit");
    } else {
      console.log("=== MAIN MENU ===");
      console.log("1. Register");
      console.log("2. Login");
      console.log("3. Exit");
    }

    console.log("");
  }

  async handleMenuLoggedIn(choice: string): Promise<boolean> {
    switch (choice) {
      case "1":
        await this.getProfile();
        break;
      case "2":
        await this.logout();
        break;
      case "3":
        await this.listGenres();
        break;
      case "4":
        await this.createGenre();
        break;
      case "5":
        await this.updateGenre();
        break;
      case "6":
        await this.deleteGenre();
        break;
      case "7":
        await this.listBooks();
        break;
      case "8":
        await this.listBooksByGenre();
        break;
      case "9":
        await this.createBook();
        break;
      case "10":
        await this.updateBook();
        break;
      case "11":
        await this.deleteBook();
        break;
      case "12":
        await this.createTransaction();
        break;
      case "13":
        await this.listTransactions();
        break;
      case "14":
        await this.getTransaction();
        break;
      case "15":
        await this.getStatistics();
        break;
      case "16":
        return false;
      default:
        this.error("Invalid choice");
    }
    return true;
  }

  async handleMenuLoggedOut(choice: string): Promise<boolean> {
    switch (choice) {
      case "1":
        await this.register();
        break;
      case "2":
        await this.login();
        break;
      case "3":
        return false;
      default:
        this.error("Invalid choice");
    }
    return true;
  }

  async start(): Promise<void> {
    let running = true;

    while (running) {
      this.showMenu();
      const choice = await this.prompt("Choose option: ");

      if (this.currentUser) {
        running = await this.handleMenuLoggedIn(choice);
      } else {
        running = await this.handleMenuLoggedOut(choice);
      }

      if (running) {
        await this.prompt("\nPress Enter to continue...");
      }
    }

    this.success("Goodbye!");
    this.rl.close();
    process.exit(0);
  }
}

const cli = new BookStoreCLI();
cli.start();
