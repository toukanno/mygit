# スマホアプリ集

React Native (Expo) で作られたスマホアプリのサンプル集です。

## アプリ一覧

### 📝 [todo-app](./todo-app) — Todoリスト
タスク管理アプリ。タスクの追加・完了・削除、フィルタリング機能付き。データはローカルに保存されます。

**機能**
- タスクの追加・完了・削除
- すべて / 未完了 / 完了済みのフィルタリング
- `AsyncStorage` によるデータ永続化

---

### 🌤️ [weather-app](./weather-app) — 天気アプリ
現在地や主要都市の天気を表示。Open-Meteo API (無料・APIキー不要) を使用。

**機能**
- 現在地の天気取得 (位置情報権限)
- 東京・大阪・札幌・福岡・那覇のプリセット
- 現在の気温・湿度・風速・降水量
- 7日間の天気予報
- 天気に合わせた背景色変化

---

### 🔢 [calculator-app](./calculator-app) — 電卓
iOSライクなデザインの電卓アプリ。

**機能**
- 四則演算 (÷ × − +)
- パーセント・符号反転
- 計算履歴 (直近10件)
- タップ時のバイブレーション
- 大きい数値の自動フォント調整

---

## セットアップ

各アプリのディレクトリで以下を実行:

```bash
cd <app-name>
npm install
npx expo start
```

## 必要な環境

- Node.js 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- iOS: Expo Go アプリ
- Android: Expo Go アプリ
