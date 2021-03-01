export default {
    /* 
        author: Siddhesh Salunkhe
        description: 
    */
    getMainServer: function (url) {
        // console.log("getMainServer userUrl ::::: ", url)
        var newUrl
        if (url && url.substr(0, 5) == "https") {
            newUrl = url.substr(8)
        } else if (url && url.substr(0, 4) == "http") {
            newUrl = url.substr(7)
        } else {
            return null
        }
        // console.log("getMainServer userUrl ::::: ", newUrl)
        var userUrl = _.reverse(newUrl.split("."))
        // console.log("getMainServer userUrl ::::: ", userUrl)

        // console.log(
        //     "url of userrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr",
        //     `https://users.${userUrl[1]}.${userUrl[0]}/api/`
        // )

        if (userUrl[1] == "matrixexch9" || userUrl[1] == "fairplay") {
            // console.log("--inside matrixExch--")
            return "https://users.playexch.co/api/"
        } else {
            return `https://users.${userUrl[1]}.${userUrl[0]}/api/`
        }
    }
}
