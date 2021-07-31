export function formatRouter(root, data) {
    return Object.keys(data).map(name => {
        return {
            path: `${name}`,
            name: `${root}`,
            component: () => import(`@/views/${root}/${name}`),
            meta: data[name]
        }
    })
}
