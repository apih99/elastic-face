# �� The Elastic Face

An interactive React application featuring a playful, elastic face with multiple emotional expressions. Drag any part of the face to stretch it and watch it bounce back with delightful animations and sounds!

![Elastic Face Demo](https://img.shields.io/badge/Demo-Live-brightgreen) ![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black) ![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-222222?logo=github&logoColor=white)

## ✨ Features

### 🎭 **Multiple Facial Expressions**
- **😊 Happy** - Bright yellow face with a cheerful smile
- **😲 Surprised** - Wide eyes and "O" shaped mouth showing shock
- **😴 Sleepy** - Droopy eyes with floating "z" letters
- **😡 Angry** - Red face with narrow eyes and angry eyebrows

### 👁️ **Dynamic Eye Shapes**
- Normal round eyes with pupils
- Wide surprised eyes
- Sleepy droopy eyes with "z" animations
- Narrow angry eyes with eyebrows

### 👄 **Dynamic Mouth Shapes**
- Curved smile for happiness
- Oval "O" shape for surprise
- Neutral line for sleepy mood
- Downward frown for anger

### 🎮 **Interactive Features**
- **Elastic dragging** - Click and drag any facial feature
- **Mood selector** - Choose between different expressions
- **Sound effects** - Unique sounds for each mood and interaction
- **Smooth animations** - Bouncy elastic animations when releasing
- **Responsive design** - Works on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/[YOUR-USERNAME]/elastic-face.git
   cd elastic-face
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## 🌐 GitHub Pages Deployment

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

### Setup Instructions

1. **Fork or clone this repository** to your GitHub account

2. **Update the homepage URL** in `package.json`:
   ```json
   "homepage": "https://[YOUR-USERNAME].github.io/elastic-face"
   ```
   Replace `[YOUR-USERNAME]` with your actual GitHub username.

3. **Enable GitHub Pages** in your repository:
   - Go to repository **Settings** → **Pages**
   - Under "Source", select **GitHub Actions**

4. **Push to main branch** - The GitHub Action will automatically:
   - Build the React application
   - Deploy to GitHub Pages
   - Your site will be available at: `https://[YOUR-USERNAME].github.io/elastic-face`

### Manual Deployment (Alternative)

If you prefer manual deployment:

```bash
# Install gh-pages (if not already installed)
npm install --save-dev gh-pages

# Build and deploy
npm run deploy
```

## 🛠️ Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run deploy` - Builds and deploys to GitHub Pages

## 🎨 Customization

### Adding New Expressions
1. Add a new expression configuration in `ElasticFace.js`:
   ```javascript
   const expressions = {
     // ... existing expressions
     excited: {
       name: 'Excited',
       emoji: '🤩',
       faceColor: '#FF69B4',
       cheekColor: '#FF1493',
       eyeShape: 'sparkle',
       mouthShape: 'bigSmile'
     }
   };
   ```

2. Implement the new eye and mouth shapes in the render functions
3. Add corresponding CSS animations in `ElasticFace.css`

### Modifying Colors and Animations
- Edit `ElasticFace.css` to customize colors, animations, and styling
- Modify sound effects in the `playMoodSound` function

## 📱 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-expression`
3. Commit your changes: `git commit -am 'Add excited expression'`
4. Push to the branch: `git push origin feature/new-expression`
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🎯 Future Enhancements

- [ ] Add winking animations
- [ ] Voice recognition for mood changes
- [ ] Save favorite expressions
- [ ] Social sharing functionality
- [ ] More complex facial features (beard, glasses, etc.)
- [ ] Theme customization

## 📞 Support

If you encounter any issues or have questions:
- Open an [issue](https://github.com/[YOUR-USERNAME]/elastic-face/issues)
- Check the [discussions](https://github.com/[YOUR-USERNAME]/elastic-face/discussions)

---

Made with ❤️ and React. Enjoy stretching faces! 🎭
