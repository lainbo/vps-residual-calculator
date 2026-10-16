import dayjs from 'dayjs'

// ExchangeRate-API 开放接口，返回以 CNY 为基准的各币种汇率
const RATES_URL = 'https://open.er-api.com/v6/latest/CNY'

export const CURRENCIES = [
  { code: 'USD', name: '美元' },
  { code: 'EUR', name: '欧元' },
  { code: 'GBP', name: '英镑' },
  { code: 'JPY', name: '日元' },
  { code: 'HKD', name: '港币' },
  { code: 'CAD', name: '加拿大元' },
  { code: 'CNY', name: '人民币' }
]

// 最近一次成功获取的汇率表，切换币种时复用；刷新失败时保持不变
let cachedRates = null

async function fetchRates() {
  const response = await fetch(RATES_URL)
  if (!response.ok) {
    throw new Error(`汇率接口返回 HTTP ${response.status}`)
  }
  // 接口出错时 HTTP 状态仍为 200，需要看 result 字段
  const data = await response.json()
  if (data.result !== 'success') {
    throw new Error(`汇率接口返回错误: ${data['error-type']}`)
  }
  return {
    rates: data.rates,
    updateTime: dayjs.unix(data.time_last_update_unix).format('YYYY-MM-DD')
  }
}

/**
 * 获取 1 单位指定币种兑换的人民币数额，请求失败时抛出错误
 * @param {string} currency - 币种代码，取自 CURRENCIES
 * @param {boolean} forceRefresh - 是否忽略缓存重新请求
 * @returns {Promise<{rate: number, updateTime: string|null}>} updateTime 为汇率表的更新日期
 */
export async function getExchangeRate(currency, forceRefresh = false) {
  if (currency === 'CNY') {
    return { rate: 1, updateTime: null }
  }

  if (forceRefresh || !cachedRates) {
    cachedRates = await fetchRates()
  }
  const { rates, updateTime } = cachedRates
  return { rate: 1 / rates[currency], updateTime }
}
