# こころノート v3 — 紙のジャーナリングの伴走者

紙とペンで書くジャーナリングを、続けやすくするためのPWAです。
書いた内容そのものはアプリには保存されません(紙の上だけ)。
記録するのは「日付・手法・所要時間・気分・任意の見出しメモ」のみです。

Apple Human Interface Guidelinesを基に、iOSライクな構造(large title→compactナビ、grouped insetリスト、bottom sheet、blur tabbar、SF Pro系タイポグラフィ、ダークモード、prefers-reduced-motion対応)で設計しています。

## ファイル構成

```
outputs/
├── kokoro-note.html       # 構造(マークアップ + ARIA)
├── styles.css             # デザイントークン + コンポーネント + ダークモード
├── app.js                 # 状態管理 + ルーティング + 同期 + SW登録
├── manifest.json          # PWAマニフェスト(ショートカット2種)
├── sw.js                  # Service Worker(オフラインキャッシュ)
├── icon-192.svg
├── icon-512.svg
├── icon-maskable.svg      # Android可変マスク用
├── apple-touch-icon.svg   # iOSホーム画面用
├── README.md
└── test-kokoro.mjs        # 200+ 件のテスト(node test-kokoro.mjs)
```

| 役割 | ファイル |
|---|---|
| 構造(マークアップ) | `kokoro-note.html` |
| スタイル(全UI) | `styles.css` |
| ロジック | `app.js` |
| PWA | `manifest.json` + `sw.js` + icons |
| 配信案内 | `README.md` |
| 自動テスト | `test-kokoro.mjs` |

## PWAとして使うには HTTPS が必要

iOS / Android / デスクトップで「ホーム画面に追加」→アプリのように使うには、
**HTTPSで配信されている**必要があります(`file://` では Service Worker が登録できません)。

下記いずれかの方法で配信してください。

### 方法1: Netlify Drop(最短・コマンド不要・無料)

1. <https://app.netlify.com/drop> を開く
2. このフォルダごとブラウザにドラッグ&ドロップ
3. `https://◯◯◯.netlify.app/kokoro-note.html` のURLが発行される
4. スマホでそのURLを開き、Safari/Chromeから「ホーム画面に追加」

### 方法2: GitHub Pages(無料・URL固定)

```bash
git init && git add . && git commit -m "init"
git branch -M main
git remote add origin https://github.com/<USER>/<REPO>.git
git push -u origin main
# Settings → Pages → Deploy from branch / main / root
```

数分後 `https://<USER>.github.io/<REPO>/kokoro-note.html` で公開されます。

### 方法3: ローカル試用(同じネットワーク内のスマホから)

```bash
python3 -m http.server 8080
# 別端末から http://<PCのIP>:8080/kokoro-note.html
# ※ localhost以外のHTTPはSWが効きません。常用はHTTPSの方法1/2を推奨。
```

## スマホへの導入

**iPhone (Safari):**
共有ボタン → **ホーム画面に追加** → アイコンタップでフルスクリーン起動

**Android (Chrome):**
メニュー → **アプリをインストール** または **ホーム画面に追加**

## Google Sheets 連携(任意)

設定画面の「Google Sheets連携」から、あなた自身のGoogleアカウント内のスプレッドシートに、メタ情報のみを同期できます。

- 第三者サーバーを経由しません
- 同期されるのはメタ情報のみ(本文はそもそも保存されていない)
- いつでも連携を解除できます
- セットアップ手順はアプリ内のガイドに表示されます(Apps Script コードもコピーボタン付き)

## アクセシビリティ / 設計の特徴

- **iOS型タイポグラフィ階層**: Large Title 34px / Title 22-28px / Body 17px / Footnote 13px
- **8pt(4pt)スペーシンググリッド** で一貫したリズム
- **44ptタップ領域** 確保
- **ダークモード自動切替** (`prefers-color-scheme`)
- **アニメーション削減** (`prefers-reduced-motion`)
- **セーフエリア** (notch / home indicator) 対応
- **ARIA**: tablist / dialog / status / aria-modal / aria-selected
- **キーボードフォーカス可視化** (`:focus-visible`)
- **SF Pro Text/Display + Hiragino Sans** のフォントスタック
- **数値はタブラー** (`font-feature-settings: "tnum"`) でストリーク等の桁ズレ防止

## データの場所

- 端末内 `localStorage`(キー: `kokoro-note:v2` — 後方互換のため維持)
- ブラウザのキャッシュ削除で消えます
- 設定画面の「JSONとして書き出す」で随時バックアップを取れます

## 安全について

ジャーナリングは強力なセルフケアですが、深刻な不安・抑うつ・トラウマの専門的治療の代替にはなりません。書いていてつらさが増す場合は手を止めて、信頼できる人や専門家に相談してください。

- 厚生労働省 こころの健康相談統一ダイヤル: **0570-064-556**

## 開発者向け

```bash
# 全テスト(207件)
node test-kokoro.mjs
```

テスト内容: ファイル構成 / PWA資産妥当性 / HTML構造 / CSSデザイントークン / app.jsロジック / 永続化 / Sheets同期ペイロード / シート制御 / エッジケース。

ライセンス: 個人利用は自由。
