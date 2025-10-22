# TapPay 整合說明

## 已完成的整合內容

### 1. 環境變數設定 (.env.example)
已在 `.env.example` 中定義所有 TapPay 所需的環境變數。請複製此文件為 `.env.local` 並填入您的實際值：

```env
# TapPay Configuration
NEXT_PUBLIC_TAPPAY_APP_ID=your_tappay_app_id
NEXT_PUBLIC_TAPPAY_APP_KEY=your_tappay_app_key
NEXT_PUBLIC_TAPPAY_SERVER_TYPE=sandbox  # 測試環境用 'sandbox'，正式環境用 'production'
TAPPAY_PARTNER_KEY=your_partner_key
TAPPAY_MERCHANT_ID=your_merchant_id
TAPPAY_API_URL=https://sandbox.tappaysdk.com  # 正式環境: https://prod.tappaysdk.com
```

### 2. 前端整合

#### 已更新的文件：
- **pages/_document.jsx**: 已加入 TapPay SDK script
- **pages/profile/recharge.jsx**: 充值頁面現在會導向 TapPay 支付
- **pages/profile/tappay-payment.jsx**: 新建的 TapPay 信用卡支付頁面
- **pages/profile/payment-result.jsx**: 新建的支付成功結果頁面

#### 支付流程：
1. 用戶在充值頁面輸入金額
2. 系統創建訂單
3. 導向 TapPay 支付頁面
4. 用戶輸入信用卡資訊
5. 取得 Prime 並送到後端
6. 顯示支付結果

### 3. 後端整合

#### API 端點：
- **POST /api/tappay/pay-by-prime**: 處理支付請求
- **POST /api/tappay/callback**: 處理 TapPay 回調通知

#### 功能：
- ✅ 驗證支付參數
- ✅ 呼叫 TapPay API
- ✅ 更新訂單狀態
- ✅ 創建充值記錄
- ✅ 更新用戶餘額
- ✅ 防止重複支付
- ✅ 錯誤處理

### 4. 安全性功能

- ✅ Partner Key 只存在後端，不暴露給前端
- ✅ 訂單金額驗證
- ✅ 重複支付檢查
- ✅ 完整的交易日誌記錄
- ✅ 錯誤處理機制

## 使用步驟

### 1. 設定環境變數
複製 `.env.example` 為 `.env.local`：
```bash
cp .env.example .env.local
```

然後填入您從 TapPay Portal 取得的憑證。

### 2. 測試環境
使用以下測試卡號：
- **卡號**: 4242 4242 4242 4242
- **到期日**: 任意未來日期 (例如: 01/28)
- **CVC**: 任意 3 碼 (例如: 123)

### 3. 啟動應用
```bash
npm run dev
```

### 4. 測試流程
1. 訪問 `/profile/recharge`
2. 輸入充值金額（最低 100）
3. 點擊「開始充值」
4. 在 TapPay 支付頁面填寫信用卡資訊
5. 點擊「確認付款」
6. 查看支付結果

## 正式環境部署

### 切換到正式環境：
1. 更新 `.env.local`:
   ```env
   NEXT_PUBLIC_TAPPAY_SERVER_TYPE=production
   TAPPAY_API_URL=https://prod.tappaysdk.com
   ```

2. 使用正式環境的 APP_ID、APP_KEY 和 Partner Key

3. 確保網站使用 HTTPS

### 資料庫欄位

需要在 `recharge` 表中添加以下欄位（如果尚未存在）：
```prisma
model Recharge {
  id                   Int      @id @default(autoincrement())
  userId               Int
  points               Int
  status               String   // 'success', 'failed', 'pending'
  payment_method       String?  // 'tappay_credit_card', 'ecpay', etc.
  transaction_id       String?  // TapPay rec_trade_id
  bank_transaction_id  String?  // 銀行交易 ID
  auth_code            String?  // 授權碼
  error_message        String?  // 錯誤訊息（如果失敗）
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
}
```

## TapPay 支付方式

當前實作支援：
- ✅ 信用卡支付 (Pay by Prime)

可擴展支援：
- Apple Pay
- Google Pay
- LINE Pay
- JKO Pay

## 相關連結

- [TapPay 官方文件](https://docs.tappaysdk.com/)
- [TapPay Portal](https://portal.tappaysdk.com/)
- [API Reference](https://docs.tappaysdk.com/tutorial/zh/reference.html)

## 疑難排解

### 常見錯誤

1. **取得 Prime 失敗**
   - 檢查 APP_ID 和 APP_KEY 是否正確
   - 確認信用卡資訊格式正確

2. **支付失敗**
   - 查看後端 console log
   - 檢查 Partner Key 和 Merchant ID
   - 確認測試環境使用測試卡號

3. **回調未執行**
   - 確保 callback URL 可被外部訪問
   - 檢查防火牆設定
   - 查看 TapPay Portal 的交易記錄

## 開發者注意事項

- TapPay SDK 需要在瀏覽器環境下運行，使用 `typeof window !== "undefined"` 檢查
- Prime 只能使用一次，不可重複使用
- 測試環境和正式環境的 API URL 不同
- 所有金額單位為「元」，不是「分」
