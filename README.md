# 4 in a Row

A classic two-player connection game built with Pygame where players take turns dropping colored discs into a vertical grid, aiming to connect four of their discs horizontally, vertically, or diagonally.

![4 in a Row Game](https://github.com/tanvir-talha058/4-in-a-Row/raw/main/screenshots/gameplay.png)

## Features

- Interactive game board with visual feedback
- Two-player gameplay (alternating turns)
- Win detection for horizontal, vertical, and diagonal connections
- Game state tracking and score keeping
- Simple and intuitive user interface
- Smooth animations and visual effects

## Tech Stack

- Python 3
- Pygame
- NumPy (for grid management)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/tanvir-talha058/4-in-a-Row.git
   ```

2. Navigate to the project directory:
   ```
   cd 4-in-a-Row
   ```

3. Install the required dependencies:
   ```
   pip install pygame numpy
   ```

4. Run the game:
   ```
   python main.py
   ```

## Requirements

- Python 3.7+
- Pygame 2.0.0+
- NumPy 1.19.0+

## How to Play

1. The game is played on a vertical grid with 7 columns and 6 rows.
2. Players take turns dropping their colored discs into one of the columns.
3. The disc will fall to the lowest available position in the selected column.
4. The first player to connect four of their discs horizontally, vertically, or diagonally wins.
5. If the grid fills up without a winner, the game ends in a draw.

## Game Controls

- Click on a column to drop your disc
- Press 'R' to reset the game
- Press 'ESC' to exit the game
- Score is displayed at the top of the game window

## Screenshots

![Start Screen](https://github.com/tanvir-talha058/4-in-a-Row/raw/main/screenshots/start-screen.png)
![Gameplay](https://github.com/tanvir-talha058/4-in-a-Row/raw/main/screenshots/mid-game.png)
![Win Screen](https://github.com/tanvir-talha058/4-in-a-Row/raw/main/screenshots/win-screen.png)



## Future Enhancements

- AI opponent with adjustable difficulty levels
- Game settings (board size, winning condition)
- Sound effects and background music
- Custom themes and disc colors
- Game statistics and high scores
- Network multiplayer functionality

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature-branch`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some feature'`)
5. Push to the branch (`git push origin feature-branch`)
6. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

- Game inspired by the classic Connect Four board game
- Thanks to the Pygame community for their excellent documentation and examples

---

Created with ❤️ by Tanvir Talha
