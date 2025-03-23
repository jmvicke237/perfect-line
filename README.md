# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```

# Perfect Line

A daily puzzle game where you arrange items in the correct order based on their properties.

## How to Play

1. Each row shows a set of items that need to be arranged in a specific order
2. Drag and drop the items to put them in the correct sequence
3. Click "Submit" to check your answers
4. Green squares indicate correct positions, red squares indicate incorrect positions
5. Try to get a perfect score!

## Development

```
npm install
npm run dev
```

## Deployment

This project can be easily deployed using one of these free hosting services:

### Option 1: Netlify (Recommended)

1. Sign up for a free account at [Netlify](https://www.netlify.com/)
2. From the Netlify dashboard, click "Add new site" → "Import an existing project"
3. Connect to your GitHub repository
4. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Click "Deploy site"

Your site will be live at a Netlify URL like `https://perfect-line.netlify.app` (you can customize this in the site settings)

### Option 2: Vercel

1. Sign up for a free account at [Vercel](https://vercel.com/)
2. From the Vercel dashboard, click "Add New" → "Project"
3. Connect to your GitHub repository
4. The build settings should be automatically detected
5. Click "Deploy"

Your site will be live at a Vercel URL like `https://perfect-line.vercel.app`

### Option 3: Manual GitHub Pages Deployment

To deploy to GitHub Pages manually:

1. Update your `package.json` to include:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```
2. Install the gh-pages package:
   ```
   npm install --save-dev gh-pages
   ```
3. Run the deploy command:
   ```
   npm run deploy
   ```
