import dashboard from './dashboard'
import mint from './mint'
import stake from './stake'
import trade from './trade'
import wallet from './wallet'
import debt from './debt'
import shorting from './shorting'

import { formatRouter } from './formatRouter'

const children = []
const obj = { dashboard, mint, stake, trade, wallet, debt, shorting }
Object.keys(obj).forEach(key => {
    children.push(...formatRouter(key, obj[key]));
})

export default [
    {
        path: '/',
        redirect: '/home/dashboard'
    },
    {
        path: '/home',
        component: () => import('@/views/layout/index'),
        children
    }
]