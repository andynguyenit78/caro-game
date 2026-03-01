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

        // Player
        editName: 'Edit Name',
        enterName: 'Your name',
        you: 'You',
        opponent: 'Opponent',

        // Stats
        wins: 'Wins',
        losses: 'Losses',
        winRate: 'Win Rate',

        // Onboarding & Leaderboard
        welcomeTitle: 'Welcome to Caro!',
        welcomeSubtitle: 'Enter your name to get started',
        letsPlay: "Let's Play! \uD83C\uDFAE",
        leaderboard: 'Top Players',

        // Profile
        profile: 'Profile',
        backHome: 'Back',
        chooseAvatar: 'Choose Avatar',
        displayName: 'Display Name',
        gamesPlayed: 'Games',
        saved: 'Saved!',
        saveProfile: 'Save Profile',

        // Settings
        sound: 'Sound',
        soundOn: 'On',
        soundOff: 'Off',
        timerDuration: 'Move Timer',
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

        // Player
        editName: 'Đổi tên',
        enterName: 'Tên của bạn',
        you: 'Bạn',
        opponent: 'Đối thủ',

        // Stats
        wins: 'Thắng',
        losses: 'Thua',
        winRate: 'Tỷ lệ',

        // Onboarding & Leaderboard
        welcomeTitle: 'Chào mừng đến Caro!',
        welcomeSubtitle: 'Nhập tên của bạn để bắt đầu',
        letsPlay: 'Chơi thôi! 🎮',
        leaderboard: 'Bảng Xếp Hạng',

        // Profile
        profile: 'Hồ sơ',
        backHome: 'Quay lại',
        chooseAvatar: 'Chọn Avatar',
        displayName: 'Tên hiển thị',
        gamesPlayed: 'Trận',
        saved: 'Đã lưu!',
        saveProfile: 'Lưu hồ sơ',

        // Settings
        sound: 'Âm thanh',
        soundOn: 'Bật',
        soundOff: 'Tắt',
        timerDuration: 'Bộ đếm thời gian',
    },
} as const;

export type TranslationKey = keyof typeof translations.en;
