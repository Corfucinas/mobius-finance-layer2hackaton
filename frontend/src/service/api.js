import http from './http'

/**
 * @param {String} url
 * @param {Object} params
 */
 export function get(url, queryParams){ 
    return new Promise((resolve, reject) =>{ 
        http.get(url, { params: queryParams }).then(response => {
            resolve(response.data);
        }).catch(error =>{
            reject(error) 
        }) 
    })
}

  /**
 * @param {String} url
 * @param {Object} params
 */
export function post(url, postData) {
    return new Promise((resolve, reject) => {
        http.post(url, postData).then(res => {
            resolve(res.data);
        }).catch(err =>{
            reject(err.data)
        })
    })
}