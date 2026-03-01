# ⚔️ Real-Time Caro (Gomoku)

A modern, mobile-responsive, real-time multiplayer implementation of the classic Caro (Gomoku / Five-in-a-Row) game built with **Next.js**, **React**, and **Firebase**.

## 🌟 Key Features

- **Real-Time Multiplayer**: Play instantly with friends online via shareable Room IDs using Firebase Realtime Database.
- **Play vs AI**: Test your skills offline against a smart AI opponent.
- **Global Leaderboard**: Compete with players around the world to reach the highest rank.
- **Built-in Rank System**: Earn points from your matches and climb through 8 prestigious tiers.
- **Internationalization (i18n)**: Fully supports both English and Vietnamese languages.
- **Themes**: Switch between Light, Dark, or System mode natively with a polished, glass-morphism aesthetic.
- **Mobile Responsive**: Immersive edge-to-edge board design optimized for phones, tablets, and desktops.
- **Customizable Profiles**: Edit your username and pick your avatar/emoji.

---

## 🎮 How to Play

### The Rules of Caro (Gomoku)

1. The game is played on a 15x15 grid.
2. Two players take turns placing their mark (**X** or **O**) on an empty intersection.
3. The winner is the first player to form an unbroken chain of **five stones horizontally, vertically, or diagonally**.
4. You must act quickly! You have **30 seconds** per turn. If the timer runs out, you forfeit the game.

### Starting a Game

- **Play with Friend**: Click "Play with Friend" to create a new room. Share the Room ID with your friend so they can join.
- **Play vs AI**: Click "Play vs AI" to practice against the computer immediately.

---

## 🏆 Rank System & Scoring

Your rank is determined by a cumulative point score. You gain points by winning and lose points by losing matches.

### How to get a higher rank

To climb the leaderboard as quickly as possible, your best strategy is to challenge and defeat players who have a **higher rank** than you, because you get a massive bonus for upsets!

The score calculation follows these rules:

**Winning a match:**

- **Win against same level:** +100 points
- **Win against HIGHER level (Upset):** +100 points + (Level Difference × 50 bonus points)
- **Win against LOWER level:** +100 points - (Level Difference × 20 points). _Note: You always get a minimum of +20 points for winning, no matter how much weaker the opponent is._

**Losing a match:**

- Losing always subtracts the exact amount of points the winner gained. Score cannot drop below 0.

**Playing against AI:**

- Win against AI: +50 points
- Lose against AI: -50 points

### The 8 Rank Tiers

|  Level   | Rank (English) | Rank (Vietnamese) | Required Score | Badge |
| :------: | :------------- | :---------------- | :------------- | :---: |
| **Lv.1** | Novice         | Tân thủ           | 0 pts          |  🌱   |
| **Lv.2** | Apprentice     | Kỳ thủ            | 500 pts        |  ⚔️   |
| **Lv.3** | Expert         | Cao thủ           | 1,200 pts      |  🔥   |
| **Lv.4** | Master         | Siêu cao thủ      | 1,800 pts      |  💥   |
| **Lv.5** | Grandmaster    | Kiện tướng        | 2,400 pts      |  🏅   |
| **Lv.6** | Elite          | Đại kiện tướng    | 3,000 pts      |  🎖️   |
| **Lv.7** | Legend         | Kỳ tiên           | 3,800 pts      |  👑   |
| **Lv.8** | Immortal       | Kỳ thánh          | 4,500 pts      |  🌟   |

---

## 💻 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 18)
- **Language**: TypeScript
- **Database / Backend**: Firebase Realtime Database
- **Styling**: Pure vanilla CSS with CSS Variables for theme management

## 🚀 Getting Started Locally

1. **Clone the repository.**
2. **Install dependencies:**
    ```bash
    npm install
    ```
3. **Configure Firebase:**
   Create a `.env.local` file in the root directory and add your Firebase credentials:
    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
    NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_db_url
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
    ```
4. **Run the development server:**
    ```bash
    npm run dev
    ```
5. **Open [http://localhost:3000](http://localhost:3000)** to view the application.
