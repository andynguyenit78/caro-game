export type Language = 'en' | 'vi';

export const translations = {
    en: {
        // Home / Lobby
        title: 'Real-Time Caro',
        subtitle: 'Five in a row wins. Play with a friend online!',
        createRoom: 'Create New Room',
        or: 'OR',
        enterRoomId: 'Enter Room ID',
        join: 'Join',

        // Board
        loadingGame: 'Loading Game...',
        initPlayer: 'Initializing Player...',
        role: 'Role',
        spectator: 'Spectator',
        waitingForO: 'Waiting for Player O to join',
        youWon: 'You Won! 🎉',
        youLost: 'You Lost! 😞',
        yourTurn: 'Your Turn!',
        opponentTurn: "Opponent's Turn...",
        copyInvite: 'Copy Invite',
        inviteCopied: 'Invite link copied to clipboard!',
        room: 'Room',

        // Game Over Overlay
        victory: 'Victory!',
        defeat: 'Defeat',
        congratsWin: 'Congratulations! Player {player} wins!',
        betterLuck: 'Better luck next time!',
        playAgain: 'Play Again',

        // Settings
        language: 'Language',
        theme: 'Theme',
        light: 'Light',
        dark: 'Dark',
        system: 'System',

        // AI Mode
        playVsAI: 'Play vs AI',
        aiThinking: 'AI is thinking...',
        newGame: 'New Game',
        playFriend: 'Play with Friend',
    },
    vi: {
        // Home / Lobby
        title: 'Caro Trực Tuyến',
        subtitle: 'Năm liên tiếp để thắng. Chơi cùng bạn bè!',
        createRoom: 'Tạo Phòng Mới',
        or: 'HOẶC',
        enterRoomId: 'Nhập mã phòng',
        join: 'Vào',

        // Board
        loadingGame: 'Đang tải...',
        initPlayer: 'Đang khởi tạo...',
        role: 'Vai trò',
        spectator: 'Khán giả',
        waitingForO: 'Đang chờ người chơi O tham gia',
        youWon: 'Bạn Thắng! 🎉',
        youLost: 'Bạn Thua! 😞',
        yourTurn: 'Lượt của bạn!',
        opponentTurn: 'Lượt đối thủ...',
        copyInvite: 'Sao chép lời mời',
        inviteCopied: 'Đã sao chép liên kết mời!',
        room: 'Phòng',

        // Game Over Overlay
        victory: 'Chiến Thắng!',
        defeat: 'Thua Cuộc',
        congratsWin: 'Chúc mừng! Người chơi {player} thắng!',
        betterLuck: 'Chúc may mắn lần sau!',
        playAgain: 'Chơi Lại',

        // Settings
        language: 'Ngôn ngữ',
        theme: 'Giao diện',
        light: 'Sáng',
        dark: 'Tối',
        system: 'Hệ thống',

        // AI Mode
        playVsAI: 'Chơi với AI',
        aiThinking: 'AI đang suy nghĩ...',
        newGame: 'Ván Mới',
        playFriend: 'Chơi với bạn bè',
    },
} as const;

export type TranslationKey = keyof typeof translations.en;
