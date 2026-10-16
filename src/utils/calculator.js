import { mul, div, sub, add, round } from 'decimalish'
import dayjs from 'dayjs'

const toMoney = (value) => round(value, { places: 2 })

/**
 * 按日均价格计算剩余价值
 * @param {Object} params - 表单中的原始字符串值
 * @param {string} params.renewalAmount - 每个付款周期的续费金额（原币种）
 * @param {string} params.exchangeRate - 1 单位原币种兑换的人民币数额
 * @param {string} params.renewalDate - 到期日期 YYYY-MM-DD
 * @param {string} params.renewalPeriod - 付款周期（月数）
 * @param {string} params.tradeDate - 交易日期 YYYY-MM-DD
 * @param {'buy'|'sell'} params.mode - 购买模式计算溢价，出售模式计算总价
 * @param {string} params.tradePrice - 对方出价（CNY），购买模式使用
 * @param {string} params.expectedPremium - 期望溢价（CNY），出售模式使用
 * @returns {{dailyPrice: string, remainingDays: number, residualValue: string, premium?: string, suggestedPrice?: string}}
 */
export function calculateResidual({
  renewalAmount,
  exchangeRate,
  renewalDate,
  renewalPeriod,
  tradeDate,
  mode,
  tradePrice,
  expectedPremium
}) {
  const expiry = dayjs(renewalDate)
  // 从到期日反推周期起始日，按实际天数计算（各月天数不同）
  const periodDays = expiry.diff(expiry.subtract(Number(renewalPeriod), 'month'), 'day')
  const remainingDays = expiry.diff(dayjs(tradeDate), 'day')

  const dailyPrice = div(mul(renewalAmount, exchangeRate), periodDays)
  const residualValue = mul(dailyPrice, remainingDays)

  const result = {
    dailyPrice: toMoney(dailyPrice),
    remainingDays,
    residualValue: toMoney(residualValue)
  }

  if (mode === 'buy') {
    result.premium = toMoney(sub(tradePrice, residualValue))
  } else {
    result.suggestedPrice = toMoney(add(residualValue, expectedPremium))
  }

  return result
}
