


const errorPage = async(req,res) =>{
    try {
        res.render("error")
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    errorPage
}