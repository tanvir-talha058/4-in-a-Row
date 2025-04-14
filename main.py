import pygame
import sys
import numpy as np
import random
import math
from collections import deque

# Initialize pygame
pygame.init()

# Colors
BLACK = (0, 0, 0)
BLUE = (0, 123, 167)
RED = (255, 56, 56)
YELLOW = (255, 204, 0)
LIGHT_BLUE = (64, 177, 212)
GREY = (169, 169, 169)
DARK_GREY = (50, 50, 50)
ORANGE = (255, 165, 0)
PURPLE = (128, 0, 128)
WHITE = (255, 255, 255)
BG_COLOR = (255, 160, 122)  # Salmon-like color from the second image

# Game constants
ROW_COUNT = 6
COLUMN_COUNT = 7
SQUARE_SIZE = 80
RADIUS = int(SQUARE_SIZE / 2 - 5)
WIDTH = COLUMN_COUNT * SQUARE_SIZE
HEIGHT = (ROW_COUNT + 1) * SQUARE_SIZE
WINDOW_SIZE = (WIDTH, HEIGHT)
GAME_FONT = pygame.font.SysFont("monospace", 30)
BUTTON_FONT = pygame.font.SysFont("monospace", 20)

# Game states
MENU = 0
GAME = 1
DIFFICULTY = 2
GAME_OVER = 3
ALGORITHM_SELECT = 4

# Algorithms
BFS = 0
DFS = 1
MINIMAX = 2
ALPHA_BETA = 3
TIC_TAC_TOE = 4
WATER_JUG = 5

# Difficulty levels
EASY = 0
MEDIUM = 1
HARD = 2

