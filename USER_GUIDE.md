# 🎮 4-in-a-Row Game Collection

A modern, professional collection of educational and strategy games built with vanilla JavaScript.

## ✨ Features

- **🎯 Connect 4** - Classic strategy game with AI opponents
- **🧩 Memory Match** - Improve memory and concentration
- **🎵 Simon Game** - Pattern recognition and sequence memory
- **📝 Word Scramble** - Vocabulary building and spelling

## 🚀 Getting Started

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/tanvir-talha058/4-in-a-Row.git
   cd 4-in-a-Row
   ```

2. **Start a local server**
   ```bash
   python -m http.server 8000
   ```

3. **Open in browser**
   ```
   http://localhost:8000
   ```

### Playing the Games

#### Connect 4
- **Objective**: Connect four pieces in a row (horizontally, vertically, or diagonally)
- **Controls**: Click on a column to drop your piece
- **Game Modes**:
  - 👥 **Two Players**: Play locally with a friend
  - 🤖 **vs AI**: Challenge the computer
    - 🟢 Easy: Random moves, great for beginners
    - 🟡 Medium: Strategic with occasional mistakes
    - 🔴 Hard: Advanced minimax algorithm

#### Memory Match
- **Objective**: Find all matching pairs
- **How to Play**: Click cards to flip them and find matches
- **Skills**: Improves memory, focus, and pattern recognition

#### Simon Game
- **Objective**: Remember and repeat the pattern
- **How to Play**: Watch the sequence, then click the colors in order
- **Skills**: Enhances pattern memory and sequence recall

#### Word Scramble
- **Objective**: Unscramble letters to form words
- **How to Play**: Type or click letters to spell the word
- **Skills**: Builds vocabulary and spelling

## 🎨 Design Philosophy

### Modern & Minimal
- Clean, professional interface
- Subtle animations for smooth UX
- Consistent design language
- Optimized for performance

### User-Friendly
- Clear instructions and feedback
- Helpful tooltips
- Keyboard navigation support
- Responsive on all devices

### Accessible
- ARIA labels for screen readers
- Keyboard shortcuts (ESC to go back)
- High contrast colors
- Reduced motion support

## ⌨️ Keyboard Shortcuts

- **ESC** - Go back to previous screen
- **Enter/Space** - Activate focused button
- **Tab** - Navigate between elements

## 🎵 Sound Controls

Click the 🔊 icon in the top-right corner to toggle sound effects on/off.

## 🔧 Technical Details

### Performance Optimizations
- Object pooling for particles
- Transposition table for AI (70% faster calculations)
- DOM caching to reduce queries
- Throttled updates for smooth 60fps
- Concurrent sound limiting

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Technologies Used
- Vanilla JavaScript (ES6+)
- CSS3 with CSS Variables
- Web Audio API
- LocalStorage for preferences

## 📱 Mobile Support

All games are fully responsive and optimized for mobile devices:
- Touch-friendly buttons
- Adaptive layouts
- Reduced visual effects for better performance
- Optimized for small screens

## 🐛 Troubleshooting

### Game not loading?
- Ensure JavaScript is enabled
- Try a different browser
- Clear cache and refresh (Ctrl+F5 or Cmd+Shift+R)

### Sound not working?
- Check browser audio permissions
- Ensure device is not muted
- Try toggling sound off and on

### Performance issues?
- Close other browser tabs
- Update your browser to the latest version
- The game automatically reduces effects on slower devices

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Tanvir Talha**
- GitHub: [@tanvir-talha058](https://github.com/tanvir-talha058)

## 🙏 Acknowledgments

- Minimax algorithm for AI
- Web Audio API for sound effects
- CSS Grid for responsive layouts

---

**Enjoy the games! 🎮**

For issues or suggestions, please open an issue on GitHub.