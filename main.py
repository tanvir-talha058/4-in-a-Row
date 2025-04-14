import pygame
import sys
import numpy as np
import random
import math

# Initialize pygame
pygame.init()

# Colors
BLACK = (0, 0, 0)
BLUE = (0, 123, 167)
RED = (255, 56, 56)
CYAN = (64, 177, 212)
DARK_GREY = (50, 50, 50)
GREY = (120, 120, 120)
ORANGE = (255, 165, 0)
PURPLE = (150, 111, 214)
WHITE = (255, 255, 255)
# BG_COLOR = (255, 160, 122)  # Salmon-like color from the image
BG_COLOR = (176, 0, 81)  # A slate blue-gray color that will complement the other colors

# Game constants
ROW_COUNT = 6
COLUMN_COUNT = 7
SQUARE_SIZE = 80
RADIUS = int(SQUARE_SIZE / 2 - 5)
WIDTH = COLUMN_COUNT * SQUARE_SIZE
HEIGHT = (ROW_COUNT + 1) * SQUARE_SIZE
WINDOW_SIZE = (WIDTH, HEIGHT)

# Fonts
pygame.font.init()
TITLE_FONT = pygame.font.SysFont("sans-serif", 40, bold=True)
MAIN_FONT = pygame.font.SysFont("sans-serif", 24)
BUTTON_FONT = pygame.font.SysFont("sans-serif", 20)

# Game states
MENU = 0
GAME = 1
DIFFICULTY = 2
GAME_OVER = 3

# Difficulty levels
EASY = 0
MEDIUM = 1
HARD = 2

