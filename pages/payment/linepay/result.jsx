import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Layout from "@/components/layout";
import Navbar from "@/components/navbar";
import styles from "@/styles/verify-code.module.scss";

/**
 * LINE Pay return page
 * Expects query params from LINE Pay redirect: transactionId, orderId, returnCode, returnMessage, amount
 * Will POST to backend confirm endpoint to finalize the payment if transactionId exists.
 */
const LinePayResult = () => {
	const router = useRouter();
	const { data: session } = useSession();
	const { transactionId, orderId, returnCode, returnMessage, amount } = router.query;

	const [isVerifying, setIsVerifying] = useState(true);
	const [paymentSuccess, setPaymentSuccess] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [countdown, setCountdown] = useState(5);

	useEffect(() => {
		if (!router.isReady) return;

		console.log("LINE Pay redirect params:", { transactionId, orderId, returnCode, returnMessage, amount });

		// If there is a transactionId, try to confirm payment on backend.
		if (transactionId) {
			confirmPayment();
			return;
		}

		// Otherwise use returnCode to determine result
		if (returnCode === "0000" || returnCode === "0") {
			setPaymentSuccess(true);
		} else {
			setPaymentSuccess(false);
			setErrorMessage(returnMessage || `付款失敗（回傳代碼: ${returnCode || "unknown"}）`);
		}

		setIsVerifying(false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [router.isReady, transactionId, returnCode]);

	const confirmPayment = async () => {
		setIsVerifying(true);
		try {
			const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_API || ""}/payment/linepay/confirm`;

			const headers = { "Content-Type": "application/json" };
			if (session?.accessToken) headers["Authorization"] = `Bearer ${session.accessToken}`;

			const resp = await fetch(backendUrl, {
				method: "POST",
				headers,
				body: JSON.stringify({ transactionId, orderId, amount: amount ? parseInt(amount, 10) : undefined })
			});

			const data = await resp.json().catch(() => ({}));
			console.log("LINE Pay confirm response:", resp.status, data);

			if (resp.ok && data.success) {
				setPaymentSuccess(true);
			} else {
				// If backend doesn't provide structured response, try to interpret LINE Pay returnCode
				if (data && (data.returnCode === "0000" || data.returnCode === "0")) {
					setPaymentSuccess(true);
				} else {
					setPaymentSuccess(false);
					setErrorMessage(data.message || data.returnMessage || returnMessage || "付款確認失敗");
				}
			}
		} catch (err) {
			console.error("Confirm request failed:", err);
			setPaymentSuccess(false);
			setErrorMessage("付款確認過程發生錯誤");
		} finally {
			setIsVerifying(false);
		}
	};

	useEffect(() => {
		if (!paymentSuccess || isVerifying) return;

		const timer = setInterval(() => {
			setCountdown((prev) => {
				if (prev <= 1) {
					clearInterval(timer);
					router.push("/");
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(timer);
	}, [paymentSuccess, isVerifying, router]);

	if (isVerifying) {
		return (
			<div className="flex flex-col h-full gap-[30px] items-center justify-center text-center p-[20px]">
				<div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#01F2CF]"></div>
				<div className="text-[18px] text-gray-600">驗證付款結果中...</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full gap-[30px] items-center justify-center text-center p-[20px]">
			{paymentSuccess ? (
				<>
					<div className="text-[24px] font-bold text-[#01F2CF]">✓ 付款成功</div>

					<div className="bg-white p-6 rounded-lg shadow-lg">
						<Image src="/images/cp-done.png" alt="Payment Success" width={200} height={200} />
					</div>

					<div className="text-[16px]">您的充值已經完成！</div>

					<div className="w-full max-w-md">
						<div className="text-[14px] text-left bg-gray-50 p-4 rounded-lg space-y-2">
							{orderId && (
								<div className="flex justify-between">
									<span className="text-gray-600">訂單編號:</span>
									<span className="font-medium">{orderId}</span>
								</div>
							)}
							{transactionId && (
								<div className="flex justify-between">
									<span className="text-gray-600">交易編號:</span>
									<span className="font-medium">{transactionId}</span>
								</div>
							)}
							{amount && (
								<div className="flex justify-between">
									<span className="text-gray-600">金額:</span>
									<span className="font-medium">{amount}</span>
								</div>
							)}
						</div>
					</div>

					<div className="text-[14px] text-gray-500">{countdown} 秒後自動跳轉到首頁...</div>

					<button type="button" className={`py-3 px-6 rounded-full ${styles["btn-primary"]}`} onClick={() => router.push("/")}>立即返回首頁</button>
					<button type="button" className="py-3 px-6 rounded-full bg-gray-200 text-gray-700" onClick={() => router.push("/profile")}>查看個人資料</button>
				</>
			) : (
				<>
					<div className="text-[24px] font-bold text-red-500">✗ 付款失敗</div>

					<div className="bg-white p-6 rounded-lg shadow-lg"><div className="text-6xl">😔</div></div>

					<div className="text-[16px] text-gray-600">{errorMessage || "付款過程發生錯誤，請稍後再試"}</div>

					<div className="w-full max-w-md">
						<div className="text-[14px] text-left bg-red-50 p-4 rounded-lg space-y-2">
							{orderId && (
								<div className="flex justify-between"><span className="text-gray-600">訂單編號:</span><span className="font-medium">{orderId}</span></div>
							)}
							{transactionId && (
								<div className="flex justify-between"><span className="text-gray-600">交易編號:</span><span className="font-medium">{transactionId}</span></div>
							)}
							{returnCode && (
								<div className="flex justify-between"><span className="text-gray-600">回傳代碼:</span><span className="font-medium text-red-600">{returnCode}</span></div>
							)}
						</div>
					</div>

					<button type="button" className={`py-3 px-6 rounded-full ${styles["btn-primary"]}`} onClick={() => router.push("/profile/recharge")}>重新充值</button>
					<button type="button" className="py-3 px-6 rounded-full bg-gray-200 text-gray-700" onClick={() => router.push("/")}>返回首頁</button>
				</>
			)}
		</div>
	);
};

export default LinePayResult;

LinePayResult.getLayout = function getLayout(page) {
	return (
		<Layout header={<Navbar title="LINE Pay 付款結果" hideBack />}>{page}</Layout>
	);
};
