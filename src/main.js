import Alpine from 'alpinejs'
import dayjs from 'dayjs'
import { calculateResidual } from './utils/calculator'
import { CURRENCIES, getExchangeRate } from './utils/currency'

// 全局注册 Alpine.js 组件
document.addEventListener('alpine:init', () => {
  Alpine.data('calculator', () => ({
    currencies: CURRENCIES,

    // 当前模式: 'buy' 或 'sell'
    mode: 'buy',

    // 表单数据
    form: {
      renewalAmount: '',
      currency: 'USD',
      exchangeRate: '',
      renewalDate: '',
      renewalPeriod: '12', // 月数
      tradePrice: '',
      expectedPremium: '',
      tradeDate: dayjs().format('YYYY-MM-DD')
    },

    // 当前汇率所属汇率表的更新日期
    exchangeRateUpdateTime: null,
    exchangeRateLoading: false,

    // 计算结果
    result: null,

    // 错误信息
    error: '',

    init() {
      this.$watch('form.currency', () => this.fetchExchangeRate())

      // 切换模式时清除计算结果和错误信息
      this.$watch('mode', () => {
        this.result = null
        this.error = ''
      })

      this.fetchExchangeRate()
    },

    async fetchExchangeRate(forceRefresh = false) {
      const { currency } = this.form
      this.exchangeRateLoading = true
      this.error = ''

      const fetched = await getExchangeRate(currency, forceRefresh).catch((error) => {
        console.error('[汇率] 获取失败:', error)
        return null
      })
      // 请求期间已切换到其他币种时，丢弃这次结果
      if (currency !== this.form.currency) return
      this.exchangeRateLoading = false

      if (fetched) {
        this.form.exchangeRate = fetched.rate.toFixed(4)
        this.exchangeRateUpdateTime = fetched.updateTime
      } else if (forceRefresh) {
        // 刷新失败时保留输入框里原有的汇率
        this.error = '刷新汇率失败，汇率保持不变'
      } else {
        // 还没有成功获取过汇率表；输入框里如有数值，属于切换前的币种，需要清空
        this.form.exchangeRate = ''
        this.exchangeRateUpdateTime = null
        this.error = '获取汇率失败，请手动输入'
      }
    },

    calculate() {
      this.result = null
      this.error = this.validateForm()
      if (this.error) return

      this.result = calculateResidual({ ...this.form, mode: this.mode })
    },

    // 返回第一条校验错误，全部通过时返回空字符串
    validateForm() {
      const { renewalAmount, exchangeRate, renewalDate, tradeDate, tradePrice } = this.form

      if (!dayjs(tradeDate).isBefore(renewalDate)) return '交易日期必须早于到期时间'
      if (Number(renewalAmount) <= 0) return '续费金额必须大于0'
      if (Number(exchangeRate) <= 0) return '汇率必须大于0'
      if (this.mode === 'buy' && Number(tradePrice) <= 0) return '对方出价必须大于0'
      return ''
    },

    get premiumIsPositive() {
      return Number(this.result?.premium) > 0
    }
  }))
})

// 启动 Alpine.js
Alpine.start()
