// 使用 ExchangeRate-API 的免费服务
const API_BASE_URL = 'https://api.exchangerate-api.com/v4/latest'
const CACHE_KEY_PREFIX = 'exchange_rate_'
const CACHE_DURATION = 1000 * 60 * 60 // 1小时缓存

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

  // 检查缓存
  const cached = getCache(currency)
  if (cached) {
    console.log(`[汇率] 使用缓存: ${currency} = ${cached} CNY`)
    return cached
  }

  console.log(`[汇率] 正在获取 ${currency} 汇率...`)

  try {
    // 发起 API 请求
    const response = await fetch(`${API_BASE_URL}/${currency}`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    // 提取 CNY 汇率
    const rate = data.rates.CNY

    if (!rate) {
      throw new Error('未找到 CNY 汇率')
    }

    // 缓存结果
    setCache(currency, rate)
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
    const response = await fetch(`https://api.exchangerate.host/latest?base=${currency}&symbols=CNY`)
    const data = await response.json()

    if (data.success && data.rates.CNY) {
      const rate = data.rates.CNY
      setCache(currency, rate)
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

/**
 * 获取缓存的汇率
 */
function getCache(currency) {
  try {
    const key = CACHE_KEY_PREFIX + currency
    const cached = localStorage.getItem(key)

    if (!cached) return null

    const { rate, timestamp } = JSON.parse(cached)

    // 检查是否过期
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(key)
      return null
    }

    return rate

  } catch (error) {
    return null
  }
}

/**
 * 缓存汇率
 */
function setCache(currency, rate) {
  try {
    const key = CACHE_KEY_PREFIX + currency
    const data = {
      rate,
      timestamp: Date.now()
    }
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error('缓存失败:', error)
  }
}

/**
 * 清除汇率缓存
 * @param {string} currency - 要清除的币种，不传则清除所有
 */
export function clearCache(currency) {
  if (currency) {
    const key = CACHE_KEY_PREFIX + currency
    localStorage.removeItem(key)
    console.log(`[汇率] 已清除 ${currency} 缓存`)
  } else {
    // 清除所有汇率缓存
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(CACHE_KEY_PREFIX)) {
        localStorage.removeItem(key)
      }
    })
    console.log(`[汇率] 已清除所有缓存`)
  }
}
