/**
 * Add Cron Here. Refer https://www.npmjs.com/package/node-cron
 * cron.schedule('* * * * *', () => {
 * console.log('running a task every minute')
 * });
 */

const { default: TransactionsModel } = require("../models/TransactionsModel")

cron.schedule("0 0 * * SAT", () => {})


// cron.schedule("*/1 * * * *", () => {
//     console.log("############################## RESULTTTTTTTTTTTTTT CALLLLLLLLLLLLLLL ##############################")

//     ResultRacebookModel.result(
//         {}, 
//         (err, data) => {
//             if (err) {
//                 console.log("return result err ::::: ", err)
//             } else {
//                 console.log("return result ::::: ", data)
//             }
//         }
//     )
// })