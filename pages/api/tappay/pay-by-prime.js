import axios from 'axios';
import prisma from '@/utils/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { prime, amount, orderId, details, name, email, phone, userId } = req.body;

  // 驗證必要參數
  if (!prime || !amount || !orderId) {
    return res.status(400).json({
      success: false,
      message: '缺少必要參數'
    });
  }

  // 驗證金額
  if (amount < 1) {
    return res.status(400).json({
      success: false,
      message: '金額必須大於 0'
    });
  }

  try {
    // 檢查訂單是否已經支付
    const existingOrder = await prisma.order.findUnique({
      where: { orderNo: orderId }
    });

    if (existingOrder && existingOrder.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: '此訂單已經支付過了'
      });
    }

    // 呼叫 TapPay API
    const tappayResponse = await axios.post(
      `${process.env.TAPPAY_API_URL}/tpc/payment/pay-by-prime`,
      {
        prime: prime,
        partner_key: process.env.TAPPAY_PARTNER_KEY,
        merchant_id: process.env.TAPPAY_MERCHANT_ID,
        amount: amount,
        currency: 'TWD',
        details: details || '充電站充值',
        cardholder: {
          phone_number: phone || '',
          name: name || '',
          email: email || ''
        },
        order_number: orderId,
        result_url: {
          frontend_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/profile/payment-result`,
          backend_notify_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/tappay/callback`
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.TAPPAY_PARTNER_KEY
        }
      }
    );

    console.log('TapPay response:', tappayResponse.data);

    if (tappayResponse.data.status === 0) {
      // 支付成功 - 更新訂單狀態
      try {
        await prisma.order.update({
          where: { orderNo: orderId },
          data: {
            status: 'paid',
            updatedAt: new Date()
          }
        });

        // 創建充值記錄
        const recharge = await prisma.recharge.create({
          data: {
            userId: userId,
            points: amount,
            status: 'success',
            payment_method: 'tappay_credit_card',
            transaction_id: tappayResponse.data.rec_trade_id || orderId,
            bank_transaction_id: tappayResponse.data.bank_transaction_id,
            auth_code: tappayResponse.data.auth_code
          }
        });

        // 更新用戶餘額
        await prisma.user.update({
          where: { id: userId },
          data: {
            balance: {
              increment: amount
            }
          }
        });

        console.log('Payment successful, recharge created:', recharge);
      } catch (dbError) {
        console.error('Database update error:', dbError);
        // 即使 DB 更新失敗，支付已經成功，需要記錄這個錯誤
      }

      return res.status(200).json({
        success: true,
        data: {
          rec_trade_id: tappayResponse.data.rec_trade_id,
          bank_transaction_id: tappayResponse.data.bank_transaction_id,
          auth_code: tappayResponse.data.auth_code,
          amount: amount,
          orderId: orderId
        }
      });
    } else {
      // 支付失敗
      console.error('TapPay payment failed:', tappayResponse.data);
      
      // 更新訂單為失敗狀態
      try {
        await prisma.order.update({
          where: { orderNo: orderId },
          data: {
            status: 'failed',
            updatedAt: new Date()
          }
        });
      } catch (dbError) {
        console.error('Database update error:', dbError);
      }

      return res.status(400).json({
        success: false,
        message: tappayResponse.data.msg || '支付失敗',
        code: tappayResponse.data.status
      });
    }
  } catch (error) {
    console.error('TapPay payment error:', error);
    
    // 記錄錯誤但不更新訂單狀態（因為可能是網路問題）
    return res.status(500).json({
      success: false,
      message: error.response?.data?.msg || error.message || '支付過程發生錯誤'
    });
  }
}
