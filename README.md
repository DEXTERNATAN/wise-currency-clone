# 💱 Wise Currency Clone

Currency converter app inspired by [Wise](https://wise.com) — real-time mid-market rates, exchange history, favorites, and cost simulation.

Built with **Expo (React Native)** + **Firebase** backend.

---

## ✨ Features

### MVP
- [x] Real-time currency conversion
- [x] Currency list with search + flags
- [x] Quick swap (origin ↔ destination)
- [x] Local cache (AsyncStorage)

### Intermediate
- [ ] Favorite pairs (USD→BRL)
- [ ] Exchange rate history chart (1D/7D/1M/1Y)
- [ ] Background auto-refresh

### Advanced
- [ ] Provider cost comparison
- [ ] Exchange rate alerts
- [ ] Multi-currency simultaneous view
- [ ] Offline-first support

---

## 🏗️ Architecture

```
[Expo App]
    ↓
[Firebase Functions]   ← proxy + cache layer
    ↓
[Exchange Rate API]    ← external data source
    ↓
[Firestore Cache]      ← TTL 5~15 min
```

**Key decision:** app never calls external API directly — Firebase Functions acts as proxy, reducing cost and improving performance.

---

## 🗂️ Project Structure

```
src/
 ├── components/       # shared UI components
 ├── screens/
 │    ├── Home/        # main converter screen
 │    ├── Favorites/   # saved pairs
 │    └── History/     # rate history + chart
 ├── services/
 │    ├── api.ts       # exchange rate fetching
 │    └── firebase.ts  # Firestore + Functions
 ├── hooks/            # custom React hooks
 ├── store/            # Zustand state management
 └── utils/            # formatters, constants
```

---

## 🔥 Data Models (Firestore)

### `exchange_rates`
```json
{
  "base": "USD",
  "rates": { "BRL": 5.12, "EUR": 0.92 },
  "updatedAt": "timestamp"
}
```

### `favorites`
```json
{
  "userId": "abc",
  "pairs": ["USD-BRL", "EUR-BRL"]
}
```

### `history`
```json
{
  "pair": "USD-BRL",
  "values": [
    { "date": "2026-04-01", "value": 5.10 }
  ]
}
```

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Expo (React Native) + TypeScript |
| State | Zustand |
| Navigation | Expo Router |
| Charts | Victory Native |
| Backend | Firebase Functions (Node.js) |
| Database | Cloud Firestore |
| Auth | Firebase Auth (optional) |
| API | exchangerate-api.com |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Firebase project configured

### Install

```bash
git clone https://github.com/DEXTERNATAN/wise-currency-clone
cd wise-currency-clone
npm install
```

### Run

```bash
npm run ios      # iOS simulator
npm run android  # Android emulator
npm run web      # Web browser
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_EXCHANGE_API_KEY=  # only on Firebase Functions
```

---

## 🔐 Security

- API keys stored only in Firebase Functions (never in app bundle)
- Firestore rules: public read, no client writes on rates
- Firebase Auth for user-specific data (favorites, alerts)

---

## 🧪 Testing

```bash
npm test            # unit tests
npm run test:e2e    # E2E flows
```

---

## 📊 Roadmap

| Week | Goal |
|------|------|
| 1 | UI + basic local conversion |
| 2 | Firebase integration + cache |
| 3 | Favorites + history |
| 4 | Charts + polish + monetization |

---

## 💰 Monetization Options

1. **Ads** — AdMob banner (non-intrusive)
2. **Premium** — no ads + unlimited alerts
3. **Affiliate** — "Send money with Wise" CTA

---

## 🤝 Contributing

PRs welcome. Open an issue first for large changes.

---

## 📄 License

MIT
