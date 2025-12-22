// 只导入需要的函数,实现 tree shaking
import {
  decimal,
  mul,
  div,
  sub,
  add,
  round
} from 'decimalish'
import dayjs from 'dayjs'

/**
 * 计算剩余价值
 * @param {Object} params - 计算参数
 * @param {string|number} params.renewalAmount - 续费金额
 * @param {string|number} params.exchangeRate - 汇率
 * @param {Date} params.renewalDate - 续费日期
 * @param {string|number} params.renewalPeriod - 续费周期(月数)
 * @param {Date} params.tradeDate - 交易日期
 * @param {string} params.mode - 模式: 'buy' 或 'sell'
 * @param {string|number} params.tradePrice - 交易价格(购买模式)
 * @param {string|number} params.expectedPremium - 期望溢价(出售模式)
 * @returns {Object} 计算结果
 */
export function calculateResidual(params) {
  const {
    renewalAmount,
    exchangeRate,
    renewalDate,
    renewalPeriod,
    tradeDate,
    mode,
    tradePrice,
    expectedPremium
  } = params

  try {
    // 1. 计算总周期天数
    const months = parseInt(renewalPeriod)
    // 使用 dayjs 从到期日期反推周期开始日期
    const periodStartDate = dayjs(renewalDate).subtract(months, 'month')
    // 计算实际天数差
    const totalDays = decimal(dayjs(renewalDate).diff(periodStartDate, 'day'))

    // 2. 计算续费金额的人民币价值
    const renewalAmountDecimal = decimal(parseFloat(renewalAmount))
    const exchangeRateDecimal = decimal(parseFloat(exchangeRate))
    const renewalAmountCNY = mul(renewalAmountDecimal, exchangeRateDecimal)

    // 3. 计算日均价格
    const dailyPrice = div(renewalAmountCNY, totalDays)

    // 4. 计算剩余天数
    const timeDiff = renewalDate.getTime() - tradeDate.getTime()
    const remainingDays = decimal(Math.ceil(timeDiff / (1000 * 60 * 60 * 24)))

    // 5. 计算剩余价值
    const residualValue = mul(dailyPrice, remainingDays)

    // 6. 根据模式计算不同结果
    let result = {
      totalDays: String(totalDays),
      dailyPrice: String(round(dailyPrice, { places: 2 })),
      remainingDays: String(remainingDays),
      residualValue: String(round(residualValue, { places: 2 }))
    }

    if (mode === 'buy') {
      // 购买模式: 计算溢价
      const tradePriceDecimal = decimal(parseFloat(tradePrice))
      const premium = sub(tradePriceDecimal, residualValue)
      result.premium = String(round(premium, { places: 2 }))
    } else {
      // 出售模式: 计算建议售价
      const expectedPremiumDecimal = decimal(parseFloat(expectedPremium))
      const suggestedPrice = add(residualValue, expectedPremiumDecimal)
      result.suggestedPrice = String(round(suggestedPrice, { places: 2 }))
    }

    return result

  } catch (error) {
    throw new Error(`计算错误: ${error.message}`)
  }
}
