# 💱 Wise Currency Clone

Conversor de moedas inspirado no [Wise](https://wise.com) — taxas mid-market em tempo real, histórico de câmbio, favoritos e simulação de custos.

Construído com **Expo (React Native)** + backend **Firebase**.

---

## ✨ Funcionalidades

### MVP
- [x] Conversão de moedas em tempo real
- [x] Lista de moedas com busca + bandeiras
- [x] Inversão rápida (origem ↔ destino)
- [x] Cache local (AsyncStorage)

### Intermediário
- [ ] Pares favoritos (USD→BRL)
- [ ] Gráfico de histórico de câmbio (1D/7D/1M/1Y)
- [ ] Atualização automática em background

### Avançado
- [ ] Comparação de custos entre provedores
- [ ] Alertas de câmbio
- [ ] Visualização multi-moeda simultânea
- [ ] Suporte offline completo

---

## 🏗️ Arquitetura

```
[App Expo]
    ↓
[Firebase Functions]   ← camada de proxy + cache
    ↓
[API de Câmbio]        ← fonte de dados externa
    ↓
[Cache Firestore]      ← TTL 5~15 min
```

**Decisão chave:** o app nunca chama a API externa diretamente — Firebase Functions age como proxy, reduzindo custo e melhorando performance.

---

## 🗂️ Estrutura do Projeto

```
src/
 ├── components/       # componentes de UI reutilizáveis
 ├── screens/
 │    ├── Home/        # tela principal do conversor
 │    ├── Favorites/   # pares salvos
 │    └── History/     # histórico + gráfico
 ├── services/
 │    ├── api.ts       # busca de cotações
 │    └── firebase.ts  # Firestore + Functions
 ├── hooks/            # hooks React customizados
 ├── store/            # gerenciamento de estado com Zustand
 └── utils/            # formatadores, constantes
```

---

## 🔥 Modelos de Dados (Firestore)

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

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Expo (React Native) + TypeScript |
| Estado | Zustand |
| Navegação | Expo Router |
| Gráficos | Victory Native |
| Backend | Firebase Functions (Node.js) |
| Banco de Dados | Cloud Firestore |
| Autenticação | Firebase Auth (opcional) |
| API | exchangerate-api.com |

---

## 🚀 Como Começar

### Pré-requisitos
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Projeto Firebase configurado

### Instalação

```bash
git clone https://github.com/DEXTERNATAN/wise-currency-clone
cd wise-currency-clone
npm install
```

### Executar

```bash
npm run ios      # Simulador iOS
npm run android  # Emulador Android
npm run web      # Navegador web
```

### Variáveis de Ambiente

Copie `.env.example` para `.env.local` e preencha:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_EXCHANGE_API_KEY=  # somente nas Firebase Functions
```

---

## 🔐 Segurança

- Chaves de API armazenadas apenas nas Firebase Functions (nunca no bundle do app)
- Regras Firestore: leitura pública, sem escrita do cliente nas cotações
- Firebase Auth para dados do usuário (favoritos, alertas)

---

## 🧪 Testes

```bash
npm test            # testes unitários
npm run test:e2e    # fluxos E2E
```

---

## 📊 Roadmap

| Semana | Objetivo |
|--------|----------|
| 1 | UI + conversão local básica |
| 2 | Integração Firebase + cache |
| 3 | Favoritos + histórico |
| 4 | Gráficos + polish + monetização |

---

## 💰 Opções de Monetização

1. **Anúncios** — banner AdMob (discreto)
2. **Premium** — sem anúncios + alertas ilimitados
3. **Afiliado** — CTA "Enviar dinheiro pelo Wise"

---

## 🤝 Contribuindo

PRs são bem-vindos. Abra uma issue primeiro para mudanças grandes.

---

## 📄 Licença

MIT
