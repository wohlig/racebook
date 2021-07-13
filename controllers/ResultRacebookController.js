import ResultRacebookModel from "../models/ResultRacebookModel"
import TransactionsModel from "../models/TransactionsModel"

const router = Router()

/* 
    result function
*/
router.post("/result", async (req, res) => {
    console.log("<><><>result route Controller<><><>")
    ResultRacebookModel.result(req.body, res.callback)
})

export default router