class Connect4Game:
    def __init__(self):
        self.screen = pygame.display.set_mode(WINDOW_SIZE)
        pygame.display.set_caption("4 in a Row")
        self.game_state = MENU
        self.board = np.zeros((ROW_COUNT, COLUMN_COUNT))
        self.game_over = False
        self.turn = 0  # 0 for player 1, 1 for player 2 or AI
        self.difficulty = MEDIUM
        self.algorithm = MINIMAX
        self.vs_ai = True
        self.winner = None
        
    def create_board(self):
        self.board = np.zeros((ROW_COUNT, COLUMN_COUNT))
        return self.board
    
    def drop_piece(self, row, col, piece):
        self.board[row][col] = piece
        
    def is_valid_location(self, col):
        return self.board[ROW_COUNT-1][col] == 0
    
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
    
    def draw_board(self):
        self.screen.fill(BG_COLOR)
        
        # Draw the game board
        for c in range(COLUMN_COUNT):
            for r in range(ROW_COUNT):
                pygame.draw.rect(self.screen, DARK_GREY, (c*SQUARE_SIZE, (r+1)*SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE))
                pygame.draw.circle(self.screen, GREY, (int(c*SQUARE_SIZE + SQUARE_SIZE/2), int((r+1)*SQUARE_SIZE + SQUARE_SIZE/2)), RADIUS)
        
        # Draw the pieces
        for c in range(COLUMN_COUNT):
            for r in range(ROW_COUNT):
                if self.board[r][c] == 1:
                    pygame.draw.circle(self.screen, RED, (int(c*SQUARE_SIZE + SQUARE_SIZE/2), HEIGHT - int(r*SQUARE_SIZE + SQUARE_SIZE/2)), RADIUS)
                elif self.board[r][c] == 2:
                    pygame.draw.circle(self.screen, LIGHT_BLUE, (int(c*SQUARE_SIZE + SQUARE_SIZE/2), HEIGHT - int(r*SQUARE_SIZE + SQUARE_SIZE/2)), RADIUS)
        
        # Draw the top piece (preview)
        if not self.game_over and self.game_state == GAME:
            pos_x = pygame.mouse.get_pos()[0]
            if pos_x < WIDTH:
                col = pos_x // SQUARE_SIZE
                color = RED if self.turn == 0 else LIGHT_BLUE
                pygame.draw.circle(self.screen, color, (int(col*SQUARE_SIZE + SQUARE_SIZE/2), int(SQUARE_SIZE/2)), RADIUS)
        
        pygame.display.update()
    
    def draw_menu(self):
        self.screen.fill(BG_COLOR)
        
        # Draw title
        title_font = pygame.font.SysFont("monospace", 50, True)
        title = title_font.render("4 IN A ROW", True, WHITE)
        self.screen.blit(title, (WIDTH/2 - title.get_width()/2, 50))
        
        # Draw subtitle
        subtitle_font = pygame.font.SysFont("monospace", 20)
        subtitle = subtitle_font.render("Connect 4 of the same colored discs in a row to win.", True, WHITE)
        self.screen.blit(subtitle, (WIDTH/2 - subtitle.get_width()/2, 120))
        
        # Draw play vs bot button
        pygame.draw.rect(self.screen, ORANGE, (WIDTH/2 - 150, 250, 300, 60))
        bot_text = BUTTON_FONT.render("PLAY VS. BOT", True, WHITE)
        self.screen.blit(bot_text, (WIDTH/2 - bot_text.get_width()/2, 270))
        
        # Draw play vs friend button
        pygame.draw.rect(self.screen, PURPLE, (WIDTH/2 - 150, 350, 300, 60))
        friend_text = BUTTON_FONT.render("PLAY VS. FRIEND", True, WHITE)
        self.screen.blit(friend_text, (WIDTH/2 - friend_text.get_width()/2, 370))
        
        pygame.display.update()
    
    def draw_difficulty_menu(self):
        self.screen.fill(BG_COLOR)
        
        # Draw title
        title_font = pygame.font.SysFont("monospace", 40, True)
        title = title_font.render("SELECT DIFFICULTY", True, WHITE)
        self.screen.blit(title, (WIDTH/2 - title.get_width()/2, 50))
        
        # Draw difficulty levels
        pygame.draw.rect(self.screen, BLUE, (WIDTH/2 - 100, 150, 200, 60))
        easy_text = BUTTON_FONT.render("EASY", True, WHITE)
        self.screen.blit(easy_text, (WIDTH/2 - easy_text.get_width()/2, 170))
        
        pygame.draw.rect(self.screen, ORANGE, (WIDTH/2 - 100, 250, 200, 60))
        medium_text = BUTTON_FONT.render("MEDIUM", True, WHITE)
        self.screen.blit(medium_text, (WIDTH/2 - medium_text.get_width()/2, 270))
        
        pygame.draw.rect(self.screen, RED, (WIDTH/2 - 100, 350, 200, 60))
        hard_text = BUTTON_FONT.render("HARD", True, WHITE)
        self.screen.blit(hard_text, (WIDTH/2 - hard_text.get_width()/2, 370))
        
        pygame.display.update()
    
    def draw_algorithm_menu(self):
        self.screen.fill(BG_COLOR)
        
        # Draw title
        title_font = pygame.font.SysFont("monospace", 40, True)
        title = title_font.render("SELECT ALGORITHM", True, WHITE)
        self.screen.blit(title, (WIDTH/2 - title.get_width()/2, 30))
        
        # Draw algorithm options
        algorithms = [
            ("BFS", BFS), 
            ("DFS", DFS),
            ("MINIMAX", MINIMAX),
            ("ALPHA-BETA", ALPHA_BETA),
            ("TIC-TAC-TOE", TIC_TAC_TOE),
            ("WATER JUG", WATER_JUG)
        ]
        
        y_start = 120
        for i, (algo_name, algo_id) in enumerate(algorithms):
            pygame.draw.rect(self.screen, BLUE if i % 2 == 0 else ORANGE, (WIDTH/2 - 120, y_start + i*70, 240, 60))
            algo_text = BUTTON_FONT.render(algo_name, True, WHITE)
            self.screen.blit(algo_text, (WIDTH/2 - algo_text.get_width()/2, y_start + 20 + i*70))
        
        pygame.display.update()
    
    def draw_game_over(self):
        # Draw semi-transparent overlay
        overlay = pygame.Surface((WIDTH, HEIGHT), pygame.SRCALPHA)
        overlay.fill((0, 0, 0, 128))
        self.screen.blit(overlay, (0, 0))
        
        # Draw game over message
        font = pygame.font.SysFont("monospace", 48, True)
        if self.winner == 1:
            message = "RED WINS!"
            color = RED
        elif self.winner == 2:
            message = "BLUE WINS!"
            color = LIGHT_BLUE
        else:
            message = "DRAW!"
            color = WHITE
        
        text = font.render(message, True, color)
        self.screen.blit(text, (WIDTH/2 - text.get_width()/2, HEIGHT/2 - 50))
        
        # Draw play again button
        pygame.draw.rect(self.screen, ORANGE, (WIDTH/2 - 100, HEIGHT/2 + 50, 200, 60))
        play_again = BUTTON_FONT.render("PLAY AGAIN", True, WHITE)
        self.screen.blit(play_again, (WIDTH/2 - play_again.get_width()/2, HEIGHT/2 + 70))
        
        pygame.display.update()
    
    def reset_game(self):
        self.board = self.create_board()
        self.game_over = False
        self.turn = 0
        self.winner = None
    
    # AI Algorithms
    
    def ai_move_random(self):
        """Simple random move selection for easy difficulty"""
        valid_cols = [col for col in range(COLUMN_COUNT) if self.is_valid_location(col)]
        if valid_cols:
            return random.choice(valid_cols)
        return 0
    
    def ai_move_bfs(self):
        """BFS algorithm to find the best move"""
        valid_cols = [col for col in range(COLUMN_COUNT) if self.is_valid_location(col)]
        if not valid_cols:
            return 0
        
        # First check if any move leads to immediate win
        for col in valid_cols:
            row = self.get_next_open_row(col)
            temp_board = self.board.copy()
            temp_board[row][col] = 2  # AI's piece
            
            if self.winning_move_with_board(temp_board, 2):
                return col
        
        # Then check if opponent has a winning move and block it
        for col in valid_cols:
            row = self.get_next_open_row(col)
            temp_board = self.board.copy()
            temp_board[row][col] = 1  # Player's piece
            
            if self.winning_move_with_board(temp_board, 1):
                return col
        
        # BFS to find a move that leads to more possibilities
        best_col = valid_cols[0]
        max_options = -1
        
        for col in valid_cols:
            row = self.get_next_open_row(col)
            temp_board = self.board.copy()
            temp_board[row][col] = 2  # AI's piece
            
            # Count accessible positions after this move
            accessible = self.count_accessible_positions_bfs(temp_board)
            
            if accessible > max_options:
                max_options = accessible
                best_col = col
        
        return best_col
    
    def count_accessible_positions_bfs(self, board):
        """Count accessible positions using BFS"""
        visited = set()
        queue = deque()
        count = 0
        
        # Start from all valid positions
        for col in range(COLUMN_COUNT):
            row = self.get_next_open_row_with_board(board, col)
            if row != -1:
                queue.append((row, col))
                visited.add((row, col))
        
        # BFS
        while queue:
            row, col = queue.popleft()
            count += 1
            
            # Check all neighbors (up, down, left, right, and diagonals)
            for dr, dc in [(0, 1), (1, 0), (0, -1), (-1, 0), (1, 1), (-1, -1), (1, -1), (-1, 1)]:
                nr, nc = row + dr, col + dc
                
                if (0 <= nr < ROW_COUNT and 0 <= nc < COLUMN_COUNT 
                    and board[nr][nc] == 0 and (nr, nc) not in visited):
                    queue.append((nr, nc))
                    visited.add((nr, nc))
        
        return count
    
    def ai_move_dfs(self):
        """DFS algorithm to find the best move"""
        valid_cols = [col for col in range(COLUMN_COUNT) if self.is_valid_location(col)]
        if not valid_cols:
            return 0
        
        # First check if any move leads to immediate win
        for col in valid_cols:
            row = self.get_next_open_row(col)
            temp_board = self.board.copy()
            temp_board[row][col] = 2  # AI's piece
            
            if self.winning_move_with_board(temp_board, 2):
                return col
        
        # Then check if opponent has a winning move and block it
        for col in valid_cols:
            row = self.get_next_open_row(col)
            temp_board = self.board.copy()
            temp_board[row][col] = 1  # Player's piece
            
            if self.winning_move_with_board(temp_board, 1):
                return col
        
        # DFS to find a move that leads to more strategic positions
        best_col = valid_cols[0]
        max_score = -float('inf')
        
        for col in valid_cols:
            row = self.get_next_open_row(col)
            temp_board = self.board.copy()
            temp_board[row][col] = 2  # AI's piece
            
            # Count strategic score after this move
            score = self.evaluate_position_dfs(temp_board, 2, 0, 3)  # Depth of 3 for medium difficulty
            
            if score > max_score:
                max_score = score
                best_col = col
        
        return best_col
    
    def evaluate_position_dfs(self, board, piece, current_depth, max_depth):
        """Evaluate a position using DFS with a limited depth"""
        # Base case: reached maximum depth or game over
        if current_depth == max_depth:
            return self.score_position(board, piece)
        
        # If win, give high score
        if self.winning_move_with_board(board, piece):
            return 1000
        
        # If board is full, it's a draw
        if all(board[ROW_COUNT-1][col] != 0 for col in range(COLUMN_COUNT)):
            return 0
        
        opponent = 1 if piece == 2 else 2
        
        # If it's AI's turn (maximizing)
        if current_depth % 2 == 0:
            max_score = -float('inf')
            for col in range(COLUMN_COUNT):
                row = self.get_next_open_row_with_board(board, col)
                if row != -1:
                    temp_board = board.copy()
                    temp_board[row][col] = piece
                    score = self.evaluate_position_dfs(temp_board, piece, current_depth + 1, max_depth)
                    max_score = max(max_score, score)
            return max_score
        
        # If it's opponent's turn (minimizing)
        else:
            min_score = float('inf')
            for col in range(COLUMN_COUNT):
                row = self.get_next_open_row_with_board(board, col)
                if row != -1:
                    temp_board = board.copy()
                    temp_board[row][col] = opponent
                    score = self.evaluate_position_dfs(temp_board, piece, current_depth + 1, max_depth)
                    min_score = min(min_score, score)
            return min_score
    
    def score_position(self, board, piece):
        """Score a position for the given piece"""
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
        """Evaluate a window of 4 slots"""
        score = 0
        piece_count = window.count(piece)
        empty_count = window.count(0)
        opponent_count = window.count(opponent)
        
        if piece_count == 4:
            score += 100
        elif piece_count == 3 and empty_count == 1:
            score += 5
        elif piece_count == 2 and empty_count == 2:
            score += 2
        
        if opponent_count == 3 and empty_count == 1:
            score -= 4  # Block opponent's potential win
        
        return score
    
    def ai_move_minimax(self, depth=4):
        """Minimax algorithm to find the best move"""
        valid_cols = [col for col in range(COLUMN_COUNT) if self.is_valid_location(col)]
        if not valid_cols:
            return 0
        
        best_score = -float('inf')
        best_col = random.choice(valid_cols)
        
        for col in valid_cols:
            row = self.get_next_open_row(col)
            temp_board = self.board.copy()
            temp_board[row][col] = 2  # AI's piece
            
            # Calculate score for this move
            score = self.minimax(temp_board, depth-1, False)
            
            if score > best_score:
                best_score = score
                best_col = col
        
        return best_col
    
    def minimax(self, board, depth, is_maximizing):
        """Minimax algorithm for evaluating positions"""
        # Check if game is over or depth is reached
        if self.winning_move_with_board(board, 2):  # AI wins
            return 1000
        elif self.winning_move_with_board(board, 1):  # Player wins
            return -1000
        elif depth == 0 or self.is_board_full_with_board(board):
            return self.score_position(board, 2)  # Evaluate position for AI
        
        valid_cols = [col for col in range(COLUMN_COUNT) if self.get_next_open_row_with_board(board, col) != -1]
        
        if is_maximizing:  # AI's turn
            value = -float('inf')
            for col in valid_cols:
                row = self.get_next_open_row_with_board(board, col)
                temp_board = board.copy()
                temp_board[row][col] = 2  # AI's piece
                value = max(value, self.minimax(temp_board, depth-1, False))
            return value
        else:  # Player's turn
            value = float('inf')
            for col in valid_cols:
                row = self.get_next_open_row_with_board(board, col)
                temp_board = board.copy()
                temp_board[row][col] = 1  # Player's piece
                value = min(value, self.minimax(temp_board, depth-1, True))
            return value
    
    def ai_move_alpha_beta(self, depth=5):
        """Alpha-Beta pruning algorithm to find the best move"""
        valid_cols = [col for col in range(COLUMN_COUNT) if self.is_valid_location(col)]
        if not valid_cols:
            return 0
        
        best_score = -float('inf')
        best_col = random.choice(valid_cols)
        alpha = -float('inf')
        beta = float('inf')
        
        for col in valid_cols:
            row = self.get_next_open_row(col)
            temp_board = self.board.copy()
            temp_board[row][col] = 2  # AI's piece
            
            # Calculate score for this move with alpha-beta pruning
            score = self.alpha_beta(temp_board, depth-1, alpha, beta, False)
            
            if score > best_score:
                best_score = score
                best_col = col
            
            alpha = max(alpha, best_score)
        
        return best_col
    
    def alpha_beta(self, board, depth, alpha, beta, is_maximizing):
        """Alpha-Beta pruning algorithm for evaluating positions"""
        # Check if game is over or depth is reached
        if self.winning_move_with_board(board, 2):  # AI wins
            return 1000
        elif self.winning_move_with_board(board, 1):  # Player wins
            return -1000
        elif depth == 0 or self.is_board_full_with_board(board):
            return self.score_position(board, 2)  # Evaluate position for AI
        
        valid_cols = [col for col in range(COLUMN_COUNT) if self.get_next_open_row_with_board(board, col) != -1]
        
        if is_maximizing:  # AI's turn
            value = -float('inf')
            for col in valid_cols:
                row = self.get_next_open_row_with_board(board, col)
                temp_board = board.copy()
                temp_board[row][col] = 2  # AI's piece
                value = max(value, self.alpha_beta(temp_board, depth-1, alpha, beta, False))
                alpha = max(alpha, value)
                if alpha >= beta:
                    break  # Beta cutoff
            return value
        else:  # Player's turn
            value = float('inf')
            for col in valid_cols:
                row = self.get_next_open_row_with_board(board, col)
                temp_board = board.copy()
                temp_board[row][col] = 1  # Player's piece
                value = min(value, self.alpha_beta(temp_board, depth-1, alpha, beta, True))
                beta = min(beta, value)
                if alpha >= beta:
                    break  # Alpha cutoff
            return value
    
    def ai_move_tic_tac_toe(self):
        """Adaptation of Tic-Tac-Toe strategy for Connect 4"""
        valid_cols = [col for col in range(COLUMN_COUNT) if self.is_valid_location(col)]
        if not valid_cols:
            return 0
        
        # First check if any move leads to immediate win
        for col in valid_cols:
            row = self.get_next_open_row(col)
            temp_board = self.board.copy()
            temp_board[row][col] = 2  # AI's piece
            
            if self.winning_move_with_board(temp_board, 2):
                return col
        
        # Then check if opponent has a winning move and block it
        for col in valid_cols:
            row = self.get_next_open_row(col)
            temp_board = self.board.copy()
            temp_board[row][col] = 1  # Player's piece
            
            if self.winning_move_with_board(temp_board, 1):
                return col
        
        # Try to create opportunities by looking for 2 in a row
        best_col = None
        best_score = -1
        
        for col in valid_cols:
            row = self.get_next_open_row(col)
            temp_board = self.board.copy()
            temp_board[row][col] = 2  # AI's piece
            
            # Count how many 2 in a row this move creates
            score = self.count_two_in_a_row(temp_board, 2)
            
            if score > best_score:
                best_score = score
                best_col = col
        
        if best_col is not None:
            return best_col
        
        # If center column is available, prefer it
        if self.is_valid_location(COLUMN_COUNT // 2):
            return COLUMN_COUNT // 2
        
        # Otherwise, choose random valid column
        return random.choice(valid_cols)
    
    def count_two_in_a_row(self, board, piece):
        """Count the number of 2-in-a-row configurations"""
        count = 0
        
        # Check horizontal
        for r in range(ROW_COUNT):
            for c in range(COLUMN_COUNT - 1):
                if board[r][c] == piece and board[r][c+1] == piece:
                    count += 1
        
        # Check vertical
        for c in range(COLUMN_COUNT):
            for r in range(ROW_COUNT - 1):
                if board[r][c] == piece and board[r+1][c] == piece:
                    count += 1
        
        # Check diagonal
        for r in range(ROW_COUNT - 1):
            for c in range(COLUMN_COUNT - 1):
                if board[r][c] == piece and board[r+1][c+1] == piece:
                    count += 1
        
        for r in range(1, ROW_COUNT):
            for c in range(COLUMN_COUNT - 1):
                if board[r][c] == piece and board[r-1][c+1] == piece:
                    count += 1
        
        return count
    
    def ai_move_water_jug(self):
        """Adaptation of Water Jug problem solving approach for Connect 4"""
        valid_cols = [col for col in range(COLUMN_COUNT) if self.is_valid_location(col)]
        if not valid_cols:
            return 0
        
        # For Water Jug adaptation, we'll use a state-space search approach
        # where we prioritize moves that lead to desired states
        
        # First check for immediate wins or blocks
        for col in valid_cols:
            row = self.get_next_open_row(col)
            temp_board = self.board.copy()
            temp_board[row][col] = 2  # AI's piece
            
            if self.winning_move_with_board(temp_board, 2):
                return col
        
        for col in valid_cols:
            row = self.get_next_open_row(col)
            temp_board = self.board.copy()
            temp_board[row][col] = 1  # Player's piece
            
            if self.winning_move_with_board(temp_board, 1):
                return col
        
        # Evaluate the "state" after each possible move
        # Goal:
        # Evaluate the "state" after each possible move
        # Goal: Find a move that maximizes our future winning potential
        best_col = None
        best_potential = -float('inf')
        
        for col in valid_cols:
            row = self.get_next_open_row(col)
            temp_board = self.board.copy()
            temp_board[row][col] = 2  # AI's piece
            
            # Calculate potential for this move
            potential = self.calculate_potential(temp_board)
            
            if potential > best_potential:
                best_potential = potential
                best_col = col
        
        return best_col
    
    def calculate_potential(self, board):
        """Calculate potential of a board position for water jug approach"""
        # This is inspired by water jug problem's state evaluation
        # We're trying to maximize our "good" states and minimize "bad" states
        
        ai_score = 0
        player_score = 0
        
        # Check horizontal potentials
        for r in range(ROW_COUNT):
            for c in range(COLUMN_COUNT - 3):
                window = [board[r][c+i] for i in range(4)]
                ai_score += self.evaluate_window(window, 2, 1)
                player_score += self.evaluate_window(window, 1, 2)
        
        # Check vertical potentials
        for c in range(COLUMN_COUNT):
            for r in range(ROW_COUNT - 3):
                window = [board[r+i][c] for i in range(4)]
                ai_score += self.evaluate_window(window, 2, 1)
                player_score += self.evaluate_window(window, 1, 2)
        
        # Check positively sloped diagonal potentials
        for r in range(ROW_COUNT - 3):
            for c in range(COLUMN_COUNT - 3):
                window = [board[r+i][c+i] for i in range(4)]
                ai_score += self.evaluate_window(window, 2, 1)
                player_score += self.evaluate_window(window, 1, 2)
        
        # Check negatively sloped diagonal potentials
        for r in range(3, ROW_COUNT):
            for c in range(COLUMN_COUNT - 3):
                window = [board[r-i][c+i] for i in range(4)]
                ai_score += self.evaluate_window(window, 2, 1)
                player_score += self.evaluate_window(window, 1, 2)
        
        # Prioritize center columns
        center_array = [int(board[r][COLUMN_COUNT//2]) for r in range(ROW_COUNT)]
        center_count = center_array.count(2)
        ai_score += center_count * 3
        
        # Return AI potential minus player potential with a small randomness
        return ai_score - player_score * 1.5 + random.random()
    
    def winning_move_with_board(self, board, piece):
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
    
    def get_next_open_row_with_board(self, board, col):
        """Get the next open row in the given column of the board"""
        for r in range(ROW_COUNT):
            if board[r][col] == 0:
                return r
        return -1
    
    def is_board_full_with_board(self, board):
        """Check if the board is full"""
        return not any(board[ROW_COUNT-1][col] == 0 for col in range(COLUMN_COUNT))
    
    def get_ai_move(self):
        """Select the appropriate AI algorithm based on settings"""
        # Adjust difficulty by using different algorithms or depths
        if self.algorithm == BFS:
            return self.ai_move_bfs()
        elif self.algorithm == DFS:
            return self.ai_move_dfs()
        elif self.algorithm == MINIMAX:
            depth = 2 if self.difficulty == EASY else 4 if self.difficulty == MEDIUM else 5
            return self.ai_move_minimax(depth)
        elif self.algorithm == ALPHA_BETA:
            depth = 3 if self.difficulty == EASY else 5 if self.difficulty == MEDIUM else 7
            return self.ai_move_alpha_beta(depth)
        elif self.algorithm == TIC_TAC_TOE:
            return self.ai_move_tic_tac_toe()
        elif self.algorithm == WATER_JUG:
            return self.ai_move_water_jug()
        else:
            # Default to random for easy difficulty
            return self.ai_move_random()
    
    def run(self):
        """Main game loop"""
        self.reset_game()
        
        while True:
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    pygame.quit()
                    sys.exit()
                
                if self.game_state == MENU:
                    self.draw_menu()
                    if event.type == pygame.MOUSEBUTTONDOWN:
                        mouse_x, mouse_y = pygame.mouse.get_pos()
                        
                        # Check if bot button was clicked
                        if WIDTH/2 - 150 <= mouse_x <= WIDTH/2 + 150 and 250 <= mouse_y <= 310:
                            self.vs_ai = True
                            self.game_state = ALGORITHM_SELECT
                        
                        # Check if friend button was clicked
                        if WIDTH/2 - 150 <= mouse_x <= WIDTH/2 + 150 and 350 <= mouse_y <= 410:
                            self.vs_ai = False
                            self.game_state = GAME
                            self.reset_game()
                
                elif self.game_state == ALGORITHM_SELECT:
                    self.draw_algorithm_menu()
                    if event.type == pygame.MOUSEBUTTONDOWN:
                        mouse_x, mouse_y = pygame.mouse.get_pos()
                        
                        y_start = 120
                        for i, algo_id in enumerate([BFS, DFS, MINIMAX, ALPHA_BETA, TIC_TAC_TOE, WATER_JUG]):
                            if WIDTH/2 - 120 <= mouse_x <= WIDTH/2 + 120 and y_start + i*70 <= mouse_y <= y_start + i*70 + 60:
                                self.algorithm = algo_id
                                self.game_state = DIFFICULTY
                
                elif self.game_state == DIFFICULTY:
                    self.draw_difficulty_menu()
                    if event.type == pygame.MOUSEBUTTONDOWN:
                        mouse_x, mouse_y = pygame.mouse.get_pos()
                        
                        # Check if easy button was clicked
                        if WIDTH/2 - 100 <= mouse_x <= WIDTH/2 + 100 and 150 <= mouse_y <= 210:
                            self.difficulty = EASY
                            self.game_state = GAME
                            self.reset_game()
                        
                        # Check if medium button was clicked
                        if WIDTH/2 - 100 <= mouse_x <= WIDTH/2 + 100 and 250 <= mouse_y <= 310:
                            self.difficulty = MEDIUM
                            self.game_state = GAME
                            self.reset_game()
                        
                        # Check if hard button was clicked
                        if WIDTH/2 - 100 <= mouse_x <= WIDTH/2 + 100 and 350 <= mouse_y <= 410:
                            self.difficulty = HARD
                            self.game_state = GAME
                            self.reset_game()
                
                elif self.game_state == GAME:
                    self.draw_board()
                    
                    if self.game_over:
                        self.game_state = GAME_OVER
                        continue
                    
                    if event.type == pygame.MOUSEMOTION:
                        # Update preview piece position
                        self.draw_board()
                    
                    if event.type == pygame.MOUSEBUTTONDOWN:
                        # Player's turn
                        if self.turn == 0:
                            mouse_x = event.pos[0]
                            col = int(mouse_x // SQUARE_SIZE)
                            
                            if 0 <= col < COLUMN_COUNT and self.is_valid_location(col):
                                row = self.get_next_open_row(col)
                                self.drop_piece(row, col, 1)
                                
                                if self.winning_move(1):
                                    self.winner = 1
                                    self.game_over = True
                                elif self.is_board_full():
                                    self.winner = None  # Draw
                                    self.game_over = True
                                else:
                                    self.turn = 1
                                    
                                self.draw_board()
                
                elif self.game_state == GAME_OVER:
                    self.draw_board()
                    self.draw_game_over()
                    
                    if event.type == pygame.MOUSEBUTTONDOWN:
                        mouse_x, mouse_y = pygame.mouse.get_pos()
                        
                        # Check if play again button was clicked
                        if WIDTH/2 - 100 <= mouse_x <= WIDTH/2 + 100 and HEIGHT/2 + 50 <= mouse_y <= HEIGHT/2 + 110:
                            self.game_state = MENU
            
            # AI's turn
            if self.game_state == GAME and self.turn == 1 and self.vs_ai and not self.game_over:
                # Add a slight delay to make it seem like AI is thinking
                pygame.time.wait(500)
                
                col = self.get_ai_move()
                
                if self.is_valid_location(col):
                    row = self.get_next_open_row(col)
                    self.drop_piece(row, col, 2)
                    
                    if self.winning_move(2):
                        self.winner = 2
                        self.game_over = True
                    elif self.is_board_full():
                        self.winner = None  # Draw
                        self.game_over = True
                    else:
                        self.turn = 0
                        
                    self.draw_board()
            
            pygame.time.wait(50)  # Small delay to reduce CPU usage

if __name__ == "__main__":
    game = Connect4Game()
    game.run()