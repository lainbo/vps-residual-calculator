// 使用 ExchangeRate-API 的免费服务
const API_BASE_URL = 'https://api.exchangerate-api.com/v4/latest'

/**
 * 获取汇率
 * @param {string} currency - 源币种代码 (如 'USD')
 * @returns {Promise<number>} CNY 汇率
 */
export async function getExchangeRate(currency) {
  // 如果是 CNY,直接返回 1
  if (currency === 'CNY') {
    return 1
  }

  console.log(`[汇率] 正在获取 ${currency} 汇率...`)

  try {
    // 发起 API 请求 (以 CNY 为基准)
    const response = await fetch(`${API_BASE_URL}/CNY`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    // 从 CNY 到目标币种的汇率中计算倒数，得到目标币种到 CNY 的汇率
    const cnyToTargetRate = data.rates[currency]

    if (!cnyToTargetRate) {
      throw new Error(`未找到 ${currency} 汇率`)
    }

    // 1 目标币种 = 多少 CNY (取倒数)
    const rate = 1 / cnyToTargetRate

    console.log(`[汇率] 获取成功: ${currency} = ${rate} CNY`)

    return rate

  } catch (error) {
    console.error(`[汇率] 主API失败:`, error)

    // 如果请求失败,尝试使用备用 API
    return getFallbackRate(currency)
  }
}

/**
 * 备用汇率 API (ExchangeRate.host)
 */
async function getFallbackRate(currency) {
  console.log(`[汇率] 尝试备用API...`)
  try {
    // 备用 API 也使用 CNY 为基准
    const response = await fetch(`https://api.exchangerate.host/latest?base=CNY&symbols=${currency}`)
    const data = await response.json()

    if (data.success && data.rates[currency]) {
      // CNY 到目标币种，需要取倒数得到目标币种到 CNY
      const rate = 1 / data.rates[currency]
      console.log(`[汇率] 备用API成功: ${currency} = ${rate} CNY`)
      return rate
    }

    throw new Error('备用 API 也失败了')

  } catch (error) {
    console.error(`[汇率] 备用API失败:`, error)
    // 如果所有 API 都失败,返回默认汇率
    const defaultRate = getDefaultRate(currency)
    console.warn(`[汇率] 使用默认值: ${currency} = ${defaultRate} CNY`)
    return defaultRate
  }
}

/**
 * 默认汇率(作为最后的后备方案)
 */
function getDefaultRate(currency) {
  const defaultRates = {
    'USD': 7.2,
    'EUR': 7.8,
    'GBP': 9.1,
    'JPY': 0.048,
    'HKD': 0.92
  }

  return defaultRates[currency] || 1
}
