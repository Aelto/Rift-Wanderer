
const logs = []

export const get = () => logs.map(l => l.value).join('\n')
export const add = (str) => logs.push({ date: new Date(Date.now()), value: str })