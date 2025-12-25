// 使用 ExchangeRate-API 的免费服务
const API_BASE_URL = 'https://api.exchangerate-api.com/v4/latest'

// 全局汇率缓存
let exchangeRateCache = {
  rates: null,        // 汇率数据对象，格式：{ USD: 7.2, EUR: 7.8, ... }
  updateTime: null,   // 更新时间
  timestamp: null     // 缓存时间戳
}

/**
 * 从完整汇率表中计算目标币种的汇率
 * @param {string} currency - 目标币种代码
 * @param {Object} rates - 完整汇率表
 * @returns {number} 汇率值
 */
function calculateRate(currency, rates) {
  const cnyToTargetRate = rates[currency]
  if (!cnyToTargetRate) {
    throw new Error(`未找到 ${currency} 汇率`)
  }
  return 1 / cnyToTargetRate
}

/**
 * 获取完整汇率表（主API）
 * @returns {Promise<{rates: Object, updateTime: string|null}>}
 */
async function fetchAllRates() {
  const response = await fetch(`${API_BASE_URL}/CNY`)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  const data = await response.json()
  return {
    rates: data.rates,
    updateTime: data.date || data.time_last_updated || null
  }
}

/**
 * 获取汇率
 * @param {string} currency - 源币种代码 (如 'USD')
 * @param {boolean} forceRefresh - 是否强制刷新缓存
 * @returns {Promise<{rate: number, updateTime: string|null}>} 汇率和更新时间
 */
export async function getExchangeRate(currency, forceRefresh = false) {
  // 如果是 CNY,直接返回 1
  if (currency === 'CNY') {
    return {
      rate: 1,
      updateTime: new Date().toISOString().split('T')[0]
    }
  }

  // 优先使用缓存（除非强制刷新）
  if (exchangeRateCache.rates && !forceRefresh) {
    console.log(`[汇率] 从缓存读取 ${currency} 汇率`)
    return {
      rate: calculateRate(currency, exchangeRateCache.rates),
      updateTime: exchangeRateCache.updateTime
    }
  }

  // 调用API获取完整汇率表
  console.log(`[汇率] ${forceRefresh ? '强制刷新' : '首次获取'}汇率数据...`)

  try {
    const data = await fetchAllRates()

    // 更新缓存
    exchangeRateCache = {
      rates: data.rates,
      updateTime: data.updateTime,
      timestamp: Date.now()
    }

    const rate = calculateRate(currency, data.rates)
    console.log(`[汇率] 获取成功: ${currency} = ${rate} CNY`)

    return {
      rate: rate,
      updateTime: data.updateTime
    }

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
    // 备用 API 获取所有支持币种的汇率
    const symbols = ['USD', 'EUR', 'GBP', 'JPY', 'HKD'].join(',')
    const response = await fetch(
      `https://api.exchangerate.host/latest?base=CNY&symbols=${symbols}`
    )
    const data = await response.json()

    if (data.success && data.rates) {
      // 更新缓存
      exchangeRateCache = {
        rates: data.rates,
        updateTime: data.date || new Date().toISOString().split('T')[0],
        timestamp: Date.now()
      }

      const rate = calculateRate(currency, data.rates)
      console.log(`[汇率] 备用API成功: ${currency} = ${rate} CNY`)
      return {
        rate: rate,
        updateTime: exchangeRateCache.updateTime
      }
    }

    throw new Error('备用 API 也失败了')

  } catch (error) {
    console.error(`[汇率] 备用API失败:`, error)

    // 清空缓存（因为API都失败了）
    exchangeRateCache = { rates: null, updateTime: null, timestamp: null }

    // 如果所有 API 都失败,返回默认汇率
    const defaultResult = getDefaultRate(currency)
    console.warn(`[汇率] 使用默认值: ${currency} = ${defaultResult.rate} CNY`)
    return defaultResult
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

  return {
    rate: defaultRates[currency] || 1,
    updateTime: null
  }
}
