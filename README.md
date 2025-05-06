# Next.js Frontend Setup

Follow these instructions to clone and run the Next.js project from GitHub.

## 🔁 Step 1: Clone the Repository

Use the following command to clone the repository:

```bash
git clone https://github.com/your-username/your-repo-name.git
```

> Replace the URL above with the actual repository URL.

Navigate into the project folder:

```bash
cd your-repo-name
```

## 📦 Step 2: Install Dependencies

Install the required packages:

```bash
npm install
```

## ⚙️ Step 3: Configure the API Base URL

Navigate to the `api/api.jsx` file and locate the `baseURL` configuration.

By default, the `baseURL` is set to point to the deployed backend API.

```javascript
const baseURL = "https://your-live-backend-url.com"; // Default
```

If you want to use a **local backend**, update the `baseURL` as shown below:

```javascript
const baseURL = "http://localhost:5000"; // For local development
```

> Make sure your local backend server is running on the same port.

## 🚀 Step 4: Run the Development Server

Start the Next.js development server with the following command:

```bash
npm run dev
```

The app should now be running at [http://localhost:3000](http://localhost:3000).

---

Let me know if you'd like to include build/deployment instructions or environment variable setup.
