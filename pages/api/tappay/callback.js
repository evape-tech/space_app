import prisma from '@/utils/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  console.log('TapPay callback received:', req.body);

  const {
    status,
    msg,
    rec_trade_id,
    bank_transaction_id,
    auth_code,
    order_number,
    amount,
    currency
  } = req.body;

  try {
    // 驗證支付結果
    if (status === 0) {
      // 支付成功
      console.log(`Payment successful for order: ${order_number}`);

      // 查找訂單
      const order = await prisma.order.findUnique({
        where: { orderNo: order_number }
      });

      if (!order) {
        console.error(`Order not found: ${order_number}`);
        return res.status(404).json({ message: 'Order not found' });
      }

      // 檢查訂單是否已經處理過
      if (order.status === 'paid') {
        console.log(`Order already processed: ${order_number}`);
        return res.status(200).send('OK');
      }

      // 更新訂單狀態
      await prisma.order.update({
        where: { orderNo: order_number },
        data: {
          status: 'paid',
          updatedAt: new Date()
        }
      });

      // 檢查是否已經有充值記錄
      const existingRecharge = await prisma.recharge.findFirst({
        where: {
          transaction_id: rec_trade_id || order_number
        }
      });

      if (!existingRecharge) {
        // 創建充值記錄
        await prisma.recharge.create({
          data: {
            userId: order.userId,
            points: amount,
            status: 'success',
            payment_method: 'tappay_credit_card',
            transaction_id: rec_trade_id || order_number,
            bank_transaction_id: bank_transaction_id,
            auth_code: auth_code
          }
        });

        // 更新用戶餘額
        await prisma.user.update({
          where: { id: order.userId },
          data: {
            balance: {
              increment: amount
            }
          }
        });

        console.log(`Recharge completed for user ${order.userId}, amount: ${amount}`);
      } else {
        console.log(`Recharge already exists for transaction: ${rec_trade_id}`);
      }

      return res.status(200).send('OK');
    } else {
      // 支付失敗
      console.error(`Payment failed for order ${order_number}: ${msg}`);

      // 更新訂單狀態為失敗
      await prisma.order.update({
        where: { orderNo: order_number },
        data: {
          status: 'failed',
          updatedAt: new Date()
        }
      });

      // 可以選擇性地創建失敗的充值記錄
      await prisma.recharge.create({
        data: {
          userId: order.userId,
          points: amount,
          status: 'failed',
          payment_method: 'tappay_credit_card',
          transaction_id: rec_trade_id || order_number,
          bank_transaction_id: bank_transaction_id,
          auth_code: auth_code,
          error_message: msg
        }
      });

      return res.status(200).send('OK');
    }
  } catch (error) {
    console.error('Callback processing error:', error);
    // 即使發生錯誤也要回傳 200，避免 TapPay 重複發送 callback
    return res.status(200).send('ERROR');
  }
}
