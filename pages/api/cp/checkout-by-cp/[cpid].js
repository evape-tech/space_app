import nc from "next-connect";
import { prisma } from '@/utils/db'
const handler = nc();

handler.get(async (req, res, next) => {
  const { cpid } = req.query;
  const { userId } = req.query;

  let queryBody = {
    where: {
      cpIdKey: cpid,
    },
    select: {
      kWh: true,
      fee: true,
      startTime: true,
      endTime: true,
      cpile: {
        select: {
          name: true,
        },
      },
      station: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      startTime: 'desc',
    },
  };

  // Add userId filter if provided
  if (userId) {
    queryBody.where.userId = parseInt(userId);
  }

  try {
    const cpStatus = await prisma.chargingTx.findFirst(queryBody);
    
    if (!cpStatus) {
      return res.status(404).json({ 
        code: 404,
        message: "No charging transaction found" 
      });
    }
    
    res.status(200).json(cpStatus);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      code: 500,
      message: error.message,
    });
  }
});

export default handler;
