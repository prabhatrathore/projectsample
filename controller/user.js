const userModel = require("../modal/user")
const jwt = require("jsonwebtoken")
const bcrypt = require('bcrypt')
// const "cookie-parser"=require("cookie-parser")



const create = async (req, res) => {
    try {

        let data = req.body
        // if (!(data)) return res.status(400).send({ status: false, message: "please provide details" })

        let { name,
            userName,
            email,
            password } = data

        if (!(name)) return res.status(400).send({ status: false, message: "please provide name , name is mandatory" })

        if (!(userName)) return res.status(400).send({ status: false, message: "please provide userName , userName is mandatory" })



        if (!(email)) return res.status(400).send({ status: false, message: "please provide email , email is mandatory" })

        if (!/^[a-zA-Z0-9]+[@][a-z]{3,7}[.][a-z]{2,5}$/.test(email)) return res.status(400).send({ status: false, message: " Email is not valid " })

        if (!(password)) return res.status(400).send({ status: false, message: "please provide password , password is mandatory" })

        if (password) {

            if (password?.length < 6) return res.status(400).send({ status: false, message: " Password' s length should be minimum six characters" })
        } else {
            return res.status(400).send({ status: false, message: "please provide password , password is mandatory" })
        }


        let checkUserExist = await userModel.findOne({
            $or: [{ userName: userName }, { email: email }]
        }).exec()
        if (checkUserExist && checkUserExist._id) return res.status(400).send({ status: false, message: "please provide unique userName or email, user exist in database" })



        let salt = await bcrypt.genSalt(10)

        let encrptPassword = await bcrypt.hash(password, salt)

        let userData = {
            name, userName, email, password: encrptPassword
        }
        await userModel(userData).save()
        let token = jwt.sign({

            userEmail: email, password: encrptPassword, name
        }, "secretKey"
        )
        res.status(200).send({ status: true, message: "created successfully", data: token })
    } catch (err) {
        console.log(err)
    }
}

const login = async (req, res) => {
    try {
        let loginData = req.body
        let { email, password, userName } = loginData

        if (!email && !userName) return res.status(400).send({ status: false, message: " email or userName is mandatory, kindly provide one" })


        if (email) {
            if (!/^[a-zA-Z0-9]+[@][a-z]{3,7}[.][a-z]{2,5}$/.test(email)) return res.status(400).send({ status: false, message: " Email is not valid " })
        }

        if (!(password)) return res.status(400).send({ status: false, message: "please provide password , password is mandatory" })
        if (password.length < 5) return res.status(400).send({ status: false, message: " Password' s length should be minimum six characters" })

        // let userExist = await userModel.findOne({ $or: [{ userName: userName, email: email }] })
        let userExist = {}
        if (email) {
            userExist = await userModel.findOne({ email: email }).exec()
        } else if (userName) {
            userExist = await userModel.findOne({ userName: userName }).exec()
        }
        console.log(userExist, "userExistuserExist")
        if (!userExist) return res.status(400).send({ status: false, message: " User not exist ,kindly register first" })

        const validPasswordCheck = await bcrypt.compare(password, userExist.password)

        if (!validPasswordCheck) return res.status(400).send({ status: false, message: "Invalid password" })
        let time = Date.now()
        let expTime = time + (60 * 60 * 60 * 1000)
        let token = jwt.sign({
            userId: userExist._id,
            time, expTime
        }, "secretKey")

        res.status(200).send({ message: "login details", success: true, data: { userExistId: userExist._id, token } })

    } catch (err) {
        res.status(500).send({ status: false, message: "error occur ", err })
    }
}

const get = async (req, res) => {
    try {
        let data = req.headers.authorization
        // console.log(data, "datataatata")
        let check = await jwt.verify(data, 'secretKey')
        if (!check) return res.status(400).send({ message: "Authentication failed", status: false })
        // console.log(check, "check2")
        let existUser = {}

        if (check&&check?.userId) {
            existUser = await userModel.findById(check?.userId).exec()
        } else if (check&&check?.userEmail) {
            existUser = await userModel.findOne({ email: check?.userEmail }).exec()

        }
        console.log(existUser, "existUser")
        if (existUser && existUser._id) {
            return res.status(200).send({ message: "welcome to your account ", success: true })
        } else {
            return res.status(400).send({ message: "Authentication error", status: false })
        }

    } catch (err) {
        res.status(500).send({ status: false, message: "error occur ", err })
    }
}
module.exports = { create, login, get }