class Connect4Game:
    def __init__(self):
        self.screen = pygame.display.set_mode(WINDOW_SIZE)
        pygame.display.set_caption("4 in a Row")
        self.clock = pygame.time.Clock()
        
        self.game_state = MENU
        self.board = np.zeros((ROW_COUNT, COLUMN_COUNT))
        self.game_over = False
        self.turn = 0  # 0 for player 1, 1 for player 2 or AI
        self.difficulty = MEDIUM
        self.vs_ai = True
        self.winner = None
        
        # Preload sounds
        self.drop_sound = pygame.mixer.Sound("drop.wav") if self.sound_exists("drop.wav") else None
        self.win_sound = pygame.mixer.Sound("win.wav") if self.sound_exists("win.wav") else None
        
        # Animation variables
        self.animation_active = False
        self.animation_col = 0
        self.animation_row = 0
        self.animation_piece = 0
        self.animation_y = 0
        self.animation_speed = 20
    
    def sound_exists(self, filename):
        try:
            open(filename)
            return True
        except FileNotFoundError:
            return False
    
    def create_board(self):
        self.board = np.zeros((ROW_COUNT, COLUMN_COUNT))
        return self.board
    
    def drop_piece(self, row, col, piece):
        self.board[row][col] = piece
        
    def is_valid_location(self, col):
        return 0 <= col < COLUMN_COUNT and self.board[ROW_COUNT-1][col] == 0
    
    def get_next_open_row(self, col):
        for r in range(ROW_COUNT):
            if self.board[r][col] == 0:
                return r
        return -1
    
    def winning_move(self, piece):
        # Check horizontal locations
        for c in range(COLUMN_COUNT-3):
            for r in range(ROW_COUNT):
                if (self.board[r][c] == piece and 
                    self.board[r][c+1] == piece and 
                    self.board[r][c+2] == piece and 
                    self.board[r][c+3] == piece):
                    return True
                
        # Check vertical locations
        for c in range(COLUMN_COUNT):
            for r in range(ROW_COUNT-3):
                if (self.board[r][c] == piece and 
                    self.board[r+1][c] == piece and 
                    self.board[r+2][c] == piece and 
                    self.board[r+3][c] == piece):
                    return True
                
        # Check positively sloped diagonals
        for c in range(COLUMN_COUNT-3):
            for r in range(ROW_COUNT-3):
                if (self.board[r][c] == piece and 
                    self.board[r+1][c+1] == piece and 
                    self.board[r+2][c+2] == piece and 
                    self.board[r+3][c+3] == piece):
                    return True
                
        # Check negatively sloped diagonals
        for c in range(COLUMN_COUNT-3):
            for r in range(3, ROW_COUNT):
                if (self.board[r][c] == piece and 
                    self.board[r-1][c+1] == piece and 
                    self.board[r-2][c+2] == piece and 
                    self.board[r-3][c+3] == piece):
                    return True
        
        return False
    
    def is_board_full(self):
        return not any(self.board[ROW_COUNT-1][col] == 0 for col in range(COLUMN_COUNT))
    
    def draw_rounded_rect(self, surface, rect, color, corner_radius):
        """Draw a rounded rectangle"""
        if corner_radius < 0:
            corner_radius = 0
        
        # Draw main rect
        pygame.draw.rect(surface, color, rect, border_radius=corner_radius)
    
    def draw_board(self):
        self.screen.fill(BG_COLOR)
        
        # Draw the back button
        back_btn = pygame.Rect(20, 20, 50, 50)
        pygame.draw.circle(self.screen, (160, 82, 45), back_btn.center, 25)
        # Draw the arrow
        points = [(35, 45), (55, 45), (45, 35)]
        pygame.draw.polygon(self.screen, WHITE, points)
        
        # Draw the game board
        board_rect = pygame.Rect(0, SQUARE_SIZE, WIDTH, HEIGHT - SQUARE_SIZE)
        pygame.draw.rect(self.screen, DARK_GREY, board_rect)
        
        for c in range(COLUMN_COUNT):
            for r in range(ROW_COUNT):
                center_x = int(c*SQUARE_SIZE + SQUARE_SIZE/2)
                center_y = int((r+1)*SQUARE_SIZE + SQUARE_SIZE/2)
                pygame.draw.circle(self.screen, GREY, (center_x, center_y), RADIUS)
        
        # Draw the pieces
        for c in range(COLUMN_COUNT):
            for r in range(ROW_COUNT):
                center_x = int(c*SQUARE_SIZE + SQUARE_SIZE/2)
                center_y = HEIGHT - int(r*SQUARE_SIZE + SQUARE_SIZE/2)
                
                if self.board[r][c] == 1:
                    pygame.draw.circle(self.screen, RED, (center_x, center_y), RADIUS)
                elif self.board[r][c] == 2:
                    pygame.draw.circle(self.screen, CYAN, (center_x, center_y), RADIUS)
        
        # Draw the top piece (preview)
        if not self.game_over and self.game_state == GAME and not self.animation_active:
            pos_x = pygame.mouse.get_pos()[0]
            if 0 < pos_x < WIDTH:
                col = pos_x // SQUARE_SIZE
                if self.is_valid_location(col):
                    color = RED if self.turn == 0 else CYAN
                    pygame.draw.circle(self.screen, color, (int(col*SQUARE_SIZE + SQUARE_SIZE/2), int(SQUARE_SIZE/2)), RADIUS)
        
        # Draw animated piece if active
        if self.animation_active:
            color = RED if self.animation_piece == 1 else CYAN
            center_x = int(self.animation_col * SQUARE_SIZE + SQUARE_SIZE/2)
            pygame.draw.circle(self.screen, color, (center_x, self.animation_y), RADIUS)
        
        pygame.display.update()
    
    def draw_menu(self):
        self.screen.fill(BG_COLOR)
        
        # Draw title
        title = TITLE_FONT.render("4 IN A ROW", True, WHITE)
        self.screen.blit(title, (WIDTH/2 - title.get_width()/2, 50))
        
        # Draw subtitle
        subtitle = MAIN_FONT.render("Connect 4 of the same colored discs in a row to win.", True, WHITE)
        self.screen.blit(subtitle, (WIDTH/2 - subtitle.get_width()/2, 120))
        
        # Draw play vs bot button
        bot_btn = pygame.Rect(WIDTH/2 - 150, 220, 300, 70)
        self.draw_rounded_rect(self.screen, bot_btn, ORANGE, 15)
        
        # Draw bot icon
        bot_icon_rect = pygame.Rect(WIDTH/2 - 120, 235, 40, 40)
        pygame.draw.circle(self.screen, BLACK, bot_icon_rect.center, 20)
        pygame.draw.circle(self.screen, ORANGE, bot_icon_rect.center, 15)
        
        bot_text = BUTTON_FONT.render("PLAY VS. BOT", True, WHITE)
        self.screen.blit(bot_text, (WIDTH/2 - 50, 245))
        
        # Draw play vs friend button
        friend_btn = pygame.Rect(WIDTH/2 - 150, 320, 300, 70)
        self.draw_rounded_rect(self.screen, friend_btn, PURPLE, 15)
        
        # Draw friend icon
        friend_icon_rect = pygame.Rect(WIDTH/2 - 120, 335, 40, 40)
        pygame.draw.circle(self.screen, WHITE, friend_icon_rect.center, 15)
        pygame.draw.circle(self.screen, WHITE, (friend_icon_rect.centerx, friend_icon_rect.centery - 20), 10)
        
        friend_text = BUTTON_FONT.render("PLAY VS. FRIEND", True, WHITE)
        self.screen.blit(friend_text, (WIDTH/2 - 50, 345))
        
        pygame.display.update()
    
    def draw_difficulty_menu(self):
        self.screen.fill(BG_COLOR)
        
        # Draw the back button
        back_btn = pygame.Rect(20, 20, 50, 50)
        pygame.draw.circle(self.screen, (160, 82, 45), back_btn.center, 25)
        # Draw the arrow
        points = [(35, 45), (55, 45), (45, 35)]
        pygame.draw.polygon(self.screen, WHITE, points)
        
        # Draw title
        title = TITLE_FONT.render("SELECT DIFFICULTY", True, WHITE)
        self.screen.blit(title, (WIDTH/2 - title.get_width()/2, 50))
        
        # Draw difficulty levels with emojis
        difficulties = [
            ("EASY", BLUE, "😌"),
            ("MEDIUM", ORANGE, "😐"),
            ("HARD", RED, "😈")
        ]
        
        for i, (name, color, emoji) in enumerate(difficulties):
            btn = pygame.Rect(WIDTH/2 - 150, 150 + i*100, 300, 70)
            self.draw_rounded_rect(self.screen, btn, color, 15)
            
            # Draw emoji
            emoji_font = pygame.font.SysFont("sans-serif", 30)
            emoji_text = emoji_font.render(emoji, True, BLACK)
            self.screen.blit(emoji_text, (WIDTH/2 - 100, 165 + i*100))
            
            # Draw text
            diff_text = BUTTON_FONT.render(name, True, WHITE)
            self.screen.blit(diff_text, (WIDTH/2 - diff_text.get_width()/2, 175 + i*100))
        
        # Draw difficulty slider
        slider_rect = pygame.Rect(WIDTH/2 - 100, 430, 200, 10)
        pygame.draw.rect(self.screen, GREY, slider_rect, border_radius=5)
        
        # Draw slider position based on current difficulty
        pos_x = WIDTH/2 - 100 + (MEDIUM * 100)
        pygame.draw.circle(self.screen, WHITE, (pos_x, 435), 15)
        
        pygame.display.update()
    
    def draw_game_over(self):
        # Draw semi-transparent overlay
        overlay = pygame.Surface((WIDTH, HEIGHT), pygame.SRCALPHA)
        overlay.fill((0, 0, 0, 180))
        self.screen.blit(overlay, (0, 0))
        
        # Draw game over message
        if self.winner == 1:
            message = "RED WINS!"
            color = RED
        elif self.winner == 2:
            message = "BLUE WINS!"
            color = CYAN
        else:
            message = "DRAW!"
            color = WHITE
        
        # Draw message with shadow
        font = pygame.font.SysFont("sans-serif", 48, True)
        text_shadow = font.render(message, True, BLACK)
        text = font.render(message, True, color)
        self.screen.blit(text_shadow, (WIDTH/2 - text.get_width()/2 + 2, HEIGHT/2 - 50 + 2))
        self.screen.blit(text, (WIDTH/2 - text.get_width()/2, HEIGHT/2 - 50))
        
        # Draw play again button
        again_btn = pygame.Rect(WIDTH/2 - 100, HEIGHT/2 + 30, 200, 60)
        self.draw_rounded_rect(self.screen, again_btn, ORANGE, 15)
        play_again = BUTTON_FONT.render("PLAY AGAIN", True, WHITE)
        self.screen.blit(play_again, (WIDTH/2 - play_again.get_width()/2, HEIGHT/2 + 50))
        
        # Draw menu button
        menu_btn = pygame.Rect(WIDTH/2 - 100, HEIGHT/2 + 110, 200, 60)
        self.draw_rounded_rect(self.screen, menu_btn, PURPLE, 15)
        menu_text = BUTTON_FONT.render("MAIN MENU", True, WHITE)
        self.screen.blit(menu_text, (WIDTH/2 - menu_text.get_width()/2, HEIGHT/2 + 130))
        
        pygame.display.update()
    
    def reset_game(self):
        self.board = self.create_board()
        self.game_over = False
        self.turn = 0
        self.winner = None
        self.animation_active = False
    
    def animate_piece_drop(self, col, row, piece):
        """Animate a piece dropping into position"""
        self.animation_active = True
        self.animation_col = col
        self.animation_row = row
        self.animation_piece = piece
        self.animation_y = SQUARE_SIZE/2  # Start at the top
        
        target_y = HEIGHT - row*SQUARE_SIZE - SQUARE_SIZE/2
        
        while self.animation_y < target_y:
            self.animation_y += self.animation_speed
            
            # Cap at target
            if self.animation_y > target_y:
                self.animation_y = target_y
            
            self.draw_board()
            pygame.time.wait(16)  # ~60fps
        
        # Play sound effect
        if self.drop_sound:
            self.drop_sound.play()
            
        self.animation_active = False
    
    def minimax(self, board, depth, alpha, beta, maximizing_player):
        """Minimax algorithm with alpha-beta pruning for AI decision making"""
        valid_locations = [col for col in range(COLUMN_COUNT) if self.is_valid_location_for_board(board, col)]
        is_terminal = self.is_terminal_node(board)
        
        if depth == 0 or is_terminal:
            if is_terminal:
                if self.winning_move_for_board(board, 2):  # AI wins
                    return (None, 100000000000000)
                elif self.winning_move_for_board(board, 1):  # Human wins
                    return (None, -10000000000000)
                else:  # Game is over, no more valid moves
                    return (None, 0)
            else:  # Depth is zero
                return (None, self.score_position(board, 2))
        
        if maximizing_player:
            value = -math.inf
            column = random.choice(valid_locations)
            for col in valid_locations:
                row = self.get_next_open_row_for_board(board, col)
                b_copy = board.copy()
                self.drop_piece_for_board(b_copy, row, col, 2)
                new_score = self.minimax(b_copy, depth-1, alpha, beta, False)[1]
                if new_score > value:
                    value = new_score
                    column = col
                alpha = max(alpha, value)
                if alpha >= beta:
                    break
            return column, value
        
        else:  # Minimizing player
            value = math.inf
            column = random.choice(valid_locations)
            for col in valid_locations:
                row = self.get_next_open_row_for_board(board, col)
                b_copy = board.copy()
                self.drop_piece_for_board(b_copy, row, col, 1)
                new_score = self.minimax(b_copy, depth-1, alpha, beta, True)[1]
                if new_score < value:
                    value = new_score
                    column = col
                beta = min(beta, value)
                if alpha >= beta:
                    break
            return column, value
    
    def get_next_open_row_for_board(self, board, col):
        for r in range(ROW_COUNT):
            if board[r][col] == 0:
                return r
        return -1
    
    def drop_piece_for_board(self, board, row, col, piece):
        board[row][col] = piece
    
    def is_valid_location_for_board(self, board, col):
        return 0 <= col < COLUMN_COUNT and board[ROW_COUNT-1][col] == 0
    
    def is_terminal_node(self, board):
        """Check if the game is over or board is full"""
        return (self.winning_move_for_board(board, 1) or 
                self.winning_move_for_board(board, 2) or 
                len([col for col in range(COLUMN_COUNT) if self.is_valid_location_for_board(board, col)]) == 0)
    
    def winning_move_for_board(self, board, piece):
        """Check if the given piece has a winning move on the board"""
        # Check horizontal locations
        for c in range(COLUMN_COUNT-3):
            for r in range(ROW_COUNT):
                if (board[r][c] == piece and 
                    board[r][c+1] == piece and 
                    board[r][c+2] == piece and 
                    board[r][c+3] == piece):
                    return True
                
        # Check vertical locations
        for c in range(COLUMN_COUNT):
            for r in range(ROW_COUNT-3):
                if (board[r][c] == piece and 
                    board[r+1][c] == piece and 
                    board[r+2][c] == piece and 
                    board[r+3][c] == piece):
                    return True
                
        # Check positively sloped diagonals
        for c in range(COLUMN_COUNT-3):
            for r in range(ROW_COUNT-3):
                if (board[r][c] == piece and 
                    board[r+1][c+1] == piece and 
                    board[r+2][c+2] == piece and 
                    board[r+3][c+3] == piece):
                    return True
                
        # Check negatively sloped diagonals
        for c in range(COLUMN_COUNT-3):
            for r in range(3, ROW_COUNT):
                if (board[r][c] == piece and 
                    board[r-1][c+1] == piece and 
                    board[r-2][c+2] == piece and 
                    board[r-3][c+3] == piece):
                    return True
        
        return False
    
    def score_position(self, board, piece):
        """Evaluate board position for the given piece"""
        score = 0
        opponent = 1 if piece == 2 else 2
        
        # Score center column (preferable positions)
        center_array = [int(board[r][COLUMN_COUNT//2]) for r in range(ROW_COUNT)]
        center_count = center_array.count(piece)
        score += center_count * 3
        
        # Score horizontal
        for r in range(ROW_COUNT):
            row_array = [int(board[r][c]) for c in range(COLUMN_COUNT)]
            for c in range(COLUMN_COUNT-3):
                window = row_array[c:c+4]
                score += self.evaluate_window(window, piece, opponent)
        
        # Score vertical
        for c in range(COLUMN_COUNT):
            col_array = [int(board[r][c]) for r in range(ROW_COUNT)]
            for r in range(ROW_COUNT-3):
                window = col_array[r:r+4]
                score += self.evaluate_window(window, piece, opponent)
        
        # Score positive diagonal
        for r in range(ROW_COUNT-3):
            for c in range(COLUMN_COUNT-3):
                window = [board[r+i][c+i] for i in range(4)]
                score += self.evaluate_window(window, piece, opponent)
        
        # Score negative diagonal
        for r in range(3, ROW_COUNT):
            for c in range(COLUMN_COUNT-3):
                window = [board[r-i][c+i] for i in range(4)]
                score += self.evaluate_window(window, piece, opponent)
        
        return score
    
    def evaluate_window(self, window, piece, opponent):
        """Evaluate a window of 4 positions"""
        score = 0
        piece_count = window.count(piece)
        empty_count = window.count(0)
        
        if piece_count == 4:
            score += 100
        elif piece_count == 3 and empty_count == 1:
            score += 5
        elif piece_count == 2 and empty_count == 2:
            score += 2
        
        # Penalize opponent's potential wins
        opponent_count = window.count(opponent)
        if opponent_count == 3 and empty_count == 1:
            score -= 4
        
        return score
    
    def get_ai_move(self):
        """Get the AI's next move based on difficulty"""
        # Make a copy of the board for analysis
        board_copy = self.board.copy()
        
        # Check for immediate winning move regardless of difficulty
        for col in range(COLUMN_COUNT):
            if self.is_valid_location(col):
                row = self.get_next_open_row(col)
                temp_board = board_copy.copy()
                temp_board[row][col] = 2  # AI piece
                if self.winning_move_for_board(temp_board, 2):
                    return col
        
        # Different strategies based on difficulty
        if self.difficulty == EASY:
            # Block opponent's winning move or make random move
            for col in range(COLUMN_COUNT):
                if self.is_valid_location(col):
                    row = self.get_next_open_row(col)
                    temp_board = board_copy.copy()
                    temp_board[row][col] = 1  # Player piece
                    if self.winning_move_for_board(temp_board, 1):
                        return col
            
            # Random choice from valid columns
            valid_locations = [c for c in range(COLUMN_COUNT) if self.is_valid_location(c)]
            if valid_locations:
                return random.choice(valid_locations)
            return 0
        
        elif self.difficulty == MEDIUM:
            # Use minimax with limited depth
            col, _ = self.minimax(board_copy, 3, -math.inf, math.inf, True)
            return col
        
        else:  # HARD
            # Use deeper minimax search
            col, _ = self.minimax(board_copy, 5, -math.inf, math.inf, True)
            return col
    
    def run(self):
        """Main game loop"""
        self.reset_game()
        
        while True:
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    pygame.quit()
                    sys.exit()
                
                if event.type == pygame.MOUSEBUTTONDOWN:
                    mouse_x, mouse_y = pygame.mouse.get_pos()
                    
                    # Handle back button in all screens except menu
                    if self.game_state != MENU:
                        back_btn = pygame.Rect(20, 20, 50, 50)
                        if back_btn.collidepoint(mouse_x, mouse_y):
                            if self.game_state == DIFFICULTY:
                                self.game_state = MENU
                            elif self.game_state == GAME:
                                self.game_state = MENU if self.vs_ai else MENU
                            elif self.game_state == GAME_OVER:
                                self.game_state = MENU
                            continue
                    
                    if self.game_state == MENU:
                        # Bot button
                        if WIDTH/2 - 150 <= mouse_x <= WIDTH/2 + 150 and 220 <= mouse_y <= 290:
                            self.vs_ai = True
                            self.game_state = DIFFICULTY
                        
                        # Friend button
                        if WIDTH/2 - 150 <= mouse_x <= WIDTH/2 + 150 and 320 <= mouse_y <= 390:
                            self.vs_ai = False
                            self.game_state = GAME
                            self.reset_game()
                    
                    elif self.game_state == DIFFICULTY:
                        for i, y_pos in enumerate([150, 250, 350]):
                            if WIDTH/2 - 150 <= mouse_x <= WIDTH/2 + 150 and y_pos <= mouse_y <= y_pos + 70:
                                self.difficulty = i
                                self.game_state = GAME
                                self.reset_game()
                                break
                    
                    elif self.game_state == GAME and not self.animation_active:
                        # Player's turn
                        if self.turn == 0:
                            col = int(mouse_x // SQUARE_SIZE)
                            
                            if 0 <= col < COLUMN_COUNT and self.is_valid_location(col):
                                row = self.get_next_open_row(col)
                                
                                # Animate piece drop
                                self.animate_piece_drop(col, row, 1)
                                
                                # Update board after animation
                                self.drop_piece(row, col, 1)
                                
                                if self.winning_move(1):
                                    self.winner = 1
                                    self.game_over = True
                                    if self.win_sound:
                                        self.win_sound.play()
                                elif self.is_board_full():
                                    self.winner = None  # Draw
                                    self.game_over = True
                                else:
                                    self.turn = 1
                    
                    elif self.game_state == GAME_OVER:
                        # Play again button
                        if WIDTH/2 - 100 <= mouse_x <= WIDTH/2 + 100 and HEIGHT/2 + 30 <= mouse_y <= HEIGHT/2 + 90:
                            self.reset_game()
                            self.game_state = GAME
                        
                        # Main menu button
                        if WIDTH/2 - 100 <= mouse_x <= WIDTH/2 + 100 and HEIGHT/2 + 110 <= mouse_y <= HEIGHT/2 + 170:
                            self.game_state = MENU
            
            # AI's turn
            if self.game_state == GAME and self.turn == 1 and self.vs_ai and not self.game_over and not self.animation_active:
                # Brief delay to make it seem like AI is thinking
                pygame.time.wait(300)
                
                col = self.get_ai_move()
                
                if self.is_valid_location(col):
                    row = self.get_next_open_row(col)
                    
                    # Animate piece drop
                    self.animate_piece_drop(col, row, 2)
                    
                    # Update board after animation
                    self.drop_piece(row, col, 2)
                    
                    if self.winning_move(2):
                        self.winner = 2
                        self.game_over = True
                        if self.win_sound:
                            self.win_sound.play()
                    elif self.is_board_full():
                        self.winner = None  # Draw
                        self.game_over = True
                    else:
                        self.turn = 0
            
            # Draw the current screen
            if self.game_state == MENU:
                self.draw_menu()
            elif self.game_state == DIFFICULTY:
                self.draw_difficulty_menu()
            elif self.game_state == GAME:
                self.draw_board()
                if self.game_over:
                    self.game_state = GAME_OVER
            elif self.game_state == GAME_OVER:
                self.draw_game_over()
            
            # Cap the frame rate
            self.clock.tick(60)

if __name__ == "__main__":
    game = Connect4Game()
    game.run()