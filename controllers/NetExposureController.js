import NetExposureModel from "../models/NetExposureModel"

const router = Router()

/* 
    author: Siddhesh Salunkhe
    description: 
*/
router.post("/racebookExposureCall", (req, res) => {
    if (req.body) {
        NetExposureModel.GetNetExpoByuser(req.body, res.callback)
    } else {
        // console.log("Body not set for racebookExposureCall ", req.body)
        var responseData = {};
        responseData.status = "INVALID_TOKEN_ID";
        res.callback(null, responseData);
    }
})

export default router
