import config from '@/common/config'

export const getDictLabel = (dict: DictData[], val: string | number) => {
	const findDict = dict.find(d => d.value == val)
	return findDict ? findDict.label : val
}
export const getImageUrl = (url: string | null) => {
    if (!url) {
      return ''
    }
    if (url.indexOf('http') !== -1) {
      return url
    }
    return config.IMG_URL + url
  }

export const diffDaysHandle = (startDate: string | Date, endDate: string | Date): number | string => {
    if (!startDate || !endDate) {
      return "";
    }
    const timestamp = new Date(endDate).getTime() - new Date(startDate).getTime()
    const diffDays = Math.ceil(timestamp / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  
 export const formatDate = (date: Date | string) => {
      if (!date) {
        return "";
      }
      const tmpDate = new Date(date)
		const year = tmpDate.getFullYear()
		const month = String(tmpDate.getMonth() + 1).padStart(2, '0') // 月份从0开始
		const day = String(tmpDate.getDate()).padStart(2, '0')
		return `${year}-${month}-${day}`
    }