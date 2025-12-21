import Alpine from 'alpinejs'
import { calculateResidual } from './utils/calculator'
import { getExchangeRate, clearCache } from './utils/currency'

// 全局注册 Alpine.js 组件
document.addEventListener('alpine:init', () => {
  Alpine.data('calculator', () => ({
    // 当前模式: 'buy' 或 'sell'
    mode: 'buy',

    // 表单数据
    form: {
      renewalAmount: '',
      currency: 'USD',
      exchangeRate: '',
      renewalDate: '',
      renewalPeriod: '12', // 月数：1, 3, 6, 12, 24, 36, 60
      tradePrice: '',
      expectedPremium: '',
      tradeDate: new Date().toISOString().split('T')[0]
    },

    // 计算结果
    result: null,

    // 错误信息
    error: '',

    // 汇率加载状态
    exchangeRateLoading: false,

    // 初始化
    async init() {
      // 自动获取汇率
      await this.fetchExchangeRate()

      // 监听币种变化
      this.$watch('form.currency', () => {
        this.fetchExchangeRate()
      })

      // 监听模式切换，清除计算结果和错误信息
      this.$watch('mode', () => {
        this.result = null
        this.error = ''
      })
    },

    // 获取汇率
    async fetchExchangeRate(forceRefresh = false) {
      this.exchangeRateLoading = true
      this.error = ''

      try {
        // 如果强制刷新，先清除缓存
        if (forceRefresh) {
          clearCache(this.form.currency)
        }

        const rate = await getExchangeRate(this.form.currency)
        this.form.exchangeRate = rate.toString()
      } catch (err) {
        this.error = '获取汇率失败,请手动输入'
        console.error('汇率获取失败:', err)
      } finally {
        this.exchangeRateLoading = false
      }
    },

    // 刷新汇率（清除缓存后重新获取）
    refreshExchangeRate() {
      this.fetchExchangeRate(true)
    },

    // 计算结果
    calculate() {
      this.error = ''
      this.result = null

      try {
        // 验证表单
        this.validateForm()

        // 准备计算参数
        const params = {
          renewalAmount: this.form.renewalAmount,
          exchangeRate: this.form.exchangeRate,
          renewalDate: new Date(this.form.renewalDate),
          renewalPeriod: this.form.renewalPeriod,
          tradeDate: new Date(this.form.tradeDate),
          mode: this.mode,
          tradePrice: this.mode === 'buy' ? this.form.tradePrice : null,
          expectedPremium: this.mode === 'sell' ? this.form.expectedPremium : null
        }

        // 执行计算
        this.result = calculateResidual(params)

      } catch (err) {
        this.error = err.message
        console.error('计算错误:', err)
      }
    },

    // 表单验证
    validateForm() {
      // 验证续费周期
      if (!this.form.renewalPeriod || parseInt(this.form.renewalPeriod) <= 0) {
        throw new Error('请选择续费周期')
      }

      // 验证日期
      const renewalDate = new Date(this.form.renewalDate)
      const tradeDate = new Date(this.form.tradeDate)

      if (tradeDate >= renewalDate) {
        throw new Error('交易日期必须早于续费日期')
      }

      // 验证金额
      if (parseFloat(this.form.renewalAmount) <= 0) {
        throw new Error('续费金额必须大于0')
      }

      if (parseFloat(this.form.exchangeRate) <= 0) {
        throw new Error('汇率必须大于0')
      }

      if (this.mode === 'buy' && parseFloat(this.form.tradePrice) <= 0) {
        throw new Error('交易价格必须大于0')
      }
    }
  }))
})

// 启动 Alpine.js
Alpine.start()
